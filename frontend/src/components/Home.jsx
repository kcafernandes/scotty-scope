import './Home.css'
import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from './SearchBar'
import PageLayout from './PageLayout'
import HomeFeatures from './HomeFeatures'
import HomeFooter from './HomeFooter'
import { coursePath, loadStats } from './catalog'

const EXAMPLE_COURSES = ['CS 010A', 'MATH 009A', 'BIOL 005A', 'PHYS 040A']
const TITLE_WORDS = ["R'", 'You', 'Ready', 'for']
const GRADIENT_WORD = 'Registration?'

const STAT_LABELS = [
  ['courses', 'courses'],
  ['subjects', 'subjects'],
  ['reviews', 'student reviews'],
  ['courses_with_prerequisite_maps', 'courses with prerequisite maps'],
]

function HomeStats(){
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let active = true
    loadStats()
      .then((data) => {
        if (active) {
          setStats(data)
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  if (!stats) {
    return null
  }

  return (
    <section className="home-stats home-intro" style={{ '--intro-step': 3 }} aria-label="Scotty Scope in numbers">
      {STAT_LABELS.map(([key, label]) => (
        <div key={key} className="home-stat">
          <span className="home-stat-number">{Number(stats[key]).toLocaleString('en-US')}</span>
          <span className="home-stat-label">{label}</span>
        </div>
      ))}
    </section>
  )
}

function HomeTitle(){
  return (
    <h1 className="home-title">
      {TITLE_WORDS.map((word, index) => (
        <Fragment key={word}>
          <span className="title-word" style={{ '--word-index': index }}>{word}</span>{' '}
        </Fragment>
      ))}
      <span className="title-word title-gradient" style={{ '--word-index': TITLE_WORDS.length }}>
        {GRADIENT_WORD}
      </span>
    </h1>
  )
}

function HomeAurora(){
  return (
    <div className="home-aurora" aria-hidden="true">
      <span className="aurora-blob aurora-red" />
      <span className="aurora-blob aurora-purple" />
      <span className="aurora-blob aurora-blue" />
    </div>
  )
}

function Home() {
  return (
    <PageLayout isHome>
      <HomeAurora />
      <section id="hero">
        <div className="home-hero-content">
          <HomeTitle />
          <p className="home-intro" style={{ '--intro-step': 0 }}>
            Scope out UCR courses, professors, prerequisites, and student insights—all in one place.
          </p>
          <div className="home-intro home-search" style={{ '--intro-step': 1 }}>
            <SearchBar />
          </div>
          <nav className="home-try home-intro" style={{ '--intro-step': 2 }} aria-label="Example courses">
            <span className="home-try-label">Try:</span>
            {EXAMPLE_COURSES.map((code) => (
              <Link key={code} className="home-try-pill" to={coursePath(code)}>{code}</Link>
            ))}
          </nav>
        </div>
      </section>
      <HomeStats />
      <HomeFeatures />
      <HomeFooter />
    </PageLayout>
  )
}

export default Home
