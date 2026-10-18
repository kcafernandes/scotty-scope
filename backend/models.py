from sqlalchemy import Column, Integer, String, Text, ForeignKey
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
