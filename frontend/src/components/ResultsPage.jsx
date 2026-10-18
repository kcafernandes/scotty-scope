import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './ResultsPage.css'

function ResultsPage(){
    const { subject }= useParams()
    const [courses, setCourses] = useState([])
    const [loadedSubject, setLoadedSubject] = useState(null)

    useEffect(()=>{
        fetch(`http://127.0.0.1:8000/courses?subject=${encodeURIComponent(subject)}`)
            .then((response) => response.json())
            .then((data) => {
                setCourses(data)
                setLoadedSubject(subject)
            })
    }, [subject])

    if (loadedSubject !== subject) {
        return <p>Loading...</p>
    }

    return(
        <section className="results-page">
            <h2>Results for {subject}</h2>

            {courses.length === 0 && (
                <p>No courses found for this subject.</p>
            )}

            {courses.length > 0 && (
                <ul className="course-list">
                {courses.map((course) => (
                  <li key={course.id} className="course-card">
                    <Link to={`/course/${course.subject.code} ${course.number}`}>
                      <span className="course-code">{course.subject.code} {course.number}</span>
                      {' – '}
                      <span className="course-title">{course.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
        </section>
    )
}

export default ResultsPage