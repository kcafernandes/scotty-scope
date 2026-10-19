import './CoursePage.css'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import CourseRatings from './CourseRatings'

const LONG_TITLE_LENGTH = 60
const LONG_DEPARTMENT_LENGTH = 40

function PlaceholderBox({ title, className }){
    return (
        <div className={`info-block ${className}`}>
            <h3>{title}</h3>
            <p className="coming-soon">Coming soon</p>
        </div>
    )
}

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

    const units = course.min_units === course.max_units
        ? `${course.min_units}`
        : `${course.min_units}-${course.max_units}`

    const hasLongTitle = course.title.length > LONG_TITLE_LENGTH
    const hasLongDepartment = course.subject.name.length > LONG_DEPARTMENT_LENGTH
    const hasUnitRange = course.min_units !== course.max_units

    return(
        <section className="course-page">
            <div className="info-grid">
                <div className={hasLongTitle ? 'info-block block-title long-title' : 'info-block block-title'}>
                    <div className="block-center">
                        <h2 className="course-code">{course.subject.code} {course.number}</h2>
                        <p className="course-title">{course.title}</p>
                    </div>
                </div>

                <div className="info-block block-department">
                    <div className="block-center">
                        <h3>Department:</h3>
                        <p className={hasLongDepartment ? 'department-name long-name' : 'department-name'}>
                            {course.subject.name}
                        </p>
                    </div>
                </div>

                <div className="info-block block-units">
                    <div className="block-center">
                        <p className={hasUnitRange ? 'units-number unit-range' : 'units-number'}>{units}</p>
                        <p className="units-label">units</p>
                    </div>
                </div>

                <div className="info-block block-prereqs">
                    <h3>Prerequisites</h3>
                    <div className="block-scroll">
                        <p>{course.prerequisites_text || 'None listed'}</p>
                    </div>
                </div>

                <div className="info-block block-description">
                    <h3>Course Description</h3>
                    <div className="block-scroll">
                        <p className="description-text">{course.description}</p>
                    </div>
                </div>

                <PlaceholderBox title="Prerequisite Visualizer" className="block-visualizer" />

                <CourseRatings key={`${course.subject.code} ${course.number}`} course={course} />

                <div className="right-column">
                    <PlaceholderBox title="Previous Professors" className="block-professors" />
                    <PlaceholderBox title="AI Overview / Ask AI" className="block-ai" />
                </div>
            </div>
        </section>
    )
}

export default CoursePage
