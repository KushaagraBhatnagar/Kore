import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Home from './pages/Home.jsx'
import Interview from './pages/Interview.jsx'
import Report from './pages/Report.jsx'
import Auth from './pages/Auth.jsx'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('mm_token')
  if (!token) return <Navigate to="/auth"  replace/>
  return children
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path = "/auth" element = {<Auth/>}/> 
      <Route path = "/" element = {<ProtectedRoute><Home/></ProtectedRoute>}/>
      <Route path = "/interview/:sessionId" element = {<ProtectedRoute><Interview/></ProtectedRoute>}/>
      <Route path = "/report/:sessionId" element = {<ProtectedRoute><Report/></ProtectedRoute>}/>
    </Routes>
    </BrowserRouter>
  </StrictMode>
)
