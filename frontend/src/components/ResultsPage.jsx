import { useParams } from 'react-router-dom'
import './ResultsPage.css'

function ResultsPage(){
    const { subject }= useParams()
    // make a list of objects that include course code + name of the class
    // ex: CS 111 - Discrete Structures

    const mockCourses = [
        {code: 'MATH 009A', title: 'First-Year Calculus'},
        {code: 'MATH 031', title: 'Linear Algebra'},
        {code: 'MATH 046', title: 'Differential Equations'},
    ]

    return(
        <section className="results-page">
            <h2>Results for {subject}</h2>

            {mockCourses.length === 0 && (
                <p>No courses found :(</p>
            )}

            {mockCourses.length > 0 && (
                <ul className="course-list">
                {mockCourses.map((course) => (
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