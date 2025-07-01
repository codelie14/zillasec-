import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
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