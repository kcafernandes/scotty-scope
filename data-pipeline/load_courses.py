import json
import sys
from pathlib import Path

# the backend uses flat imports (from database import ...), so add backend/ to the path
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from database import engine, SessionLocal, Base
from models import Subject, Course

# loads real UCR courses from courses.json into the database
# new courses are inserted; existing courses (same subject code + number) are left alone,
# unless you run with --update, which also refreshes their title, units, description and prerequisites
# nothing is ever deleted
#
# usage (from the project folder, with the backend venv):
#   python data-pipeline/load_courses.py            insert new courses only
#   python data-pipeline/load_courses.py --update   insert new courses and update existing ones

COURSES_FILE = Path(__file__).resolve().parent / "courses.json"

SUBJECT_NAMES = {
    "CS": "Computer Science",
    "MATH": "Mathematics",
}

UPDATABLE_FIELDS = ["title", "min_units", "max_units", "description", "prerequisites_text"]

def get_or_create_subject(session, code):
    subject = session.query(Subject).filter(Subject.code == code).first()
    if subject is None:
        subject = Subject(code=code, name=SUBJECT_NAMES[code])
        session.add(subject)
        session.flush()
    return subject

def course_values(entry):
    return {
        "title": entry["title"],
        "min_units": entry["min_units"],
        "max_units": entry["max_units"],
        "description": entry["description"],
        "prerequisites_text": entry["prerequisites_text"] or None,
    }

def main():
    update = "--update" in sys.argv[1:]

    Base.metadata.create_all(bind=engine)

    with open(COURSES_FILE, encoding="utf-8") as f:
        courses = json.load(f)

    session = SessionLocal()
    inserted = 0
    updated = 0
    unchanged = 0
    skipped = 0

    try:
        subjects = {code: get_or_create_subject(session, code) for code in SUBJECT_NAMES}

        for entry in courses:
            subject = subjects[entry["subject"]]
            values = course_values(entry)

            course = (
                session.query(Course)
                .filter(Course.subject_id == subject.id, Course.number == entry["number"])
                .first()
            )

            if course is None:
                session.add(Course(number=entry["number"], subject=subject, **values))
                inserted += 1
                continue

            changed = [field for field in UPDATABLE_FIELDS if getattr(course, field) != values[field]]
            if not changed:
                unchanged += 1
            elif update:
                for field in changed:
                    setattr(course, field, values[field])
                print(f"updated {subject.code} {course.number}: {', '.join(changed)}")
                updated += 1
            else:
                skipped += 1

        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

    print(f"inserted {inserted}, updated {updated}, unchanged {unchanged}")
    if skipped:
        print(f"{skipped} existing courses differ from the file but were not changed (run with --update to update them)")

if __name__ == "__main__":
    main()
