import os
import json
import datetime
import pandas as pd
import requests
import logging
import io
from logging.handlers import RotatingFileHandler
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy import func, inspect, case
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi.responses import StreamingResponse
from datetime import timedelta

from config import Settings, settings
import models
from database import engine, get_db
import report_generator

#<editor-fold desc="Logging Configuration">
# Ensure logs directory exists
os.makedirs("C:/ZillaSec/logs", exist_ok=True)

# Backend Logger
backend_logger = logging.getLogger("backend")
backend_logger.setLevel(logging.INFO)
backend_handler = RotatingFileHandler("C:/ZillaSec/logs/backend.log", maxBytes=10485760, backupCount=5, encoding='utf-8')
backend_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
backend_handler.setFormatter(backend_formatter)
backend_logger.addHandler(backend_handler)

# Frontend Logger
frontend_logger = logging.getLogger("frontend")
frontend_logger.setLevel(logging.INFO)
frontend_handler = RotatingFileHandler("C:/ZillaSec/logs/frontend.log", maxBytes=10485760, backupCount=5)
frontend_handler.setFormatter(backend_formatter) # Can use the same formatter
frontend_logger.addHandler(frontend_handler)
#</editor-fold>

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ZillaSec AI Backend",
    description="API for file analysis and dashboard data.",
    version="1.1.0",
)

#<editor-fold desc="Exception Handler">
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    backend_logger.error(f"Unhandled exception for {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )
#</editor-fold>

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

#<editor-fold desc="User Management Endpoints">

class User(BaseModel):
    id: int
    nom: Optional[str] = None
    prenom: Optional[str] = None
    cuid: Optional[str] = None
    statut: Optional[str] = None
    domaine: Optional[str] = None
    cluster: Optional[str] = None
    affiliate: Optional[str] = None

    class Config:
        from_attributes = True

@app.get("/api/users", response_model=List[User])
def get_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = Query(None),
    status: Optional[List[str]] = Query(None),
    cluster: Optional[List[str]] = Query(None),
    domain: Optional[List[str]] = Query(None),
    affiliate: Optional[List[str]] = Query(None),
):
    query = db.query(models.GnocData)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            models.GnocData.nom.ilike(search_term) |
            models.GnocData.prenom.ilike(search_term) |
            models.GnocData.cuid.ilike(search_term) |
            models.GnocData.mail_huawei.ilike(search_term) |
            models.GnocData.mail_orange.ilike(search_term)
        )
    
    if status:
        query = query.filter(models.GnocData.statut.in_(status))
    if cluster:
        query = query.filter(models.GnocData.cluster.in_(cluster))
    if domain:
        query = query.filter(models.GnocData.domaine.in_(domain))
    if affiliate:
        query = query.filter(models.GnocData.affiliate.in_(affiliate))

    users = query.offset(skip).limit(limit).all()
    return users

