import { useState, useEffect, useId, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchBar.css'
import { coursePath, loadSubjectCourses, loadSubjects, subjectPath } from './catalog'

const LIST_MAX_HEIGHT = 320
const LIST_MIN_HEIGHT = 160
const LIST_BOTTOM_SPACE = 24

function SearchBar() {
    const navigate = useNavigate()
    const searchArea = useRef(null)
    const subjectInput = useRef(null)
    const subjectList = useRef(null)
    const latestSubjectRequest = useRef('')
    const subjectListId = useId()
    const [ listOpen, setListOpen ] = useState(false)
    const [ subjects, setSubjects ] = useState([])
    const [ courses, setCourses ] = useState([])
    const [ subjectPicked, setSubjectPicked] = useState(false)
    const [ selectedSubject, setSelectedSubject ] = useState('')
    const [ subjectText, setSubjectText ] = useState('')
    const [ subjectNumber, setSubjectNumber ] = useState('')
    const [ message, setMessage ] = useState('')

    useEffect(() => {
        loadSubjects()
            .then((data) => setSubjects(data))
            .catch(() => setMessage('Sorry, the subjects could not be loaded. Please try again.'))
    }, [])

    const filteredSubjects = subjects.filter((subject) =>
        subject.code.toLowerCase().startsWith(subjectText.toLowerCase())
    )

    const filteredCourses = courses.filter((course) =>
        course.number.toLowerCase().startsWith(subjectNumber.toLowerCase())
    )

    const subjectListShown = listOpen && !subjectPicked

    useLayoutEffect(() => {
        if (!subjectListShown) {
            return
        }
        function fitToWindow() {
            const list = subjectList.current
            const space = window.innerHeight - list.getBoundingClientRect().top - LIST_BOTTOM_SPACE
            list.style.maxHeight = `${Math.min(LIST_MAX_HEIGHT, Math.max(LIST_MIN_HEIGHT, space))}px`
        }
        fitToWindow()
        window.addEventListener('resize', fitToWindow)
        return () => window.removeEventListener('resize', fitToWindow)
    }, [subjectListShown, message])

    function closeList(returnFocus){
        if (returnFocus) {
            subjectInput.current.focus()
        }
        setListOpen(false)
    }

    function handleSearchAreaBlur(event){
        if (!searchArea.current.contains(event.relatedTarget)) {
            setListOpen(false)
        }
    }

    function subjectOptions(){
        return [...subjectList.current.querySelectorAll('[role=option]')]
    }

    function handleOptionKeyDown(event, subject){
        const options = subjectOptions()
        const index = options.indexOf(event.currentTarget)
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            options[Math.min(index + 1, options.length - 1)]?.focus()
        } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            if (index <= 0) {
                subjectInput.current.focus()
            } else {
                options[index - 1].focus()
            }
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            options[event.key === 'Home' ? 0 : options.length - 1]?.focus()
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleSubjectClick(subject)
            subjectInput.current.focus()
        } else if (event.key === 'Escape') {
            event.preventDefault()
            closeList(true)
        }
    }

    function goToResults(subjectCode){
        navigate(subjectPath(subjectCode))
    }

    function goToCourse(number){
        navigate(coursePath(`${selectedSubject} ${number}`))
    }

    function unpickSubject(){
        latestSubjectRequest.current = ''
        setSubjectPicked(false)
        setSelectedSubject('')
        setCourses([])
        setSubjectNumber('')
    }

    function handleSubjectClick(subject){
        latestSubjectRequest.current = subject.code
        setSelectedSubject(subject.code)
        setSubjectText(subject.code)
        setSubjectPicked(true)
        setCourses([])
        setSubjectNumber('')
        setMessage('')
        loadSubjectCourses(subject.code)
            .then((data) => {
                if (latestSubjectRequest.current === subject.code) {
                    setCourses(data)
                }
            })
            .catch(() => setMessage('Sorry, the courses could not be loaded. Please try again.'))
    }

    function handleSubjectChange(event){
        setMessage('')
        setSubjectText(event.target.value)
        if(subjectPicked){
            unpickSubject()
        }
    }

    function handleSubjectBoxClick(event){
        setListOpen(true)
        if(subjectPicked){
            unpickSubject()
            event.target.select()
        }
    }

    function handleClearSubject(){
        unpickSubject()
        setSubjectText('')
        subjectInput.current.focus()
    }

    function handleSubjectKeyDown(event){
        if(event.key === 'Escape'){
            setListOpen(false)
            return
        }
        if(event.key === 'ArrowDown' && !subjectPicked){
            event.preventDefault()
            setListOpen(true)
            requestAnimationFrame(() => subjectOptions()[0]?.focus())
            return
        }
        if(event.key === 'Enter' && event.target.value.trim() !== ''){
            const typedSubject = event.target.value.trim().toLowerCase()
            const subject = subjects.find((subject) => subject.code.toLowerCase() === typedSubject)
            if(subject){
                goToResults(subject.code)
            } else {
                setMessage('Subject not found.')
            }
        }
    }

    function handleNumberKeyDown(event){
        if(event.key === 'Enter'){
            const typedNumber = event.target.value.trim().toLowerCase()
            if(typedNumber === ''){
                goToResults(selectedSubject)
                return
            }
            const course = courses.find((course) => course.number.toLowerCase() === typedNumber)
            if(course){
                goToCourse(course.number)
            } else {
                setMessage('Course not found.')
            }
        }
    }

    return(
        <div className="search-bar" ref={searchArea} onBlur={handleSearchAreaBlur}>
            <div className="subject-field">
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="m20 20-3.6-3.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                    ref={subjectInput}
                    type="text"
                    placeholder="Search for courses.."
                    role="combobox"
                    aria-label="Search for a subject"
                    aria-autocomplete="list"
                    aria-controls={subjectListId}
                    aria-expanded={subjectListShown}
                    value={subjectText}
                    onChange={handleSubjectChange}
                    onFocus={() => setListOpen(true)}
                    onClick={handleSubjectBoxClick}
                    onKeyDown={handleSubjectKeyDown}
                />
                {subjectText !== '' && (
                    <button
                        type="button"
                        className="clear-subject"
                        aria-label="Clear subject"
                        onClick={handleClearSubject}
                    >
                        ×
                    </button>
                )}
            </div>

            {message && <p className="search-message" role="alert">{message}</p>}

            {!subjectPicked && (
                <ul
                    ref={subjectList}
                    id={subjectListId}
                    className={subjectListShown ? 'dropdown subject-list is-open' : 'dropdown subject-list'}
                    role="listbox"
                    aria-label="Subjects"
                >
                    {filteredSubjects.map((subject) => (
                        <li
                            key={subject.id}
                            role="option"
                            aria-selected="false"
                            tabIndex={subjectListShown ? 0 : -1}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleSubjectClick(subject)}
                            onKeyDown={(event) => handleOptionKeyDown(event, subject)}
                        >
                            {subject.code} – {subject.name}
                        </li>
                    ))}
                </ul>
            )}

            {subjectPicked && (
                <>
                    <input
                        type="text"
                        placeholder="Enter course number"
                        value={subjectNumber}
                        onChange={(e) => {
                            setMessage('')
                            setSubjectNumber(e.target.value)
                        }}
                        onKeyDown={handleNumberKeyDown}
                    />

                    <ul className="dropdown">
                        {filteredCourses.map((course) => (
                            <li key={course.id} onClick={() => goToCourse(course.number)}>
                                {course.number} – {course.title}
                            </li>
                        ))}
                    </ul>
                </>
            )}

        </div>
    )
}

export default SearchBar
