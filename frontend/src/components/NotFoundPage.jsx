import './NotFoundPage.css'
import { Link } from 'react-router-dom'
import PageLayout from './PageLayout'

function NotFoundPage({ message = "We couldn't find the page you were looking for." }){
    return (
        <PageLayout title="Page not found">
            <section className="not-found">
                <h1 className="page-title">Page not found</h1>
                <p className="page-subtitle">{message}</p>
                <p className="not-found-action">
                    <Link className="button-link" to="/">Go to search</Link>
                </p>
            </section>
        </PageLayout>
    )
}

export default NotFoundPage
