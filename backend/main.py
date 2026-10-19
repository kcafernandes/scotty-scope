import re
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, tuple_, cast, Text
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
from models import Course, Subject, Review, CourseDifficulty, ReviewRedirect, CoursePrerequisite
from schemas import CourseOut, CourseDetailOut, SeeCourseOut, ReviewOut, PrerequisiteMapCourseOut, PrerequisiteMapOut

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
def get_courses(subject: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Course).join(Subject)
    if subject:
        query = query.filter(func.upper(Subject.code) == subject.upper())
    return sorted(query.all(), key=course_sort_key)

def course_sort_key(course):
    match = re.match(r"(\d+)(.*)", course.number)
    if match is None:
        return (course.subject.code, 1, 0, course.number)
    return (course.subject.code, 0, int(match.group(1)), match.group(2))

def find_course(code, db):
    subject_code, _, number = code.partition(" ")
    course = (
        db.query(Course)
        .join(models.Subject)
        .filter(models.Subject.code == subject_code, Course.number == number)
        .first()
    )
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.get("/courses/{code}", response_model=CourseDetailOut)
def get_course(code: str, db: Session = Depends(get_db)):
    course = find_course(code, db)

    difficulty = db.query(CourseDifficulty).filter(CourseDifficulty.course_id == course.id).first()
    average_difficulty = round(difficulty.average_difficulty, 1) if difficulty else None

    review_count = db.query(func.count(Review.id)).filter(Review.course_id == course.id).scalar()

    redirect = db.query(ReviewRedirect).filter(ReviewRedirect.course_id == course.id).first()
    see_course = None
    if redirect:
        target = redirect.target_course
        see_course = SeeCourseOut(subject_code=target.subject.code, number=target.number)

    return CourseDetailOut(
        **CourseOut.model_validate(course).model_dump(),
        average_difficulty=average_difficulty,
        review_count=review_count,
        see_course=see_course,
    )

@app.get("/courses/{code}/reviews", response_model=list[ReviewOut])
def get_course_reviews(code: str, db: Session = Depends(get_db)):
    course = find_course(code, db)
    reviews = (
        db.query(Review)
        .filter(Review.course_id == course.id)
        .order_by(Review.review_date.desc().nullslast(), Review.id)
        .all()
    )
    return [
        ReviewOut(difficulty=review.difficulty, comment=review.comment, date=review.review_date)
        for review in reviews
    ]

def find_courses_with_prerequisites(codes, db):
    pairs = [tuple(code.split(" ", 1)) for code in codes if " " in code]
    if not pairs:
        return {}
    rows = (
        db.query(Subject.code, Course.number, Course.title, CoursePrerequisite)
        .select_from(Course)
        .join(Subject)
        .outerjoin(CoursePrerequisite, CoursePrerequisite.course_id == Course.id)
        .filter(tuple_(Subject.code, Course.number).in_(pairs))
        .all()
    )
    return {f"{subject_code} {number}": (title, prerequisite) for subject_code, number, title, prerequisite in rows}

def find_listed_by(db):
    rows = (
        db.query(Subject.code, Course.number, CoursePrerequisite.corequisites)
        .select_from(CoursePrerequisite)
        .join(Course, CoursePrerequisite.course_id == Course.id)
        .join(Subject)
        .filter(cast(CoursePrerequisite.corequisites, Text) != "[]")
        .all()
    )
    listed_by = {}
    for subject_code, number, corequisites in rows:
        for partner in corequisites:
            listed_by.setdefault(partner, []).append(f"{subject_code} {number}")
    return listed_by

@app.get("/courses/{code}/prerequisite-map", response_model=PrerequisiteMapOut)
def get_prerequisite_map(code: str, db: Session = Depends(get_db)):
    course = find_course(code, db)
    top = f"{course.subject.code} {course.number}"
    listed_by = find_listed_by(db)

    courses = {}
    seen = {top}
    to_visit = [top]
    while to_visit:
        found = find_courses_with_prerequisites(to_visit, db)
        next_visit = []
        for visit_code in to_visit:
            if visit_code not in found:
                continue
            title, prerequisite = found[visit_code]
            groups = prerequisite.groups if prerequisite else []
            own_partners = prerequisite.corequisites if prerequisite else []
            corequisites = own_partners + [
                partner for partner in listed_by.get(visit_code, []) if partner not in own_partners
            ]
            courses[visit_code] = PrerequisiteMapCourseOut(
                title=title,
                in_database=True,
                groups=groups,
                notes=prerequisite.notes if prerequisite else [],
                consent_of_instructor=prerequisite.consent_of_instructor if prerequisite else False,
                corequisites=corequisites,
            )
            linked_codes = [option["code"] for group in groups for option in group] + corequisites
            for linked_code in linked_codes:
                if linked_code not in seen:
                    seen.add(linked_code)
                    next_visit.append(linked_code)
        to_visit = next_visit

    return PrerequisiteMapOut(
        top=top,
        has_course_prerequisites=bool(courses[top].groups),
        courses=courses,
    )

@app.get("/subjects")
def get_subjects(db: Session = Depends(get_db)):
    return db.query(Subject).all()