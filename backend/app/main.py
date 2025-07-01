import os
import json
import pandas as pd
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from sqlalchemy import func
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse

from config import Settings, settings
import models
from database import engine, get_db
import report_generator

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ZillaSec AI Backend",
    description="API for file analysis using Llama 3.3 via OpenRouter.",
    version="1.0.0",
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class FileAnalysisMetrics(BaseModel):
    score_risque: float
    confiance_analyse: float

class FileAnalysisResult(BaseModel):
    synthese: str
    anomalies: List[str]
    risques: List[str]
    recommandations: List[str]
    metriques: FileAnalysisMetrics

class FileDetails(BaseModel):
    nom: str
    type: str
    taille: int
    colonnes: List[str]
    lignes: int

class AnalysisResponse(BaseModel):
    id: int
    fichier_details: FileDetails
    resultat_analyse: FileAnalysisResult
    
    class Config:
        orm_mode = True

# Dependency to get settings
def get_settings() -> Settings:
    return settings

# OpenRouter API call function
def analyze_data_with_openrouter(data_json: str, api_key: str) -> Dict[str, Any]:
    if not api_key or api_key == "remplacez-moi-par-votre-vraie-cle":
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured.")

    prompt = {
        "instruction": "Analysez ces données d'accès et identifiez: 1) Les anomalies, 2) Les risques potentiels, 3) Les suggestions d'amélioration. Structurez la réponse en JSON en suivant ce schéma : {\"synthese\": \"\", \"anomalies\": [], \"risques\": [], \"recommandations\": [], \"metriques\": {\"score_risque\": 0.0, \"confiance_analyse\": 0.0}}.",
        "input_data": data_json,
        "constraints": "Maximum 1500 mots. Utilisez un langage technique mais accessible."
    }

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
            },
            json={
                "model": "meta-llama/llama-3-70b-instruct",
                "messages": [
                    {"role": "system", "content": prompt["instruction"]},
                    {"role": "user", "content": prompt["input_data"]}
                ]
            }
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error calling OpenRouter API: {e}")

@app.post("/analyze/", response_model=AnalysisResponse)
async def analyze_file(
    file: UploadFile = File(...),
    app_settings: Settings = Depends(get_settings),
    db: Session = Depends(get_db)
):
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in ['xlsx', 'xls', 'csv']:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an Excel or CSV file.")

    try:
        if file_extension == 'csv':
            df = pd.read_csv(file.file)
        else:
            df = pd.read_excel(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {e}")

    file_details = FileDetails(
        nom=file.filename,
        type=file_extension,
        taille=file.size,
        colonnes=list(df.columns),
        lignes=len(df)
    )

    data_json = df.to_json(orient='records')

    ai_response_raw = analyze_data_with_openrouter(data_json, app_settings.OPENROUTER_API_KEY)
    
    try:
        analysis_content = ai_response_raw['choices'][0]['message']['content']
        
        json_start_index = analysis_content.find('{')
        if json_start_index == -1:
            raise ValueError("No JSON object found in the AI response.")
            
        json_end_index = analysis_content.rfind('}') + 1
        if json_end_index == 0:
             raise ValueError("No JSON object found in the AI response.")

        json_string = analysis_content[json_start_index:json_end_index]
        
        analysis_result_data = json.loads(json_string)
        analysis_result = FileAnalysisResult(**analysis_result_data)
    except (KeyError, IndexError, json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=500, detail=f"Could not parse AI response: {e} - Raw content was: {analysis_content}")

    # Save to DB
    db_analysis = models.Analysis(
        file_name=file_details.nom,
        file_type=file_details.type,
        file_size=file_details.taille,
        file_columns=file_details.colonnes,
        file_rows=file_details.lignes,
        summary=analysis_result.synthese,
        anomalies=analysis_result.anomalies,
        risks=analysis_result.risques,
        recommendations=analysis_result.recommandations,
        risk_score=analysis_result.metriques.score_risque,
        confidence=analysis_result.metriques.confiance_analyse,
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)

    return AnalysisResponse(
        id=db_analysis.id,
        fichier_details=file_details,
        resultat_analyse=analysis_result
    )

@app.get("/analyses/", response_model=List[AnalysisResponse])
def get_analyses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    analyses = db.query(models.Analysis).offset(skip).limit(limit).all()
    response = []
    for analysis in analyses:
        response.append(AnalysisResponse(
            id=analysis.id,
            fichier_details=FileDetails(
                nom=analysis.file_name,
                type=analysis.file_type,
                taille=analysis.file_size,
                colonnes=analysis.file_columns,
                lignes=analysis.file_rows,
            ),
            resultat_analyse=FileAnalysisResult(
                synthese=analysis.summary,
                anomalies=analysis.anomalies,
                risques=analysis.risks,
                recommandations=analysis.recommendations,
                metriques=FileAnalysisMetrics(
                    score_risque=analysis.risk_score,
                    confiance_analyse=analysis.confidence,
                )
            )
        ))
    return response

@app.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(models.Analysis).filter(models.Analysis.id == analysis_id).first()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return AnalysisResponse(
        id=analysis.id,
        fichier_details=FileDetails(
            nom=analysis.file_name,
            type=analysis.file_type,
            taille=analysis.file_size,
            colonnes=analysis.file_columns,
            lignes=analysis.file_rows,
        ),
        resultat_analyse=FileAnalysisResult(
            synthese=analysis.summary,
            anomalies=analysis.anomalies,
            risques=analysis.risks,
            recommandations=analysis.recommendations,
            metriques=FileAnalysisMetrics(
                score_risque=analysis.risk_score,
                confiance_analyse=analysis.confidence,
            )
        )
    )

class DashboardMetrics(BaseModel):
    total_analyses: int
    avg_risk_score: float
    total_anomalies: int
    total_risks: int

@app.get("/dashboard/metrics/", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total_analyses = db.query(models.Analysis).count()
    avg_risk_score = db.query(func.avg(models.Analysis.risk_score)).scalar() or 0
    total_anomalies = db.query(func.sum(func.json_array_length(models.Analysis.anomalies))).scalar() or 0
    total_risks = db.query(func.sum(func.json_array_length(models.Analysis.risks))).scalar() or 0

    return DashboardMetrics(
        total_analyses=total_analyses,
        avg_risk_score=avg_risk_score,
        total_anomalies=total_anomalies,
        total_risks=total_risks,
    )

@app.get("/reports/{analysis_id}/download")
def download_report(analysis_id: int, format: str, db: Session = Depends(get_db)):
    analysis = db.query(models.Analysis).filter(models.Analysis.id == analysis_id).first()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")

    if format == "pdf":
        report_buffer = report_generator.create_pdf_report(analysis)
        media_type = "application/pdf"
        filename = f"report_{analysis_id}.pdf"
    elif format == "excel":
        report_buffer = report_generator.create_excel_report(analysis)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"report_{analysis_id}.xlsx"
    elif format == "pptx":
        report_buffer = report_generator.create_pptx_report(analysis)
        media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        filename = f"report_{analysis_id}.pptx"
    else:
        raise HTTPException(status_code=400, detail="Invalid format specified")

    return StreamingResponse(
        iter([report_buffer.getvalue()]),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to ZillaSec AI Backend"}