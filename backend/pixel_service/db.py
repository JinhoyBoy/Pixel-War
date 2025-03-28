from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/pixelwar")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Pixel-Datenbank-Modell
class Pixel(Base):
    __tablename__ = "pixels"
    id = Column(Integer, primary_key=True, index=True)
    x = Column(Integer, nullable=False)
    y = Column(Integer, nullable=False)
    color = Column(String, nullable=False)
    player = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Erstellt die Datenbank-Tabellen
def init_db():
    Base.metadata.create_all(bind=engine)
