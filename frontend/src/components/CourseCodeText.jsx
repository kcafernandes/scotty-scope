import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { coursePath, findExistingCourseCodes } from './catalog'

const COURSE_CODE = /\b([A-Z]{2,5}) (\d{2,3}[A-Z]{0,4})\b/g

function findCodes(text) {
    return [...text.matchAll(COURSE_CODE)].map((match) => ({
        code: `${match[1]} ${match[2]}`,
        start: match.index,
        end: match.index + match[0].length,
    }))
}

function CourseCodeText({ text, currentCode, onCourseClick }){
    const [found, setFound] = useState({ text: null, codes: new Set() })

    useEffect(() => {
        const codes = findCodes(text ?? '').map((match) => match.code)
        if (codes.length === 0) {
            return
        }
        let active = true
        findExistingCourseCodes(codes)
            .then((existing) => {
                if (active) {
                    setFound({ text, codes: existing })
                }
            })
            .catch(() => {})
        return () => {
            active = false
        }
    }, [text])

    if (!text) {
        return text
    }

    const existing = found.text === text ? found.codes : new Set()
    const parts = []
    let position = 0
    for (const match of findCodes(text)) {
        if (!existing.has(match.code) || match.code === currentCode) {
            continue
        }
        parts.push(text.slice(position, match.start))
        parts.push(
            <Link
                key={match.start}
                className="text-link"
                to={coursePath(match.code)}
                onClick={onCourseClick ? (event) => onCourseClick(event, match.code) : undefined}
            >
                {match.code}
            </Link>,
        )
        position = match.end
    }
    parts.push(text.slice(position))
    return parts
}

export default CourseCodeText
