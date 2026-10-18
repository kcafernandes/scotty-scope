import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchBar.css'

function SearchBar() {
    const navigate = useNavigate()
    const subjectInput = useRef(null)
    const latestSubjectRequest = useRef('')
    const [ subjects, setSubjects ] = useState([])
    const [ courses, setCourses ] = useState([])
    const [ subjectPicked, setSubjectPicked] = useState(false)
    const [ selectedSubject, setSelectedSubject ] = useState('')
    const [ subjectText, setSubjectText ] = useState('')
    const [ subjectNumber, setSubjectNumber ] = useState('')

    useEffect(() => {
        fetch('http://127.0.0.1:8000/subjects')
            .then((response) => response.json())
            .then((data) => setSubjects(data))
    }, [])

    const filteredSubjects = subjects.filter((subject) =>
        subject.code.toLowerCase().startsWith(subjectText.toLowerCase())
    )

    const filteredCourses = courses.filter((course) =>
        course.number.toLowerCase().startsWith(subjectNumber.toLowerCase())
    )

    function goToResults(subjectCode){
        navigate(`/results/${encodeURIComponent(subjectCode)}`)
    }

    function goToCourse(number){
        navigate(`/course/${encodeURIComponent(`${selectedSubject} ${number}`)}`)
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
        fetch(`http://127.0.0.1:8000/courses?subject=${encodeURIComponent(subject.code)}`)
            .then((response) => response.json())
            .then((data) => {
                if (latestSubjectRequest.current === subject.code) {
                    setCourses(data)
                }
            })
    }

    function handleSubjectChange(event){
        setSubjectText(event.target.value)
        if(subjectPicked){
            unpickSubject()
        }
    }

    function handleSubjectBoxClick(event){
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
        if(event.key === 'Enter' && event.target.value.trim() !== ''){
            const typedSubject = event.target.value.trim().toLowerCase()
            const subject = subjects.find((subject) => subject.code.toLowerCase() === typedSubject)
            if(subject){
                goToResults(subject.code)
            } else {
                alert('Subject not found.')
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
                alert('Course not found.')
            }
        }
    }

    return(
        <div className="search-bar">
            <div className="subject-field">
                <input
                    ref={subjectInput}
                    type="text"
                    placeholder="Search for courses.."
                    value={subjectText}
                    onChange={handleSubjectChange}
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

            {!subjectPicked && (
                <ul className="dropdown">
                    {filteredSubjects.map((subject) => (
                        <li key={subject.id} onClick={() => handleSubjectClick(subject)}>
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
                        onChange={(e) => setSubjectNumber(e.target.value)}
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
