import json
import sys
from datetime import date
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from database import engine, SessionLocal, Base
from models import Subject, Course, Review, CourseDifficulty, ReviewRedirect

DATA_DIR = Path(__file__).resolve().parent
REVIEWS_FILE = DATA_DIR / "reviews.json"
REDIRECTS_FILE = DATA_DIR / "redirects.json"
AVERAGES_FILE = DATA_DIR / "averages.json"

def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def parse_date(text):
    return date.fromisoformat(text) if text else None

def load_reviews(session, reviews, course_ids, not_found):
    existing = {
        (review.course_id, review.difficulty, review.comment, review.review_date)
        for review in session.query(Review).all()
    }
    inserted = 0
    skipped = 0

    for entry in reviews:
        course_id = course_ids.get((entry["subject"], entry["number"]))
        if course_id is None:
            not_found.add((entry["subject"], entry["number"]))
            continue

        review_date = parse_date(entry["date"])
        key = (course_id, entry["difficulty"], entry["comment"], review_date)
        if key in existing:
            skipped += 1
            continue

        session.add(Review(
            course_id=course_id,
            difficulty=entry["difficulty"],
            comment=entry["comment"],
            review_date=review_date,
        ))
        existing.add(key)
        inserted += 1

    print(f"reviews: inserted {inserted}, skipped {skipped}")

def load_redirects(session, redirects, course_ids, not_found):
    existing = {redirect.course_id for redirect in session.query(ReviewRedirect).all()}
    inserted = 0
    skipped = 0

    for entry in redirects:
        course_id = course_ids.get((entry["subject"], entry["number"]))
        target_course_id = course_ids.get((entry["see_subject"], entry["see_number"]))
        if course_id is None:
            not_found.add((entry["subject"], entry["number"]))
        if target_course_id is None:
            not_found.add((entry["see_subject"], entry["see_number"]))
        if course_id is None or target_course_id is None:
            continue

        if course_id in existing:
            skipped += 1
            continue

        session.add(ReviewRedirect(course_id=course_id, target_course_id=target_course_id))
        existing.add(course_id)
        inserted += 1

    print(f"redirects: inserted {inserted}, skipped {skipped}")

def find_conflicting_averages(averages):
    values = {}
    for entry in averages:
        values.setdefault((entry["subject"], entry["number"]), set()).add(entry["average_difficulty"])
    return {key for key, found in values.items() if len(found) > 1}

def load_averages(session, averages, course_ids, not_found):
    existing = {row.course_id: row for row in session.query(CourseDifficulty).all()}
    conflicting = find_conflicting_averages(averages)
    seen = set()
    inserted = 0
    updated = 0
    unchanged = 0

    for entry in averages:
        key = (entry["subject"], entry["number"])
        if key in conflicting or key in seen:
            continue
        seen.add(key)

        course_id = course_ids.get(key)
        if course_id is None:
            not_found.add(key)
            continue

        value = entry["average_difficulty"]
        row = existing.get(course_id)
        if row is None:
            session.add(CourseDifficulty(course_id=course_id, average_difficulty=value))
            inserted += 1
        elif row.average_difficulty != value:
            row.average_difficulty = value
            updated += 1
        else:
            unchanged += 1

    print(f"averages: inserted {inserted}, updated {updated}, unchanged {unchanged}")
    if conflicting:
        print("averages skipped because the file lists different values for the same course:")
        for subject, number in sorted(conflicting):
            print(f"  {subject} {number}")

def main():
    reviews = load_json(REVIEWS_FILE)
    redirects = load_json(REDIRECTS_FILE)
    averages = load_json(AVERAGES_FILE)

    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    not_found = set()

    try:
        course_ids = {
            (subject_code, number): course_id
            for course_id, subject_code, number in session.query(Course.id, Subject.code, Course.number).join(Subject)
        }
        load_reviews(session, reviews, course_ids, not_found)
        load_redirects(session, redirects, course_ids, not_found)
        load_averages(session, averages, course_ids, not_found)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

    print(f"courses not found: {len(not_found)}")
    for subject, number in sorted(not_found):
        print(f"  {subject} {number}")

if __name__ == "__main__":
    main()
