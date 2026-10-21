const API_URL = 'http://127.0.0.1:8000'

let subjectsRequest = null
const courseRequests = new Map()

function getJson(url) {
    return fetch(url).then((response) => {
        if (!response.ok) {
            throw new Error(`Request failed: ${url}`)
        }
        return response.json()
    })
}

export function loadSubjects() {
    if (!subjectsRequest) {
        subjectsRequest = getJson(`${API_URL}/subjects`).catch((error) => {
            subjectsRequest = null
            throw error
        })
    }
    return subjectsRequest
}

export function loadSubjectCourses(subjectCode) {
    const key = subjectCode.toUpperCase()
    if (!courseRequests.has(key)) {
        const request = getJson(`${API_URL}/courses?subject=${encodeURIComponent(key)}`).catch((error) => {
            courseRequests.delete(key)
            throw error
        })
        courseRequests.set(key, request)
    }
    return courseRequests.get(key)
}

export function loadStats() {
    return getJson(`${API_URL}/stats`)
}

export async function findSubject(subjectCode) {
    const subjects = await loadSubjects()
    return subjects.find((subject) => subject.code.toUpperCase() === subjectCode.toUpperCase()) ?? null
}

export async function findExistingCourseCodes(codes) {
    const subjects = new Set((await loadSubjects()).map((subject) => subject.code))
    const wantedSubjects = [...new Set(codes.map((code) => code.split(' ')[0]))].filter((code) => subjects.has(code))
    const lists = await Promise.all(wantedSubjects.map(loadSubjectCourses))
    return new Set(lists.flat().map((course) => `${course.subject.code} ${course.number}`))
}

export function coursePath(code) {
    return `/course/${encodeURIComponent(code)}`
}

export function subjectPath(subjectCode) {
    return `/results/${encodeURIComponent(subjectCode)}`
}
