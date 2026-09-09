from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models

Base.metadata.create_all(bind=engine)

app = FastAPI()

mock_courses = [
    {"code": "MATH 009A", "title": "First-Year Calculus"},
    {"code": "MATH 031", "title": "Linear Algebra"},
    {"code": "MATH 046", "title": "Differential Equations"},
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message" : "scotty scope backend is running"}

@app.get("/courses")
def get_courses():
    return mock_courses

@app.get("/courses/{code}")
def get_course(code:str):
    for course in mock_courses:
        if course["code"] == code:
            return course
        
    raise HTTPException(status_code=404, detail="Course not found")