@app.post("/api/users/import")
async def import_users(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in ['xlsx', 'csv']:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an Excel or CSV file.")

    try:
        if file_extension == 'csv':
            df = pd.read_csv(file.file)
        else:
            df = pd.read_excel(file.file)
        
        backend_logger.info(f"Importing file '{file.filename}'. Original columns: {df.columns.tolist()}")

        # Renommer les colonnes pour correspondre au modèle GnocData
        column_mapping = {
            'CUID': 'cuid', 'Id Huawei': 'id_huawei', 'Nom': 'nom', 'Prenom': 'prenom',
            'Mail Huawei': 'mail_huawei', 'Mail Orange': 'mail_orange', 'Numero de Telephone': 'telephone',
            'Perimeter': 'perimeter', 'Affiliate': 'affiliate', 'Statut': 'statut',
            'Cluster': 'cluster', 'Domaine': 'domaine', 'Plateforme': 'plateforme'
        }
        df = df.rename(columns=column_mapping)
        backend_logger.info(f"Columns after rename: {df.columns.tolist()}")

        # Clean CUIDs in DataFrame and deduplicate
        if 'cuid' in df.columns:
            backend_logger.info(f"Rows before deduplication: {len(df)}")
            df['cuid'] = df['cuid'].astype(str).str.strip()
            df.drop_duplicates(subset='cuid', keep='last', inplace=True)
            backend_logger.info(f"Rows after deduplication: {len(df)}")
        else:
            backend_logger.warning("No 'cuid' column found after renaming. Cannot process file.")
            raise HTTPException(status_code=400, detail="File must contain a 'CUID' column.")

        # Replace NaN with None for database compatibility
        df = df.replace({pd.NA: None, pd.NaT: None, float('nan'): None})

        # Garder uniquement les colonnes qui existent dans le modèle
        model_columns = [c.name for c in models.GnocData.__table__.columns]
        df = df[[col for col in df.columns if col in model_columns]]
        
        # Data validation and separation
        data_to_insert = df.to_dict(orient='records')
        
        # Get all existing CUIDs from the database, also cleaned
        existing_cuids = {c[0].strip() for c in db.query(models.GnocData.cuid).all()}
        
        new_users = []
        users_to_update = []

        for record in data_to_insert:
            cuid = record.get('cuid')
            if cuid:
                if cuid in existing_cuids:
                    users_to_update.append(record)
                else:
                    new_users.append(record)
        
        backend_logger.info(f"Found {len(new_users)} new users and {len(users_to_update)} users to update.")

        # Bulk insert for new users
        if new_users:
            db.bulk_insert_mappings(models.GnocData, new_users)
            backend_logger.info(f"Bulk inserted {len(new_users)} new users.")
        
        # Bulk update for existing users
        if users_to_update:
            for user_data in users_to_update:
                db.query(models.GnocData).filter(models.GnocData.cuid == user_data['cuid']).update(user_data)
            backend_logger.info(f"Updated {len(users_to_update)} existing users.")

        db.commit()
        return {"message": f"{len(new_users)} users created, {len(users_to_update)} users updated."}

    except Exception as e:
        db.rollback()
        backend_logger.error(f"Error importing user data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")

@app.get("/api/users/export")
def export_users(db: Session = Depends(get_db)):
    try:
        users = db.query(models.GnocData).all()
        if not users:
            raise HTTPException(status_code=404, detail="No users to export.")
            
        df = pd.DataFrame([user.__dict__ for user in users])
        # Nettoyer le dataframe pour l'export
        df = df.drop(columns=['_sa_instance_state', 'id'])

        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)

        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=users_export_{datetime.datetime.now().strftime('%Y%m%d')}.csv"}
        )
    except Exception as e:
        backend_logger.error(f"Error exporting user data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error exporting data: {e}")

class UserUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    id_huawei: Optional[str] = None
    cuid: Optional[str] = None
    mail_huawei: Optional[str] = None
    mail_orange: Optional[str] = None
    telephone: Optional[str] = None
    perimeter: Optional[str] = None
    affiliate: Optional[str] = None
    statut: Optional[str] = None
    cluster: Optional[str] = None
    domaine: Optional[str] = None
    plateforme: Optional[str] = None

@app.put("/api/users/{user_id}", response_model=User)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.GnocData).filter(models.GnocData.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/api/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.GnocData).filter(models.GnocData.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"ok": True}

@app.delete("/api/gnocdata/clear", status_code=204)
def clear_gnocdata_table(db: Session = Depends(get_db)):
    try:
        num_rows_deleted = db.query(models.GnocData).delete()
        db.commit()
        backend_logger.info(f"GnocData table cleared successfully. {num_rows_deleted} rows deleted.")
        return {"message": f"Table cleared successfully. {num_rows_deleted} rows deleted."}
    except Exception as e:
        db.rollback()
        backend_logger.error(f"Error clearing GnocData table: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error clearing table.")

class BulkDeleteRequest(BaseModel):
    ids: List[int]

@app.post("/api/gnocdata/bulk-delete", status_code=204)
def bulk_delete_users(request: BulkDeleteRequest, db: Session = Depends(get_db)):
    if not request.ids:
        raise HTTPException(status_code=400, detail="No user IDs provided.")
    
    try:
        db.query(models.GnocData).filter(models.GnocData.id.in_(request.ids)).delete(synchronize_session=False)
        db.commit()
        backend_logger.info(f"Successfully deleted {len(request.ids)} users.")
        return {"message": "Users deleted successfully."}
    except Exception as e:
        db.rollback()
        backend_logger.error(f"Error during bulk delete: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error during bulk delete.")

#</editor-fold>

#<editor-fold desc="Frontend Logging Endpoint">
class LogRequest(BaseModel):
    level: str
    message: str
    error: Optional[str] = None

