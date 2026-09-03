import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './ResultsPage.css'

function ResultsPage(){
    const { subject }= useParams()
    const [courses, setCourses] = useState([])

    useEffect(()=>{
        fetch('http://127.0.0.1:8000/courses')
            .then((response) => response.json())
            .then((data) => setCourses(data))
    }, [])

    return(
        <section className="results-page">
            <h2>Results for {subject}</h2>

            {courses.length === 0 && (
                <p>No courses found :(</p>
            )}

            {courses.length > 0 && (
                <ul className="course-list">
                {courses.map((course) => (
                  <li key={course.code} className="course-card">
                    <span className="course-code">{course.code}</span>
                    <span className="course-title">{course.title}</span>
                  </li>
                ))}
              </ul>
            )}
        </section>
    )
}

export default ResultsPage