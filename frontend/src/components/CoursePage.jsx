import './CoursePage.css'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

function CoursePage(){
    const { courseCode } = useParams()
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/courses/${courseCode}`)
            .then((response) => {
                if (response.status === 404) {
                    setNotFound(true)
                    setLoading(false)
                    return null
                }
                return response.json()
            })
            .then((data) => {
                if (data) {
                    setCourse(data)
                    setLoading(false)
                }
            })
    }, [courseCode])

    if (loading) {
        return <p>Loading...</p>
    }

    if (notFound) {
        return <p>Course not found.</p>
    }

    return(
        <section className="course-page">
            <h2>{course.subject.code} {course.number}</h2>

            <div className="info-grid">
                <div className="info-block block-description">
                    <h3>Course Description</h3>
                    <p>{course.title}</p>
                </div>

                <div className="info-block block-details">
                    <h3>Course Details</h3>
                    <p>Department: {course.subject.name}</p>
                </div>
            </div>
        </section>
    )
}

export default CoursePage