import SearchBar from './SearchBar'

function Home() {
  return (
    <section id="hero">
      <div>
        <h1>R' You Ready for Registration?</h1>
        <p>
          Scope out UCR courses, professors, prerequisites, and student insights—all in one place.
        </p>
        <SearchBar />
      </div>
    </section>
  )
}

export default Home