import datetime
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

class SeeCourseOut(BaseModel):
    subject_code: str
    number: str

class CourseDetailOut(CourseOut):
    average_difficulty: float | None
    review_count: int
    see_course: SeeCourseOut | None

class ReviewOut(BaseModel):
    difficulty: int | None
    comment: str
    date: datetime.date | None
