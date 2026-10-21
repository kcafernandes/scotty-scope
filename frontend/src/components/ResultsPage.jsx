import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './ResultsPage.css'
import PageLayout from './PageLayout'
import StatusMessage from './StatusMessage'
import NotFoundPage from './NotFoundPage'
import { coursePath, findSubject, loadSubjectCourses } from './catalog'

function ResultsPage(){
    const { subject } = useParams()
    const [loaded, setLoaded] = useState({ subject: null, status: 'loading', info: null, courses: [] })

    useEffect(() => {
        let active = true
        findSubject(subject)
            .then((info) => {
                if (!info) {
                    return { status: 'missing', info: null, courses: [] }
                }
                return loadSubjectCourses(info.code).then((courses) => ({ status: 'ready', info, courses }))
            })
            .catch(() => ({ status: 'error', info: null, courses: [] }))
            .then((result) => {
                if (active) {
                    setLoaded({ subject, ...result })
                }
            })
        return () => {
            active = false
        }
    }, [subject])

    const current = loaded.subject === subject ? loaded : { status: 'loading', info: null, courses: [] }
    const code = current.info?.code ?? subject.toUpperCase()

    if (current.status === 'missing') {
        return <NotFoundPage message={`We couldn't find a subject called "${subject}".`} />
    }

    return(
        <PageLayout
            title={`${code} courses`}
            trail={[{ label: code, tooltip: current.info?.name }]}
            back={{ to: '/', label: 'Back to search' }}
        >
            <section className="results-page">
                <h1 className="page-title">{code} courses</h1>
                {current.info && <p className="page-subtitle">{current.info.name}</p>}

                {current.status === 'loading' && <StatusMessage>Loading courses...</StatusMessage>}

                {current.status === 'error' && (
                    <StatusMessage kind="error">Sorry, the courses could not be loaded. Please try again.</StatusMessage>
                )}

                {current.status === 'ready' && current.courses.length === 0 && (
                    <StatusMessage kind="empty">No courses found for this subject.</StatusMessage>
                )}

                {current.status === 'ready' && current.courses.length > 0 && (
                    <ul className="course-list">
                        {current.courses.map((course) => (
                            <li key={course.id}>
                                <Link className="course-card" to={coursePath(`${course.subject.code} ${course.number}`)}>
                                    <span className="course-code">{course.subject.code} {course.number}</span>
                                    <span className="course-title">{course.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </PageLayout>
    )
}

export default ResultsPage
