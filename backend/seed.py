from database import SessionLocal
from models import Subject, Course

# ts a script putting starter data into the database called seeding the database

session = SessionLocal()

cs = Subject(code="CS", name="Computer Science")
math = Subject(code="MATH", name="Mathematics")

session.add_all([cs, math])
session.commit()

courses = [
    Course(number="010A", title="Introduction to Programming", subject=cs),
    Course(number="141", title="Intro to Data Retrieval", subject=cs),
    Course(number="009A", title="First-Year Calculus", subject=math),
    Course(number="031", title="Linear Algebra", subject=math),
]

session.add_all(courses)
session.commit()

session.close()

print("database seeded successfully")