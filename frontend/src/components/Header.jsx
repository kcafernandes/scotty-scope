import './Header.css'

function Header() {
    return(
        <header>
            <div className="logo">ScottyScope</div>
            <nav>
                <a href="#courses">Course</a>
                <a href="#about">About</a>
                <a href="#help">Help</a>
            </nav>
        </header>
    )
}

export default Header