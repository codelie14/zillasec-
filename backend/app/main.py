import os
import json
import pandas as pd
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

# Load environment variables
load_dotenv()

app = FastAPI(
    title="ZillaSec AI Backend",
    description="API for file analysis using Llama 3.3 via OpenRouter.",
    version="1.0.0",
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Default Vite dev server port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models from the specifications
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


# OpenRouter API call function
def analyze_data_with_openrouter(data_json: str) -> Dict[str, Any]:
    api_key = os.getenv("OPENROUTER_API_KEY")
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
async def analyze_file(file: UploadFile = File(...)):
    """
    Analyzes an uploaded file (Excel or CSV) and returns AI-driven insights.
    """
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

    # File details
    file_details = FileDetails(
        nom=file.filename,
        type=file_extension,
        taille=file.size,
        colonnes=list(df.columns),
        lignes=len(df)
    )

    # Convert dataframe to JSON for the API
    data_json = df.to_json(orient='records')

    # Get analysis from OpenRouter
    ai_response_raw = analyze_data_with_openrouter(data_json)
    
    # Extract the content from the response
    try:
        # The actual analysis is expected in the 'content' of the first choice's message
        analysis_content = ai_response_raw['choices'][0]['message']['content']
        # The response from the LLM is a JSON string, so we parse it
        analysis_result_data = json.loads(analysis_content)
        analysis_result = FileAnalysisResult(**analysis_result_data)
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        raise HTTPException(status_code=500, detail=f"Could not parse AI response: {e}")


    return AnalysisResponse(
        fichier_details=file_details,
        resultat_analyse=analysis_result
    )

@app.get("/")
def read_root():
    """
    Root endpoint providing a welcome message.
    """
    return {"message": "Welcome to ZillaSec AI Backend"}

# To run the app:
# uvicorn main:app --reload --app-dir backend/app