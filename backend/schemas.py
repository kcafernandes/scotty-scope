from pydantic import BaseModel

class SubjectOut(BaseModel):
    id: int
    code: str
    name: str

    class Config:
        from_attributes = True

class CourseOut(BaseModel):
    id: int
    number: str
    title: str
    min_units: int
    max_units: int
    description: str
    prerequisites_text: str | None
    subject: SubjectOut

    class Config:
        from_attributes = True
