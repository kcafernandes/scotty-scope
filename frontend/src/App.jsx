import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import { BreadcrumbContext } from './components/breadcrumbContext'
import Header from './components/Header'
import Home from './components/Home'
import ResultsPage from './components/ResultsPage'
import CoursePage from './components/CoursePage'
import NotFoundPage from './components/NotFoundPage'

function ScrollToTop(){
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  const [breadcrumb, setBreadcrumb] = useState(null)

  return (
    <BreadcrumbContext.Provider value={setBreadcrumb}>
      <ScrollToTop />
      <Header breadcrumb={breadcrumb} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results/:subject" element={<ResultsPage />} />
        <Route path="/course/:courseCode" element={<CoursePage/>}/>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BreadcrumbContext.Provider>
  )
}

export default App
