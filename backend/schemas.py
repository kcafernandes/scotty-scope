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

class PrerequisiteOptionOut(BaseModel):
    code: str
    concurrent: bool
    grade: str | None

class PrerequisiteMapCourseOut(BaseModel):
    title: str | None
    in_database: bool
    groups: list[list[PrerequisiteOptionOut]]
    notes: list[str]
    consent_of_instructor: bool
    corequisites: list[str]

class PrerequisiteMapOut(BaseModel):
    top: str
    has_course_prerequisites: bool
    courses: dict[str, PrerequisiteMapCourseOut]

class StatsOut(BaseModel):
    courses: int
    subjects: int
    reviews: int
    courses_with_prerequisite_maps: int
