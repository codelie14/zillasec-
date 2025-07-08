import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Boolean
from database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # File details
    file_name = Column(String(255), index=True)
    file_type = Column(String(255))
    file_size = Column(Integer)
    file_columns = Column(JSON)
    file_rows = Column(Integer)

    

class FileData(Base):
    __tablename__ = "file_data"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255))
    prenom = Column(String(255))
    id_huawei = Column(String(255))
    cuid = Column(String(255))
    mail_huawei = Column(String(255))
    mail_orange = Column(String(255))
    numero_telephone = Column(String(255))
    domaine = Column(String(255))
    cluster = Column(String(255))
    statut = Column(String(255))
    perimeter = Column(String(255), nullable=True)  # New column
    affiliate = Column(String(255), nullable=True)  # New column
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    analysis_id = Column(Integer, nullable=True)

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    description = Column(String(255))
    category = Column(String(255))
    type = Column(String(255))
    content = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_used = Column(DateTime)
    usage_count = Column(Integer, default=0)
    is_default = Column(Boolean, default=False)
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String(255))
    answer = Column(String(255))
    context = Column(String(255))
    file_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)