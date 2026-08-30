import {useState} from 'react'
import './SearchBar.css'

function SearchBar() {
    const [ subjectPicked, setSubjectPicked] = useState(false)

    // test subject names to see if it works
    const fakeSubjects = ['MATH', 'CS', 'ME']

    // fake course numbers
    const fakeCourseNumbers = ['031', '111', '010']


    // function that runs when someone clicks  subject option
    function handleSubjectClick(){
        setSubjectPicked(true)
    }

    return(
        <div className="search-bar">
            <input type="text" placeholder="Search for courses.."/>

            {/* show subject list only before a subject is picked*/}
            {!subjectPicked && (
                <ul className="dropdown">
                    {fakeSubjects.map((subject) => (
                        <li key={subject} onClick = {handleSubjectClick}>
                            {subject}
                        </li>
                    ))}
                </ul>
            )}

            {/* show number input + dropdown only after a subject is picked*/}
            {subjectPicked && (
                <>
                    <input type="text" placeholder="Enter course number"/>

                    <ul className="dropdown">
                        {fakeCourseNumbers.map((number) => (
                            <li key={number}>{number}</li>
                        ))}
                    </ul>
                </>
            )}

        </div>
    )
}

// allows other files to use this component
export default SearchBar