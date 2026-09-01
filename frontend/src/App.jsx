import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Home from './components/Home'
import ResultsPage from './components/ResultsPage'
import CoursePage from './components/CoursePage'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/course/:courseCode" element={<CoursePage/>}/>
      </Routes>
    </>
  )
}

export default App