@app.post("/api/log-error")
async def log_frontend_error(log_request: LogRequest):
    log_message = f"FE_LOG - {log_request.message}"
    if log_request.error:
        log_message += f" | Error: {log_request.error}"
    
    if log_request.level == 'error':
        frontend_logger.error(log_message)
    elif log_request.level == 'warn':
        frontend_logger.warning(log_message)
    else:
        frontend_logger.info(log_message)
        
    return {"status": "logged"}
#</editor-fold>

#<editor-fold desc="Dashboard Models">
class SecurityPulseMetric(BaseModel):
    value: str
    change: str
    trend: str

class SecurityPulseData(BaseModel):
    total_accounts: SecurityPulseMetric
    active_sessions: SecurityPulseMetric
    high_risk_accounts: SecurityPulseMetric
    api_success_rate: SecurityPulseMetric

class ClusterStatusData(BaseModel):
    labels: List[str]
    values: List[int]

class CriticalAlert(BaseModel):
    type: str
    count: Optional[int] = None
    location: Optional[str] = None
    accounts: Optional[List[str]] = None
    endpoint: Optional[str] = None
    error_rate: Optional[str] = None

class RecentActivityItem(BaseModel):
    time: str
    user: str
    action: str
    status: str

class SystemStatusItem(BaseModel):
    component: str
    status: int

class DashboardDataResponse(BaseModel):
    security_pulse: SecurityPulseData
    cluster_status: ClusterStatusData
    critical_alerts: List[CriticalAlert]
    recent_activity: List[RecentActivityItem]
    system_status: List[SystemStatusItem]
#</editor-fold>

#<editor-fold desc="Analytics Models">
class AnalyticsMetric(BaseModel):
    value: str
    change: str

class AnalyticsKeyMetrics(BaseModel):
    total: AnalyticsMetric
    active: AnalyticsMetric
    disabled: AnalyticsMetric

class ChartData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]

class AnalyticsDetailRow(BaseModel):
    affiliate: str
    total: int
    comptesGNOC: int
    comptesAffiliate: int
    comptesAdmin: int
    change: str

class AnalyticsDataResponse(BaseModel):
    key_metrics: AnalyticsKeyMetrics
    pie_chart_data: ChartData
    line_chart_data: ChartData
    details_table: List[AnalyticsDetailRow]
    affiliates_list: List[str]
#</editor-fold>

#<editor-fold desc="Existing API Models">
class ChatRequest(BaseModel):
    question: str
    context: str
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

class Metadata(BaseModel):
    fichier: str
    date_analyse: str
    lignes_analysees: int

class Statistiques(BaseModel):
    total_comptes: int
    comptes_actifs: int
    comptes_desactives: int
    comptes_admin: int
    comptes_filiale: int
    comptes_support: int

class IncoherenceStatut(BaseModel):
    nom: str
    prenom: str
    statut_fichier: str
    statut_bd: str

class VerificationBD(BaseModel):
    comptes_presents: int
    comptes_absents: int
    incoherences_statut: List[IncoherenceStatut]

class Alertes(BaseModel):
    admin_desactives: int
    acces_sensibles_desactives: int
    doublons_cuid: List[str]

class DetailCompte(BaseModel):
    nom: str
    prenom: str
    id_huawei: str
    cuid: str
    statut: str
    present_en_bd: bool
    statut_bd: str | None

class CustomAnalysisResult(BaseModel):
    metadata: Metadata
    statistiques: Statistiques
    verification_bd: VerificationBD
    alertes: Alertes
    details_comptes: List[DetailCompte]

class FileDetails(BaseModel):
    nom: str
    type: str
    taille: int
    colonnes: List[str]
    lignes: int

class AnalysisResponse(BaseModel):
    id: int
    fichier_details: FileDetails
    resultat_analyse: CustomAnalysisResult
    
    class Config:
        from_attributes = True
#</editor-fold>

