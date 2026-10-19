import './CoursePeek.css'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const peekCache = new Map()

function ExpandIcon(){
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <path
                d="M9 2h5v5M14 2 8.5 7.5M7 14H2V9M2 14l5.5-5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function PeekRating({ course, onNavigate }){
    if (course.average_difficulty !== null) {
        const count = course.review_count
        return (
            <>
                <p className="peek-rating">
                    <span className="peek-rating-value">{course.average_difficulty.toFixed(1)}</span> / 10
                </p>
                <p className="peek-muted">
                    {count === 0 ? 'No written reviews yet' : `${count} written ${count === 1 ? 'review' : 'reviews'}`}
                </p>
            </>
        )
    }

    if (course.see_course) {
        const seeCode = `${course.see_course.subject_code} ${course.see_course.number}`
        return (
            <p>
                Ratings for this course appear under{' '}
                <button type="button" className="peek-link" onClick={() => onNavigate(seeCode)}>{seeCode}</button>
            </p>
        )
    }

    return <p className="peek-muted">No ratings yet</p>
}

function PeekContent({ course, headingId, onNavigate }){
    const units = course.min_units === course.max_units
        ? `${course.min_units}`
        : `${course.min_units}-${course.max_units}`

    return (
        <>
            <h2 id={headingId} className="peek-code">{course.subject.code} {course.number}</h2>
            <p className="peek-title">{course.title}</p>

            <div className="peek-facts">
                <div className="peek-fact">
                    <span className="peek-label">Department</span>
                    <span>{course.subject.name}</span>
                </div>
                <div className="peek-fact">
                    <span className="peek-label">Units</span>
                    <span className="peek-units">{units}</span>
                </div>
            </div>

            <section className="peek-section">
                <h3>Course Description</h3>
                <div className="peek-description">{course.description}</div>
            </section>

            <section className="peek-section">
                <h3>Prerequisites</h3>
                <p>{course.prerequisites_text || 'None listed'}</p>
            </section>

            <section className="peek-section">
                <h3>Difficulty Rating</h3>
                <PeekRating course={course} onNavigate={onNavigate} />
            </section>
        </>
    )
}

function CoursePeek({ code, onClose, onNavigate }){
    const panelRef = useRef(null)
    const headingId = useId()
    const [loaded, setLoaded] = useState({ code: null, course: null, failed: false })
    const cached = peekCache.get(code)

    useEffect(() => {
        if (peekCache.has(code)) {
            return
        }
        fetch(`http://127.0.0.1:8000/courses/${encodeURIComponent(code)}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Could not load course')
                }
                return response.json()
            })
            .then((data) => {
                peekCache.set(code, data)
                setLoaded({ code, course: data, failed: false })
            })
            .catch(() => setLoaded({ code, course: null, failed: true }))
    }, [code])

    useEffect(() => {
        panelRef.current?.focus()
    }, [code])

    const course = cached ?? (loaded.code === code ? loaded.course : null)
    const failed = !cached && loaded.code === code && loaded.failed

    function keepFocusInside(event) {
        if (event.key !== 'Tab') {
            return
        }
        const focusable = [...panelRef.current.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')]
        if (focusable.length === 0) {
            event.preventDefault()
            return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
            event.preventDefault()
            last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
        }
    }

    return createPortal(
        <div
            className="peek-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    event.preventDefault()
                    onClose()
                }
            }}
        >
            <aside
                ref={panelRef}
                className="peek-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby={course ? headingId : undefined}
                aria-label={course ? undefined : `Course peek for ${code}`}
                tabIndex={-1}
                onKeyDown={keepFocusInside}
            >
                <div className="peek-toolbar">
                    <button type="button" className="peek-open" onClick={() => onNavigate(code)}>
                        <ExpandIcon />
                        Open full page
                    </button>
                    <button type="button" className="peek-close" aria-label="Close course peek" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="peek-body">
                    {course && <PeekContent course={course} headingId={headingId} onNavigate={onNavigate} />}
                    {!course && !failed && <p className="peek-status">Loading {code}...</p>}
                    {failed && (
                        <p className="peek-status">Sorry, {code} could not be loaded right now. Please try again.</p>
                    )}
                </div>
            </aside>
        </div>,
        document.body,
    )
}

export default CoursePeek
