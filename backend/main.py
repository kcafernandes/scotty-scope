from fastapi import FastAPI, HTTPException

app = FastAPI()

mock_courses = [
    {"code": "MATH 009A", "title": "First-Year Calculus"},
    {"code": "MATH 031", "title": "Linear Algebra"},
    {"code": "MATH 046", "title": "Differential Equations"},
]

@app.get("/")
def read_root():
    return {"message" : "scotty scope backend is running"}

@app.get("/courses/{code}")
def get_course(code:str):
    for course in mock_courses:
        if course["code"] == code:
            return course
        
    raise HTTPException(status_code=404, detail="Course not found")