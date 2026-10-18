import json
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from database import engine, SessionLocal, Base
from models import Subject, Course

DATA_DIR = Path(__file__).resolve().parent
COURSES_FILE = DATA_DIR / "courses.json"
SUBJECTS_FILE = DATA_DIR / "subjects.json"

UPDATABLE_FIELDS = ["title", "min_units", "max_units", "description", "prerequisites_text"]

def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def sync_subjects(session, subject_names):
    existing = {subject.code: subject for subject in session.query(Subject).all()}
    subjects = {}
    inserted = 0
    renamed = 0
    unchanged = 0

    for code, name in subject_names.items():
        subject = existing.get(code)
        if subject is None:
            subject = Subject(code=code, name=name)
            session.add(subject)
            inserted += 1
        elif subject.name != name:
            print(f"renamed subject {code}: {subject.name} -> {name}")
            subject.name = name
            renamed += 1
        else:
            unchanged += 1
        subjects[code] = subject

    session.flush()
    print(f"subjects: inserted {inserted}, renamed {renamed}, unchanged {unchanged}")
    return subjects

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

    courses = load_json(COURSES_FILE)
    subject_names = load_json(SUBJECTS_FILE)

    missing_subjects = sorted({entry["subject"] for entry in courses} - set(subject_names))
    if missing_subjects:
        sys.exit(f"Stopped: these subject codes are in courses.json but not in subjects.json: {', '.join(missing_subjects)}. Nothing was changed.")

    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    inserted = 0
    updated = 0
    unchanged = 0
    skipped = 0

    try:
        subjects = sync_subjects(session, subject_names)
        existing_courses = {
            (course.subject_id, course.number): course for course in session.query(Course).all()
        }

        for entry in courses:
            subject = subjects[entry["subject"]]
            values = course_values(entry)
            course = existing_courses.get((subject.id, entry["number"]))

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

    print(f"courses: inserted {inserted}, updated {updated}, unchanged {unchanged}")
    if skipped:
        print(f"{skipped} existing courses differ from the file but were not changed (run with --update to update them)")

if __name__ == "__main__":
    main()
