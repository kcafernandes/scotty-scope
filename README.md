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
