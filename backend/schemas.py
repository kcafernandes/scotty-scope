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
    subject: SubjectOut

    class Config:
        from_attributes = True