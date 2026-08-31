import './CoursePage.css'

function CoursePage(){
    // mock data to test page setup
    // real data will come from later backend implementation
    const mockCourse = {
        code: 'MATH 031',
        title: 'Linear Algebra',
        description: 'An introduction to systems of linear equations, matrices, determinants, vector spaces, and linear transformations, with applications to science and engineering.',
        units: 4,
        department: 'Mathematics',
        prerequisites: ['MATH 009A', 'MATH 009B'],
        professors: ['Elena', 'Yu Shi', 'Stark'],
        historicalOfferings: ['Fall 2024', 'Winter 2025', 'Spring 2025'],
        rating: 4.2,
        difficulty: 3.5,
    }

    return(
        <section className="course-page">
            <h2>{mockCourse.code}: {mockCourse.title}</h2>

            <div className="info-grid">
                <div className="info-block block-description">
                    <h3>Description</h3>
                    <p>{mockCourse.description}</p>
                </div>

                <div className="info-block block-details">
                    <h3>Course Details</h3>
                    <p>Department: {mockCourse.department}</p>
                    <div className="stat">
                        <span className="stat-label">Units</span>
                        <span className="stat-value">{mockCourse.units}</span>
                    </div>
                </div>

                <div className="info-block block-professors">
                    <h3>Professors</h3>
                    <ul>
                        {mockCourse.professors.map((prof) => (
                        <li key={prof}>{prof}</li>
                        ))}
                    </ul>
                </div>

                <div className="info-block block-ratings">
                    <h3>Ratings</h3>
                    <div className="stat">
                        <span className="stat-label">Rating</span>
                        <span className="stat-value">{mockCourse.rating} / 5</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Difficulty</span>
                        <span className="stat-value">{mockCourse.difficulty} / 5</span>
                    </div>
                </div>

                <div className="info-block block-prereqs">
                    <h3>Prerequisites</h3>
                    <ul>
                    {mockCourse.prerequisites.map((prereq) => (
                        <li key={prereq}>{prereq}</li>
                    ))}
                    </ul>
                </div>

                <div className="info-block block-offerings">
                    <h3>Historical Offerings</h3>
                    <ul>
                    {mockCourse.historicalOfferings.map((term) => (
                        <li key={term}>{term}</li>
                    ))}
                    </ul>
                </div>
            </div>
        </section>
    )

}

export default CoursePage