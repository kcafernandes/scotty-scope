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

### Status

Currently in active development. Progress so far:

- ✅ Frontend skeleton — search flow, results page, course page
- ✅ Backend skeleton — FastAPI routes, connected to the frontend
- 🔄 Database integration — PostgreSQL and SQLAlchemy models in place, migrating from mock data to real queries

See [open issues](https://github.com/kcafernandes/scotty-scope/issues) for what's in progress.

> This project is currently in development, and its features and scope may change.
