import { Link } from 'react-router-dom'

function Breadcrumb({ trail }){
    return (
        <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol>
                <li>
                    <Link className="breadcrumb-link" to="/">Search</Link>
                </li>
                {trail.map((item, index) => {
                    const isCurrent = index === trail.length - 1
                    return (
                        <li key={`${item.label}-${index}`}>
                            {isCurrent
                                ? (
                                    <span className="breadcrumb-current" aria-current="page" title={item.tooltip ?? item.label}>
                                        {item.label}
                                    </span>
                                )
                                : (
                                    <Link className="breadcrumb-link" to={item.to} title={item.tooltip}>
                                        {item.label}
                                    </Link>
                                )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

export default Breadcrumb
