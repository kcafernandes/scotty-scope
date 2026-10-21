import SearchBar from './SearchBar'
import PageLayout from './PageLayout'

function Home() {
  return (
    <PageLayout isHome>
      <section id="hero">
        <div>
          <h1>R' You Ready for Registration?</h1>
          <p>
            Scope out UCR courses, professors, prerequisites, and student insights—all in one place.
          </p>
          <SearchBar />
        </div>
      </section>
    </PageLayout>
  )
}

export default Home
