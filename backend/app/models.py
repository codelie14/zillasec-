import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Boolean
from database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # File details
    file_name = Column(String, index=True)
    file_type = Column(String)
    file_size = Column(Integer)
    file_columns = Column(JSON)
    file_rows = Column(Integer)

    # Analysis results
    summary = Column(String)
    anomalies = Column(JSON)
    risks = Column(JSON)
    recommendations = Column(JSON)
    
    # Metrics
    risk_score = Column(Float)
    confidence = Column(Float)

class FileData(Base):
    __tablename__ = "file_data"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String)
    prenom = Column(String)
    id_huawei = Column(String)
    cuid = Column(String)
    mail_huawei = Column(String)
    mail_orange = Column(String)
    numero_telephone = Column(String)
    domaine = Column(String)
    cluster = Column(String)
    statut = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    analysis_id = Column(Integer, nullable=True)

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    category = Column(String)
    type = Column(String)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_used = Column(DateTime)
    usage_count = Column(Integer, default=0)
    is_default = Column(Boolean, default=False)
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String)
    answer = Column(String)
    context = Column(String)
    file_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)