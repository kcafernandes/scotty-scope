import './App.css'
import Header from './components/Header'
import SearchBar from './components/SearchBar'

function App() {

  return (
    <>
    <Header/>
      <section id="hero">
        <div>
          <h1>R' You Ready for Registration?</h1>
          <p>
          Scope out UCR courses, professors, prerequisites, and student insights—all in one place.
          </p>
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <SearchBar/>
          </div>
        </div>
      </section>
    </>
  )
}

export default App
