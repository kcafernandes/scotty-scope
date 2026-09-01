import {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchBar.css'

function SearchBar() {
    const navigate = useNavigate()
    const [ subjectPicked, setSubjectPicked] = useState(false)
    const [ selectedSubject, setSelectedSubject ] = useState('')
    const [ subjectText, setSubjectText ] = useState('')
    const [ subjectNumber, setSubjectNumber ] = useState('')

    const fakeSubjects = ['MATH', 'CS', 'ME']
    const fakeCourseNumbers = ['031', '111', '010']

    // narrow subjects
    const filteredSubjects = fakeSubjects.filter((subject) =>
        subject.toLowerCase().startsWith(subjectText.toLowerCase())
    )

    // narrow down numbers
    const filteredNumbers = fakeCourseNumbers.filter((number) =>
        number.startsWith(subjectNumber)
    )

    // now takes the actual subject that was clicked, and remembers it
    function handleSubjectClick(subject){
        setSelectedSubject(subject)
        setSubjectPicked(true)
    }

    // now takes the number that was clicked, and builds a real URL
    function handleNumberClick(number){
        navigate(`/course/${selectedSubject}${number}`)
    }

    function handleSubjectKeyDown(event){
        if(event.key === 'Enter' && event.target.value.trim() !== ''){
            navigate(`/results/${event.target.value}`)
        }
    }

    function handleNumberKeyDown(event){
        if(event.key === 'Enter'){
            const typedNumber = event.target.value
            if(fakeCourseNumbers.includes(typedNumber)){
                navigate(`/course/${selectedSubject}${typedNumber}`)
            } else {
                alert('Course not found.')
            }
        }
    }

    return(
        <div className="search-bar">
            <input 
                type="text" 
                placeholder="Search for courses.." 
                value={subjectText}
                onChange={(e) => setSubjectText(e.target.value)}
                onKeyDown={handleSubjectKeyDown}
            />

            {!subjectPicked && (
                <ul className="dropdown">
                    {filteredSubjects.map((subject) => (
                        <li key={subject} onClick={() => handleSubjectClick(subject)}>
                            {subject}
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
                        {filteredNumbers.map((number) => (
                            <li key={number} onClick={() => handleNumberClick(number)}>
                                {number}
                            </li>
                        ))}
                    </ul>
                </>
            )}

        </div>
    )
}

export default SearchBar