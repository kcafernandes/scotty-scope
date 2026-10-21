import './PageLayout.css'
import { useContext, useEffect, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { BreadcrumbContext } from './breadcrumbContext'

const SITE_NAME = 'Scotty Scope'

function PageLayout({ title, trail = [], isHome = false, back = null, wide = false, children }){
    const setBreadcrumb = useContext(BreadcrumbContext)
    const trailKey = JSON.stringify(trail)

    useLayoutEffect(() => {
        setBreadcrumb(isHome ? null : JSON.parse(trailKey))
    }, [setBreadcrumb, isHome, trailKey])

    useEffect(() => {
        document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    }, [title])

    return (
        <div className={wide ? 'page-layout is-wide' : 'page-layout'}>
            {back && (
                <div className="back-row">
                    <Link className="back-link" to={back.to}>
                        <span aria-hidden="true">←</span> {back.label}
                    </Link>
                </div>
            )}
            <main className="page-content">
                {children}
            </main>
        </div>
    )
}

export default PageLayout
