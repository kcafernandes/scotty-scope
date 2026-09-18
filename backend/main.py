from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
from models import Course, Subject
from schemas import CourseOut

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "scotty scope backend is running"}

@app.get("/courses", response_model=list[CourseOut])
def get_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()

@app.get("/courses/{code}", response_model=CourseOut)
def get_course(code: str, db: Session = Depends(get_db)):
    subject_code, number = code.split(" ", 1)
    course = (
        db.query(Course)
        .join(models.Subject)
        .filter(models.Subject.code == subject_code, Course.number == number)
        .first()
    )
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.get("/subjects")
def get_subjects(db: Session = Depends(get_db)):
    return db.query(Subject).all()