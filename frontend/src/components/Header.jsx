import './Header.css'
import { Link } from 'react-router-dom'
import Breadcrumb from './Breadcrumb'

function Header({ breadcrumb }) {
    return(
        <header>
            <Link className="logo" to="/">ScottyScope</Link>
            <div className="header-breadcrumb">
                {breadcrumb && <Breadcrumb trail={breadcrumb} />}
            </div>
            <nav className="header-nav" aria-label="Main">
                <Link className="header-link" to="/">Search</Link>
            </nav>
        </header>
    )
}

export default Header
