import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const SURVEY_URL = 'https://docs.google.com/forms/d/1ieV9hByRgtBzp4mrEwRcNBNFnLC9f4XfZ6RPoa-NrD4/viewform'

function SurveyButton(){
    return (
        <a
            className="survey-button"
            href={SURVEY_URL}
            target="_blank"
            rel="noopener noreferrer"
        >
            Take the class difficulty survey
        </a>
    )
}

function SeeCourseMessage({ label, seeCourseCode }){
    return (
        <p className="see-course">
            {label} for this course appear under{' '}
            <Link to={`/course/${encodeURIComponent(seeCourseCode)}`}>{seeCourseCode}</Link>
        </p>
    )
}

function formatReviewDate(date){
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function DifficultyBox({ average, seeCourseCode }){
    return (
        <div className="info-block block-difficulty">
            <h3>Difficulty Rating</h3>
            <div className="block-center">
                {average !== null && (
                    <>
                        <p className="difficulty-average">
                            <span className="difficulty-value">{average.toFixed(1)}</span>
                            <span className="difficulty-out-of"> / 10</span>
                        </p>
                        <p className="difficulty-scale">1 means easiest, 10 means hardest.</p>
                    </>
                )}
                {average === null && seeCourseCode && (
                    <SeeCourseMessage label="Ratings" seeCourseCode={seeCourseCode} />
                )}
                {average === null && !seeCourseCode && (
                    <>
                        <p>Oops, there's no rating yet. Be the first?</p>
                        <SurveyButton />
                    </>
                )}
            </div>
        </div>
    )
}

function ReviewsBox({ course, seeCourseCode }){
    const courseCode = `${course.subject.code} ${course.number}`
    const hasReviews = course.review_count > 0
    const [loaded, setLoaded] = useState({ courseCode: null, reviews: [], failed: false })

    useEffect(() => {
        if (!hasReviews) {
            return
        }
        fetch(`http://127.0.0.1:8000/courses/${encodeURIComponent(courseCode)}/reviews`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Could not load reviews')
                }
                return response.json()
            })
            .then((data) => setLoaded({ courseCode, reviews: data, failed: false }))
            .catch(() => setLoaded({ courseCode, reviews: [], failed: true }))
    }, [courseCode, hasReviews])

    const loading = hasReviews && loaded.courseCode !== courseCode
    const showReviews = hasReviews && !loading && !loaded.failed

    return (
        <div className="info-block block-reviews">
            <div className="reviews-heading">
                <h3>Student Reviews</h3>
                {showReviews && (
                    <p className="review-count">
                        {course.review_count} written {course.review_count === 1 ? 'review' : 'reviews'}
                    </p>
                )}
            </div>

            {!hasReviews && seeCourseCode && (
                <SeeCourseMessage label="Reviews" seeCourseCode={seeCourseCode} />
            )}

            {!hasReviews && !seeCourseCode && (
                <>
                    <p>Oops, there's no review yet. Be the first?</p>
                    <SurveyButton />
                </>
            )}

            {loading && <p>Loading reviews...</p>}

            {hasReviews && !loading && loaded.failed && (
                <p>Sorry, the reviews could not be loaded.</p>
            )}

            {showReviews && (
                <>
                    <ul className="review-list">
                        {loaded.reviews.map((review, index) => (
                            <li key={index} className="review">
                                {(review.difficulty !== null || review.date) && (
                                    <p className="review-meta">
                                        {review.difficulty !== null && (
                                            <span className="review-difficulty">Difficulty {review.difficulty} / 10</span>
                                        )}
                                        {review.date && (
                                            <span className="review-date">{formatReviewDate(review.date)}</span>
                                        )}
                                    </p>
                                )}
                                <p className="review-comment">{review.comment}</p>
                            </li>
                        ))}
                    </ul>

                    <p className="review-credit">
                        Ratings and reviews come from the community-run UCR class difficulty database.
                    </p>
                </>
            )}
        </div>
    )
}

function CourseRatings({ course }){
    const seeCourseCode = course.see_course
        ? `${course.see_course.subject_code} ${course.see_course.number}`
        : null

    return (
        <>
            <DifficultyBox average={course.average_difficulty} seeCourseCode={seeCourseCode} />
            <ReviewsBox course={course} seeCourseCode={seeCourseCode} />
        </>
    )
}

export default CourseRatings
