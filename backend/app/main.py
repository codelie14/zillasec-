import os
import json
import pandas as pd
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

from config import Settings, settings

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
    fichier_details: FileDetails
    resultat_analyse: FileAnalysisResult

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
    app_settings: Settings = Depends(get_settings)
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
        
        # Find the start of the JSON block
        json_start_index = analysis_content.find('{')
        if json_start_index == -1:
            raise ValueError("No JSON object found in the AI response.")
            
        # Find the end of the JSON block
        json_end_index = analysis_content.rfind('}') + 1
        if json_end_index == 0:
             raise ValueError("No JSON object found in the AI response.")

        json_string = analysis_content[json_start_index:json_end_index]
        
        analysis_result_data = json.loads(json_string)
        analysis_result = FileAnalysisResult(**analysis_result_data)
    except (KeyError, IndexError, json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=500, detail=f"Could not parse AI response: {e} - Raw content was: {analysis_content}")

    return AnalysisResponse(
        fichier_details=file_details,
        resultat_analyse=analysis_result
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to ZillaSec AI Backend"}