#<editor-fold desc="New Data Endpoints">
@app.get("/api/dashboard-data", response_model=DashboardDataResponse)
def get_dashboard_data(db: Session = Depends(get_db)):
    try:
        backend_logger.info("Fetching dashboard data.")
        # 1. Security Pulse
        now = datetime.datetime.utcnow()
        yesterday = now - timedelta(days=1)

        total_accounts = db.query(models.FileData).count()
        total_accounts_yesterday = db.query(models.FileData).filter(models.FileData.created_at < yesterday).count()
        
        active_accounts = db.query(models.FileData).filter(models.FileData.statut.ilike('%active%')).count()
        active_accounts_yesterday = db.query(models.FileData).filter(models.FileData.created_at < yesterday, models.FileData.statut.ilike('%active%')).count()

        high_risk_accounts = db.query(models.FileData).filter(models.FileData.statut.ilike('%disabled%')).count() # Example logic
        high_risk_accounts_yesterday = db.query(models.FileData).filter(models.FileData.created_at < yesterday, models.FileData.statut.ilike('%disabled%')).count()

        def get_change_str(current, previous):
            if previous == 0:
                return "+∞" if current > 0 else "0"
            change = current - previous
            return f"+{change}" if change >= 0 else str(change)

        security_pulse = SecurityPulseData(
            total_accounts=SecurityPulseMetric(value=f"{total_accounts:,}", change=get_change_str(total_accounts, total_accounts_yesterday), trend="📈"),
            active_sessions=SecurityPulseMetric(value=f"{active_accounts:,}", change=get_change_str(active_accounts, active_accounts_yesterday), trend="📉"),
            high_risk_accounts=SecurityPulseMetric(value=f"{high_risk_accounts:,}", change=get_change_str(high_risk_accounts, high_risk_accounts_yesterday), trend="🔴"),
            api_success_rate=SecurityPulseMetric(value="98.7%", change="+0.8%", trend="✅"), # Static as per design
        )

        # 2. Cluster Status
        cluster_data = db.query(models.FileData.cluster, func.count(models.FileData.id)).filter(models.FileData.statut.ilike('%active%')).group_by(models.FileData.cluster).all()
        cluster_status = ClusterStatusData(
            labels=[c[0] for c in cluster_data if c[0]],
            values=[c[1] for c in cluster_data if c[0]]
        )

        # 3. Critical Alerts (Static as per design)
        critical_alerts = [
            CriticalAlert(type="unusual_access", count=12, location="ABJ", accounts=["EMP20345", "EMP21567"]),
            CriticalAlert(type="api_throttling", endpoint="/analyze", error_rate="4.8%")
        ]

        # 4. Recent Activity (Partially dynamic from analyses table)
        recent_analyses = db.query(models.Analysis).order_by(models.Analysis.created_at.desc()).limit(3).all()
        recent_activity = [
            RecentActivityItem(
                time=an.created_at.strftime("%H:%M"), 
                user="admin", # Assuming admin uploads
                action="File Upload", 
                status="✅"
            ) for an in recent_analyses
        ]
        if not recent_activity: # Add placeholder if empty
            recent_activity = [
                RecentActivityItem(time="10:23", user="admin", action="File Upload", status="✅"),
                RecentActivityItem(time="09:45", user="j.doe", action="Risk Review", status="⚠️"),
            ]


        # 5. System Status (Static as per design)
        system_status = [
            SystemStatusItem(component="AI Engine", status=100),
            SystemStatusItem(component="Database", status=95),
            SystemStatusItem(component="API", status=98)
        ]

        return DashboardDataResponse(
            security_pulse=security_pulse,
            cluster_status=cluster_status,
            critical_alerts=critical_alerts,
            recent_activity=recent_activity,
            system_status=system_status,
        )
    except Exception as e:
        backend_logger.error(f"Error fetching dashboard data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not fetch dashboard data.")

