import './App.css'
import Header from './components/Header'
import ResultsPage from './components/ResultsPage'
import SearchBar from './components/SearchBar'
import CoursePage from './components/CoursePage'

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
          <SearchBar/> 
        </div>
      </section>
    </>
  )
}

export default App
