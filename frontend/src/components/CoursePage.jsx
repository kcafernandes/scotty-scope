import './CoursePage.css'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import CourseRatings from './CourseRatings'
import PrerequisiteVisualizer from './PrerequisiteVisualizer'
import PageLayout from './PageLayout'
import StatusMessage from './StatusMessage'
import NotFoundPage from './NotFoundPage'
import CourseCodeText from './CourseCodeText'
import { subjectPath } from './catalog'

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

function courseTrail(subjectCode, number, subjectName) {
    return [
        { label: subjectCode, to: subjectPath(subjectCode), tooltip: subjectName },
        { label: number },
    ]
}

function CoursePage(){
    const { courseCode } = useParams()
    const [loaded, setLoaded] = useState({ code: null, status: 'loading', course: null })

    useEffect(() => {
        let active = true
        fetch(`http://127.0.0.1:8000/courses/${encodeURIComponent(courseCode)}`)
            .then((response) => {
                if (response.status === 404) {
                    return { status: 'missing', course: null }
                }
                if (!response.ok) {
                    throw new Error('Could not load course')
                }
                return response.json().then((data) => ({ status: 'ready', course: data }))
            })
            .catch(() => ({ status: 'error', course: null }))
            .then((result) => {
                if (active) {
                    setLoaded({ code: courseCode, ...result })
                }
            })
        return () => {
            active = false
        }
    }, [courseCode])

    const current = loaded.code === courseCode ? loaded : { status: 'loading', course: null }
    const [typedSubject, ...typedNumber] = courseCode.split(' ')

    if (current.status === 'missing') {
        return <NotFoundPage message={`We couldn't find the course "${courseCode}".`} />
    }

    if (current.status !== 'ready') {
        return (
            <PageLayout
                title={courseCode}
                trail={courseTrail(typedSubject, typedNumber.join(' ') || typedSubject)}
                back={{ to: subjectPath(typedSubject), label: `Back to ${typedSubject}` }}
            >
                {current.status === 'loading'
                    ? <StatusMessage>Loading {courseCode}...</StatusMessage>
                    : <StatusMessage kind="error">Sorry, {courseCode} could not be loaded. Please try again.</StatusMessage>}
            </PageLayout>
        )
    }

    const course = current.course
    const fullCode = `${course.subject.code} ${course.number}`

    const units = course.min_units === course.max_units
        ? `${course.min_units}`
        : `${course.min_units}-${course.max_units}`

    const hasLongTitle = course.title.length > LONG_TITLE_LENGTH
    const hasLongDepartment = course.subject.name.length > LONG_DEPARTMENT_LENGTH
    const hasUnitRange = course.min_units !== course.max_units

    return(
        <PageLayout
            wide
            title={fullCode}
            trail={courseTrail(course.subject.code, course.number, course.subject.name)}
            back={{ to: subjectPath(course.subject.code), label: `Back to ${course.subject.code}` }}
        >
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
                            <p>
                                {course.prerequisites_text
                                    ? <CourseCodeText text={course.prerequisites_text} currentCode={fullCode} />
                                    : 'None listed'}
                            </p>
                        </div>
                    </div>
    
                    <div className="info-block block-description">
                        <h3>Course Description</h3>
                        <div className="block-scroll">
                            <p className="description-text">
                                <CourseCodeText text={course.description} currentCode={fullCode} />
                            </p>
                        </div>
                    </div>
    
                    <PrerequisiteVisualizer
                        key={`prerequisites ${course.subject.code} ${course.number}`}
                        courseCode={`${course.subject.code} ${course.number}`}
                    />
    
                    <CourseRatings key={`${course.subject.code} ${course.number}`} course={course} />
    
                    <div className="right-column">
                        <PlaceholderBox title="Previous Professors" className="block-professors" />
                        <PlaceholderBox title="AI Overview / Ask AI" className="block-ai" />
                    </div>
                </div>
            </section>
        </PageLayout>
    )
}

export default CoursePage
