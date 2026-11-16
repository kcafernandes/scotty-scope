import { Link, useLocation } from 'react-router-dom'
import { useRevealOnScroll } from './useRevealOnScroll'

const GITHUB_URL = 'https://github.com/kcafernandes/scotty-scope'

function HomeFooter(){
    const { pathname } = useLocation()
    const [ref, revealClass] = useRevealOnScroll()

    function goToSearch(event){
        if (pathname !== '/') {
            return
        }
        event.preventDefault()
        window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
        document.querySelector('.subject-field input')?.focus({ preventScroll: true })
    }

    return (
        <footer ref={ref} className={`home-footer ${revealClass}`}>
            <p className="home-footer-credit">
                Reviews and ratings from the community UCR class difficulty database. Not affiliated with UCR.
            </p>
            <nav className="home-footer-links" aria-label="Footer">
                <a className="text-link" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
                <Link className="text-link" to="/" onClick={goToSearch}>Search</Link>
            </nav>
        </footer>
    )
}

export default HomeFooter