@app.get("/api/analytics-data", response_model=AnalyticsDataResponse)
def get_analytics_data(
    cluster: Optional[str] = Query(None),
    affiliate: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        backend_logger.info(f"Fetching analytics data for cluster '{cluster}' and affiliate '{affiliate}'.")
        # Base query
        query = db.query(models.FileData)
        
        # Affiliate list for dropdown
        affiliates_query = db.query(models.FileData.affiliate).distinct()

        # Apply filters
        if cluster and cluster != 'all':
            query = query.filter(models.FileData.cluster == cluster)
            affiliates_query = affiliates_query.filter(models.FileData.cluster == cluster)

        if affiliate and affiliate != 'all':
            query = query.filter(models.FileData.affiliate == affiliate)

        filtered_data = query.all()
        
        affiliates_list = [row[0] for row in affiliates_query.all() if row[0]]

        # 1. Key Metrics
        total = len(filtered_data)
        active = sum(1 for d in filtered_data if d.statut and 'active' in d.statut.lower())
        disabled = sum(1 for d in filtered_data if d.statut and 'disabled' in d.statut.lower())
        activation_rate = (active / total * 100) if total > 0 else 0
        
        key_metrics = AnalyticsKeyMetrics(
            total=AnalyticsMetric(value=f"{total:,}", change="+3.1%"), # Placeholder change
            active=AnalyticsMetric(value=f"{active:,} ({activation_rate:.1f}%)", change="+2.4%"),
            disabled=AnalyticsMetric(value=f"{disabled:,}", change="-1.2%"), # Placeholder
        )

        # 2. Pie Chart Data
        if affiliate and affiliate != 'all':
            # Data for a single selected affiliate
            affiliate_data = next((d for d in filtered_data if d.affiliate == affiliate), None)
            if affiliate_data:
                # Placeholder logic for account types
                pie_chart_data = ChartData(
                    labels=['Comptes GNOC', 'Comptes Affiliate', 'Comptes Admin'],
                    datasets=[{
                        "data": [total // 2, total // 3, total // 6], # Example distribution
                        "backgroundColor": ['#4e79a7', '#f28e2b', '#e15759'],
                    }]
                )
            else:
                pie_chart_data = ChartData(labels=[], datasets=[])
        else:
            # Data for all (or cluster-filtered) affiliates
            affiliate_counts = db.query(
                models.FileData.affiliate, 
                func.count(models.FileData.id)
            ).filter(models.FileData.affiliate.isnot(None))
            
            if cluster and cluster != 'all':
                affiliate_counts = affiliate_counts.filter(models.FileData.cluster == cluster)
                
            affiliate_counts = affiliate_counts.group_by(models.FileData.affiliate).order_by(func.count(models.FileData.id).desc()).limit(12).all()

            pie_chart_data = ChartData(
                labels=[row[0] for row in affiliate_counts],
                datasets=[{
                    "data": [row[1] for row in affiliate_counts],
                    "backgroundColor": ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab', '#86bc42', '#bf5b17'],
                }]
            )

        # 3. Line Chart Data (Domains)
        domain_query = db.query(
            models.FileData.domaine,
            func.count(models.FileData.id)
        ).filter(models.FileData.domaine.isnot(None))
        
        if cluster and cluster != 'all':
            domain_query = domain_query.filter(models.FileData.cluster == cluster)
        if affiliate and affiliate != 'all':
            domain_query = domain_query.filter(models.FileData.affiliate == affiliate)
            
        domain_counts = domain_query.group_by(models.FileData.domaine).all()
        
        line_chart_data = ChartData(
            labels=[row[0] for row in domain_counts],
            datasets=[{
                "label": 'Comptes Actifs par Domaine',
                "data": [row[1] for row in domain_counts],
                "borderColor": '#4e79a7',
                "backgroundColor": 'rgba(78, 121, 167, 0.1)',
                "fill": True,
                "tension": 0.3,
            }]
        )

        # 4. Details Table
        table_query = db.query(
            models.FileData.affiliate,
            func.count(models.FileData.id).label("total"),
            func.sum(case((models.FileData.domaine == 'IN', 1), else_=0)).label("gnoc"), # Example logic
            func.sum(case((models.FileData.domaine == 'CS', 1), else_=0)).label("affiliate"), # Example logic
            func.sum(case((models.FileData.domaine == 'PS', 1), else_=0)).label("admin") # Example logic
        ).filter(models.FileData.affiliate.isnot(None))

        if cluster and cluster != 'all':
            table_query = table_query.filter(models.FileData.cluster == cluster)
        
        table_data = table_query.group_by(models.FileData.affiliate).all()

        details_table = [
            AnalyticsDetailRow(
                affiliate=row.affiliate,
                total=row.total,
                comptesGNOC=row.gnoc,
                comptesAffiliate=row.affiliate,
                comptesAdmin=row.admin,
                change="+1.0%" # Placeholder
            ) for row in table_data
        ]

        return AnalyticsDataResponse(
            key_metrics=key_metrics,
            pie_chart_data=pie_chart_data,
            line_chart_data=line_chart_data,
            details_table=details_table,
            affiliates_list=affiliates_list,
        )
    except Exception as e:
        backend_logger.error(f"Error fetching analytics data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not fetch analytics data.")
#</editor-fold>

# Dependency to get settings
def get_settings() -> Settings:
    return settings

# OpenRouter API call function
def analyze_data_with_openrouter(data_json: str, api_key: str, instruction: str) -> Dict[str, Any]:
    if not api_key or api_key == "remplacez-moi-par-votre-vraie-cle":
        backend_logger.error("OpenRouter API key is not configured.")
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured.")

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
            },
            json={
                "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",
                "messages": [
                    {"role": "system", "content": instruction},
                    {"role": "user", "content": data_json}
                ]
            }
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        backend_logger.error(f"Error calling OpenRouter API: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error calling OpenRouter API: {e}")

@app.post("/analyze/", response_model=AnalysisResponse)
async def analyze_file(
    file: UploadFile = File(...),
    instruction: str = Form("Analyze data: identify anomalies, risks, and improvements. Respond in valid, RFC 8259 compliant JSON ONLY. Do NOT include comments or any other text outside the JSON structure. The JSON should be: {\"synthese\": \"\", \"anomalies\": [], \"risques\": [], \"recommandations\": [], \"metriques\": {\"score_risque\": 0.0, \"confiance_analyse\": 0.0}}."),
    app_settings: Settings = Depends(get_settings),
    db: Session = Depends(get_db)
):
    backend_logger.info(f"Starting file analysis for {file.filename}")
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in ['xlsx', 'xls', 'csv']:
        backend_logger.warning(f"Invalid file type uploaded: {file_extension}")
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an Excel or CSV file.")

    try:
        if file_extension == 'csv':
            df = pd.read_csv(file.file)
        else:
            df = pd.read_excel(file.file)
    except Exception as e:
        backend_logger.error(f"Error reading uploaded file {file.filename}: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Error reading file: {e}")

    file_details = FileDetails(
        nom=file.filename,
        type=file_extension,
        taille=file.size,
        colonnes=list(df.columns),
        lignes=len(df)
    )

    # Limit the DataFrame rows sent to the AI if it exceeds the maximum allowed
    df_to_analyze = df.head(app_settings.MAX_AI_INPUT_ROWS)
    data_json = df_to_analyze.to_json(orient='records')

    if len(df) > app_settings.MAX_AI_INPUT_ROWS:
        backend_logger.warning(f"File {file.filename} truncated. Only the first {app_settings.MAX_AI_INPUT_ROWS} rows were sent to the AI for analysis.")

    
    ai_response_raw = analyze_data_with_openrouter(data_json, app_settings.OPENROUTER_API_KEY, instruction)
    
    analysis_content = "" # Initialize analysis_content
    try:
        if 'choices' not in ai_response_raw or not ai_response_raw['choices']:
            backend_logger.error(f"AI response missing 'choices' key or is empty: {ai_response_raw}")
            raise ValueError("AI response missing expected 'choices' data.")

        analysis_content = ai_response_raw['choices'][0]['message']['content']
        
        # Clean the AI response to extract only the JSON part.
        # It handles responses wrapped in ```json ... ```.
        json_string = analysis_content.strip()
        if json_string.startswith("```json"):
            json_string = json_string[7:] # Remove ```json
        if json_string.endswith("```"):
            json_string = json_string[:-3] # Remove ```
        json_string = json_string.strip()

        # Find the start and end of the JSON object
        json_start_index = json_string.find('{')
        json_end_index = json_string.rfind('}') + 1

        if json_start_index == -1 or json_end_index == 0:
            raise ValueError("No valid JSON object found in the AI response after cleaning.")

        json_string = json_string[json_start_index:json_end_index]
        
        analysis_result_data = json.loads(json_string)
        # Validate with the new Pydantic model
        analysis_result = CustomAnalysisResult(**analysis_result_data)
    except (KeyError, IndexError, json.JSONDecodeError, ValueError) as e:
        backend_logger.error(f"Could not parse or validate AI response: {e} - Raw content was: {analysis_content}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Could not parse or validate AI response: {e} - Raw content was: {analysis_content}")

    # Save to DB
    db_analysis = models.Analysis(
        file_name=file_details.nom,
        file_type=file_details.type,
        file_size=file_details.taille,
        file_columns=file_details.colonnes,
        file_rows=file_details.lignes,
        analysis_result=analysis_result.dict(),
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    backend_logger.info(f"Saved analysis for {file.filename} with ID {db_analysis.id}")

    # Save file data to the new table
    try:
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
        backend_logger.info(f"Successfully saved {len(df)} rows from {file.filename} to file_data table.")
    except Exception as e:
        db.rollback()
        backend_logger.error(f"Error saving file data to database for analysis ID {db_analysis.id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error saving file data to database: {e}")

    return AnalysisResponse(
        id=db_analysis.id,
        fichier_details=file_details,
        resultat_analyse=analysis_result_data
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
            resultat_analyse=analysis.analysis_result
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
        resultat_analyse=analysis.analysis_result
    )

class DashboardMetrics(BaseModel):
    total_analyses: int
    avg_risk_score: float
    total_anomalies: int
    total_risks: int

@app.get("/dashboard/metrics/", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total_analyses = db.query(models.Analysis).count()
    # The following metrics are no longer available with flexible analysis results
    avg_risk_score = 0
    total_anomalies = 0
    total_risks = 0

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

    try:
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
    except Exception as e:
        backend_logger.error(f"Error generating report for analysis ID {analysis_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error generating report")

@app.get("/")
def read_root():
    return {"message": "Welcome to ZillaSec AI Backend"}

@app.post("/chat/", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    app_settings: Settings = Depends(get_settings),
    db: Session = Depends(get_db)
):
    try:
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
            backend_logger.error(f"Could not parse AI response for chat: {ai_response_raw}")
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
    except HTTPException:
        raise # Re-raise HTTPException so FastAPI handles it
    except Exception as e:
        backend_logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred in the chat endpoint.")

@app.get("/conversations/", response_model=List[Conversation])
def get_conversations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    conversations = db.query(models.Conversation).order_by(models.Conversation.created_at.desc()).offset(skip).limit(limit).all()
    return conversations

# Pydantic Models for FileData
class FileDataBase(BaseModel):
    nom: str | None = None
    prenom: str | None = None
    id_huawei: str | None = None
    cuid: str | None = None
    mail_huawei: str | None = None
    mail_orange: str | None = None
    numero_telephone: str | None = None
    domaine: str | None = None
    cluster: str | None = None
    statut: str | None = None
    analysis_id: int | None = None

class FileDataCreate(FileDataBase):
    pass

class FileDataUpdate(FileDataBase):
    pass

class FileDataInDB(FileDataBase):
    id: int
    created_at: datetime.datetime

    class Config:
        orm_mode = True

# FileData CRUD Endpoints
@app.get("/filedata/", response_model=List[FileDataInDB])
def read_file_data(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    file_data = db.query(models.FileData).offset(skip).limit(limit).all()
    return file_data

@app.get("/filedata/{file_data_id}", response_model=FileDataInDB)
def read_single_file_data(file_data_id: int, db: Session = Depends(get_db)):
    db_file_data = db.query(models.FileData).filter(models.FileData.id == file_data_id).first()
    if db_file_data is None:
        raise HTTPException(status_code=404, detail="FileData not found")
    return db_file_data

@app.put("/filedata/{file_data_id}", response_model=FileDataInDB)
def update_file_data(file_data_id: int, file_data: FileDataUpdate, db: Session = Depends(get_db)):
    db_file_data = db.query(models.FileData).filter(models.FileData.id == file_data_id).first()
    if db_file_data is None:
        raise HTTPException(status_code=404, detail="FileData not found")
    
    update_data = file_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_file_data, key, value)
    
    db.commit()
    db.refresh(db_file_data)
    return db_file_data

@app.delete("/filedata/{file_data_id}", response_model=FileDataInDB)
def delete_file_data(file_data_id: int, db: Session = Depends(get_db)):
    db_file_data = db.query(models.FileData).filter(models.FileData.id == file_data_id).first()
    if db_file_data is None:
        raise HTTPException(status_code=404, detail="FileData not found")
    
    db.delete(db_file_data)
    db.commit()
    return db_file_data

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
        backend_logger.error(f"Error reading table {table_name}: {e}", exc_info=True)
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
        backend_logger.info(f"Table {table_name} cleared successfully.")
        return {"message": f"Table {table_name} cleared successfully."}
    except Exception as e:
        db.rollback()
        backend_logger.error(f"Error clearing table {table_name}: {e}", exc_info=True)
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

        backend_logger.info(f"Row deleted successfully from {table_name}.")
        return {"message": f"Row deleted successfully from {table_name}."}
    except Exception as e:
        db.rollback()
        backend_logger.error(f"Error deleting row from {table_name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error deleting row: {e}")