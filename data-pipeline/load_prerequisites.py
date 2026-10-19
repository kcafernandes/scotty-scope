import json
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from database import engine, SessionLocal, Base
from models import Subject, Course, CoursePrerequisite

DATA_DIR = Path(__file__).resolve().parent
PREREQUISITES_FILE = DATA_DIR / "prerequisites.json"

def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def load_prerequisites(session, prerequisites, course_ids, not_found):
    existing = {row.course_id: row for row in session.query(CoursePrerequisite).all()}
    inserted = 0
    updated = 0
    unchanged = 0

    for code, entry in prerequisites.items():
        course_id = course_ids.get(code)
        if course_id is None:
            not_found.add(code)
            continue

        groups = entry["groups"]
        notes = entry["notes"]
        consent = entry["consent_of_instructor"]
        corequisites = [partner["code"] for partner in entry.get("corequisites", [])]
        row = existing.get(course_id)
        if row is None:
            session.add(CoursePrerequisite(
                course_id=course_id,
                groups=groups,
                notes=notes,
                consent_of_instructor=consent,
                corequisites=corequisites,
            ))
            inserted += 1
        elif (
            row.groups != groups
            or row.notes != notes
            or row.consent_of_instructor != consent
            or row.corequisites != corequisites
        ):
            row.groups = groups
            row.notes = notes
            row.consent_of_instructor = consent
            row.corequisites = corequisites
            updated += 1
        else:
            unchanged += 1

    print(f"prerequisites: added {inserted}, updated {updated}, unchanged {unchanged}")

def main():
    prerequisites = load_json(PREREQUISITES_FILE)

    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    not_found = set()

    try:
        course_ids = {
            f"{subject_code} {number}": course_id
            for course_id, subject_code, number in session.query(Course.id, Subject.code, Course.number).join(Subject)
        }
        load_prerequisites(session, prerequisites, course_ids, not_found)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

    print(f"skipped because not in the database: {len(not_found)}")
    for code in sorted(not_found):
        print(f"  {code}")

if __name__ == "__main__":
    main()
