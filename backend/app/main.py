import os
import json
import datetime
import pandas as pd
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form
from sqlalchemy import func, inspect
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
class ChatRequest(BaseModel):
    question: str
    context: str # 'database' or a file_id
    file_id: int | None = None

class ChatResponse(BaseModel):
    answer: str

class Conversation(BaseModel):
    id: int
    question: str
    answer: str
    context: str
    file_id: int | None = None
    created_at: datetime.datetime

    class Config:
        orm_mode = True

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
def analyze_data_with_openrouter(data_json: str, api_key: str, instruction: str) -> Dict[str, Any]:
    if not api_key or api_key == "remplacez-moi-par-votre-vraie-cle":
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured.")

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
            },
            json={
                "model": "meta-llama/llama-3.3-70b-instruct:free",
                "messages": [
                    {"role": "system", "content": instruction},
                    {"role": "user", "content": data_json}
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
    instruction: str = Form("Analysez ces données d'accès et identifiez: 1) Les anomalies, 2) Les risques potentiels, 3) Les suggestions d'amélioration. Structurez la réponse en JSON en suivant ce schéma : {\"synthese\": \"\", \"anomalies\": [], \"risques\": [], \"recommandations\": [], \"metriques\": {\"score_risque\": 0.0, \"confiance_analyse\": 0.0}}."),
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

    
    ai_response_raw = analyze_data_with_openrouter(data_json, app_settings.OPENROUTER_API_KEY, instruction)
    
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

    # Save file data to the new table
    for index, row in df.iterrows():
        file_data = models.FileData(
            nom=row.get("Nom"),
            prenom=row.get("Prenom"),
            id_huawei=row.get("Id Huawei"),
            cuid=row.get("CUID"),
            mail_huawei=row.get("Mail Huawei"),
            mail_orange=row.get("Mail Orange"),
            numero_telephone=row.get("Numero de Telephone"),
            domaine=row.get("Domaine"),
            cluster=row.get("Cluster"),
            statut=row.get("Statut"),
            analysis_id=db_analysis.id,
        )
        db.add(file_data)
    db.commit()

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

@app.post("/chat/", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    app_settings: Settings = Depends(get_settings),
    db: Session = Depends(get_db)
):
    if request.context == 'database':
        # This is a simplified example. A real implementation would
        # fetch relevant data from the DB based on the question.
        all_analyses = db.query(models.Analysis).limit(10).all()
        context_data = json.dumps([r.__dict__ for r in all_analyses], default=str)
        instruction = f"En vous basant sur ces données d'analyse de la base de données, répondez à la question suivante : {request.question}"
    elif request.context == 'file' and request.file_id:
        analysis = db.query(models.Analysis).filter(models.Analysis.id == request.file_id).first()
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis file not found")
        context_data = json.dumps(analysis.__dict__, default=str)
        instruction = f"En vous basant sur les données de ce fichier d'analyse, répondez à la question suivante : {request.question}"
    else:
        raise HTTPException(status_code=400, detail="Invalid chat context or missing file_id")

    ai_response_raw = analyze_data_with_openrouter(context_data, app_settings.OPENROUTER_API_KEY, instruction)
    
    try:
        answer = ai_response_raw['choices'][0]['message']['content']
    except (KeyError, IndexError):
        raise HTTPException(status_code=500, detail="Could not parse AI response")

    db_conversation = models.Conversation(
        question=request.question,
        answer=answer,
        context=request.context,
        file_id=request.file_id
    )
    db.add(db_conversation)
    db.commit()

    return ChatResponse(answer=answer)

@app.get("/conversations/", response_model=List[Conversation])
def get_conversations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    conversations = db.query(models.Conversation).order_by(models.Conversation.created_at.desc()).offset(skip).limit(limit).all()
    return conversations
import datetime

# Pydantic Models for Templates
class TemplateBase(BaseModel):
    name: str
    description: str | None = None
    category: str
    type: str
    content: str
    is_default: bool = False

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(TemplateBase):
    pass

class Template(TemplateBase):
    id: int
    created_at: datetime.datetime
    last_used: datetime.datetime | None = None
    usage_count: int

    class Config:
        orm_mode = True

# Template CRUD Endpoints

@app.post("/templates/", response_model=Template)
def create_template(template: TemplateCreate, db: Session = Depends(get_db)):
    db_template = models.Template(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@app.get("/templates/", response_model=List[Template])
def read_templates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    templates = db.query(models.Template).offset(skip).limit(limit).all()
    return templates

@app.get("/templates/{template_id}", response_model=Template)
def read_template(template_id: int, db: Session = Depends(get_db)):
    db_template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return db_template

@app.put("/templates/{template_id}", response_model=Template)
def update_template(template_id: int, template: TemplateUpdate, db: Session = Depends(get_db)):
    db_template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    
    for key, value in template.dict().items():
        setattr(db_template, key, value)
    
    db.commit()
    db.refresh(db_template)
    return db_template

@app.delete("/templates/{template_id}", response_model=Template)
def delete_template(template_id: int, db: Session = Depends(get_db)):
    db_template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(db_template)
    db.commit()
    return db_template

# Database Management Endpoints
@app.get("/database/tables/", response_model=List[str])
def get_table_names(db: Session = Depends(get_db)):
    inspector = inspect(db.bind)
    return inspector.get_table_names()

@app.get("/database/tables/{table_name}")
def get_table_content(table_name: str, db: Session = Depends(get_db)):
    inspector = inspect(db.bind)
    if not table_name in inspector.get_table_names():
        raise HTTPException(status_code=404, detail="Table not found")
    
    try:
        df = pd.read_sql_table(table_name, db.bind)
        return df.to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading table: {e}")

@app.delete("/database/tables/{table_name}/clear")
def clear_table(table_name: str, db: Session = Depends(get_db)):
    inspector = inspect(db.bind)
    if not table_name in inspector.get_table_names():
        raise HTTPException(status_code=404, detail="Table not found")
    
    try:
        table = models.Base.metadata.tables[table_name]
        db.execute(table.delete())
        db.commit()
        return {"message": f"Table {table_name} cleared successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error clearing table: {e}")

@app.delete("/database/tables/{table_name}/rows")
def delete_table_row(table_name: str, row: Dict[str, Any], db: Session = Depends(get_db)):
    inspector = inspect(db.bind)
    if not table_name in inspector.get_table_names():
        raise HTTPException(status_code=404, detail="Table not found")
    
    try:
        table = models.Base.metadata.tables[table_name]
        
        # Build a chain of .where() clauses
        delete_stmt = table.delete()
        for col, val in row.items():
            delete_stmt = delete_stmt.where(table.c[col] == val)

        result = db.execute(delete_stmt)
        db.commit()

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Row not found or could not be deleted.")

        return {"message": f"Row deleted successfully from {table_name}."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting row: {e}")