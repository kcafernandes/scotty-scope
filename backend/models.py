from sqlalchemy import Column, Integer, String, Text, Float, Date, Boolean, JSON, ForeignKey, text
from sqlalchemy.orm import relationship
from database import Base

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True)
    number = Column(String, nullable=False)
    title = Column(String, nullable=False)
    min_units = Column(Integer, nullable=False)
    max_units = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    prerequisites_text = Column(Text, nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)

    subject = relationship("Subject")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    difficulty = Column(Integer, nullable=True)
    comment = Column(Text, nullable=False)
    review_date = Column(Date, nullable=True)

class CourseDifficulty(Base):
    __tablename__ = "course_difficulties"

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, unique=True)
    average_difficulty = Column(Float, nullable=False)

class ReviewRedirect(Base):
    __tablename__ = "review_redirects"

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, unique=True)
    target_course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    target_course = relationship("Course", foreign_keys=[target_course_id])

class CoursePrerequisite(Base):
    __tablename__ = "course_prerequisites"

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, unique=True)
    groups = Column(JSON, nullable=False)
    notes = Column(JSON, nullable=False)
    consent_of_instructor = Column(Boolean, nullable=False)
    corequisites = Column(JSON, nullable=False, server_default=text("'[]'::json"))
