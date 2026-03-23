import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home.jsx'
import Interview from './pages/Interview.jsx'
import Report from './pages/Report.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path = "/" element = {<Home/>}/> 
      <Route path = "/interview/:sessionId" element = {<Interview/>}/>
      <Route path = "/report/:sessionId" element = {<Report/>}/>
    </Routes>
    </BrowserRouter>
  </StrictMode>
)
