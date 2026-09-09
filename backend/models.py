from sqlalchemy import Column, Integer, String, ForeignKey
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
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)

    subject = relationship("Subject")