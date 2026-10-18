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

    // "4" when fixed, "1-5" when it varies
    const units = course.min_units === course.max_units
        ? `${course.min_units}`
        : `${course.min_units}-${course.max_units}`

    return(
        <section className="course-page">
            <h2>{course.subject.code} {course.number}</h2>
            <p className="course-subtitle">{course.title}</p>

            <div className="info-grid">
                <div className="info-block block-description">
                    <h3>Course Description</h3>
                    <p>{course.description}</p>
                </div>

                <div className="info-block block-details">
                    <h3>Course Details</h3>
                    <p>Department: {course.subject.name}</p>
                    <p>Units: {units}</p>
                </div>

                <div className="info-block block-prereqs">
                    <h3>Prerequisites</h3>
                    <p>{course.prerequisites_text || 'None listed'}</p>
                </div>
            </div>
        </section>
    )
}

export default CoursePage