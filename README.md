# scotty-scope
Building a UCR-specific course intelligence website that combines course info, professor info, historical offerings, prerequisites, ratings, and student feedback into one organized platform

---

Most people may agree that course registration is often very time consuming and unfortunately UCR is no exception. Students may find themselves switching between the course catalog, degree audit, reddit, rate my professors, the MASSIVE course difficulty database, and other relevant websites to research courses and instructors. They may also need to determine which quarters a course is typically offered, compare professor ratings, understand prerequisites, and estimate course difficulty. Overall, course registration is a very tedious process that should not be this difficult :')

By building Scotty Scope, I hope to simplify this process for fellow UCR students by making all relevant course information accessible in one place.

### Tech Stack

- **Frontend:** React (Vite)
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL, running in Docker
- **ORM:** SQLAlchemy
- **Data loading:** Python script that loads course and subject data from JSON into the database

### Setup

You need Docker Desktop, Python 3 and Node.js.

1. Create your settings files. Copy `database/.env.example` to `database/.env`, and `backend/.env.example` to `backend/.env`. These files stay on your computer and are never committed.
2. Pick a password and put it in both files: `POSTGRES_PASSWORD` in `database/.env` and `DB_PASSWORD` in `backend/.env` must be the same. To make a strong one, run `python -c "import secrets; print(secrets.token_urlsafe(24))"`.
3. Start the database: `cd database`, then `docker-compose up -d`. It only accepts connections from your own computer.
4. Start the backend:
   - Windows (PowerShell): `cd backend`, `python -m venv venv`, `venv\Scripts\activate`, `pip install -r requirements.txt`, then `uvicorn main:app --reload`
   - Mac: `cd backend`, `python3 -m venv venv`, `source venv/bin/activate`, `pip install -r requirements.txt`, then `uvicorn main:app --reload`
5. Load the data (with the venv active, from the project folder): `python data-pipeline/load_courses.py`, then `python data-pipeline/load_prerequisites.py`, and `python data-pipeline/load_reviews.py` if you have the review files (see below). All loaders are safe to run again and never delete anything.
6. Start the frontend: `cd frontend`, `npm install`, then `npm run dev`, and open the address it prints.

If a setting is missing, the backend stops and tells you which one to add to `backend/.env`.

### Data Sources and Credits

- **UCR General Catalog (2026-2027):** course titles, units, descriptions and prerequisites. These are included in the repo as `data-pipeline/courses.json`, `subjects.json` and `prerequisites.json`. The catalog PDF itself is not included.
- **Community-run UCR class difficulty database:** student difficulty ratings and written reviews. These data files (`reviews.json` and `averages.json`) are not included in the repo. `load_reviews.py` needs them in the `data-pipeline` folder. Without them, the site still works, and the course page shows its empty states ("no rating yet" and "no review yet").

### Course Data

Course titles, units, descriptions, and prerequisites come from the UCR 2026-2027 General Catalog. The database currently holds 3,800 undergraduate courses (numbered below 200) across 95 subjects, covering every department in the catalog. Courses with a range of units, like CS 190 (1 to 5 units), are supported. Graduate courses and half-unit workshops (like the WRIT 040 series) are not included yet.

The data is extracted from the catalog PDF with a parsing script, checked against the catalog, and loaded with a script that can be safely run again without creating duplicates or deleting anything.

### Search

- Pick a subject from the search bar, then optionally pick a course number
- A subject alone shows all of that subject's courses, sorted in course number order
- A subject and number goes straight to the course page, showing units, description, and prerequisites
- The subject can be changed at any time without reloading the page

### Status

Currently in active development. Progress so far:

- ✅ Frontend skeleton — search flow, results page, course page
- ✅ Backend API — FastAPI routes, connected to the frontend
- ✅ Database — PostgreSQL and SQLAlchemy models, with a Docker setup
- ✅ Real course data — 3,800 undergraduate courses across all 95 UCR subjects, loaded from the catalog
- ✅ Real search — subject and course number search backed by the database, with filtering and sorting
- 🔜 Next — professor info, historical offerings, student ratings and feedback, and prerequisites as links between courses

See [open issues](https://github.com/kcafernandes/scotty-scope/issues) for what's in progress.

> This project is currently in development, and its features and scope may change.
