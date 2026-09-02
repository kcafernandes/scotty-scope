from fastapi import FastAPI

app = FastAPI()

mock_courses = [
    {"code": "MATH 009A", "title": "First-Year Calculus"},
    {"code": "MATH 031", "title": "Linear Algebra"},
    {"code": "MATH 046", "title": "Differential Equations"},
]

@app.get("/")
def read_root():
    return {"message" : "scotty scope backend is running"}

@app.get("/courses")
def get_courses():
    return mock_courses