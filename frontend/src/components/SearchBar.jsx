import {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchBar.css'

function SearchBar() {
    const navigate = useNavigate()
    const [ subjectPicked, setSubjectPicked] = useState(false)
    const [ selectedSubject, setSelectedSubject ] = useState('')

    const fakeSubjects = ['MATH', 'CS', 'ME']
    const fakeCourseNumbers = ['031', '111', '010']

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
        if(event.key === 'Enter'){
            navigate('/results')
        }
    }

    return(
        <div className="search-bar">
            <input type="text" placeholder="Search for courses.." onKeyDown={handleSubjectKeyDown}/>

            {!subjectPicked && (
                <ul className="dropdown">
                    {fakeSubjects.map((subject) => (
                        <li key={subject} onClick={() => handleSubjectClick(subject)}>
                            {subject}
                        </li>
                    ))}
                </ul>
            )}

            {subjectPicked && (
                <>
                    <input type="text" placeholder="Enter course number"/>

                    <ul className="dropdown">
                        {fakeCourseNumbers.map((number) => (
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