import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base

ENV_FILE = Path(__file__).resolve().parent / ".env"
REQUIRED_SETTINGS = ["DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT", "DB_NAME"]

load_dotenv(ENV_FILE)

missing = [name for name in REQUIRED_SETTINGS if not os.getenv(name)]
if missing:
    sys.exit(
        f"Missing database settings: {', '.join(missing)}. "
        "Copy backend/.env.example to backend/.env and fill it in."
    )

DATABASE_URL = URL.create(
    "postgresql+psycopg2",
    username=os.environ["DB_USER"],
    password=os.environ["DB_PASSWORD"],
    host=os.environ["DB_HOST"],
    port=int(os.environ["DB_PORT"]),
    database=os.environ["DB_NAME"],
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
