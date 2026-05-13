import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession } from '../services/api'

const JOB_ROLES = [
  { id: 'frontend developer',   label: 'Frontend Developer',   icon: 'FE' },
  { id: 'backend developer',    label: 'Backend Developer',    icon: 'BE' },
  { id: 'full stack developer', label: 'Full Stack Developer', icon: 'FS' },
  { id: 'devops engineer',      label: 'DevOps Engineer',      icon: 'DEV' },
  { id: 'data scientist',       label: 'Data Scientist',       icon: 'DS' },
  { id: 'ai engineer',          label: 'AI Engineer',          icon: 'AI' },
]

export default function Home() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('mm_user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('mm_token')
    localStorage.removeItem('mm_user')
    navigate('/auth')
  }

  const handleStart = async () => {
    if (!selectedRole) return
    setLoading(true)
    setError(null)
    try {
      const res = await createSession(selectedRole)
      navigate('/interview/' + res.data._id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center px-4">

      {/* Top right — user info + logout */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <span className="text-slate-600 text-sm">Hi, {user.name}</span>
        <button
          onClick={handleLogout}
          className="text-xs text-slate-700 hover:text-slate-900 transition-all cursor-pointer border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          Logout
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-3 text-blue-700">
          Kore
        </h1>
        <p className="text-slate-600 text-lg">
          A FAANG-level mock interview powered by AI
        </p>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
        {JOB_ROLES.map((role) => {
          const isSelected = selectedRole === role.id
          const cardClass = isSelected
            ? 'flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer w-full border-blue-500 bg-blue-50 scale-105'
            : 'flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer w-full border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={cardClass}
            >
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">{role.icon}</span>
              <span className="text-sm font-medium text-center text-slate-800">{role.label}</span>
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-600 mb-4 text-sm">{error}</p>
      )}

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={!selectedRole || loading}
        className={selectedRole && !loading
          ? 'px-10 py-4 rounded-2xl text-lg font-semibold bg-blue-600 hover:bg-blue-700 cursor-pointer text-white transition-all'
          : 'px-10 py-4 rounded-2xl text-lg font-semibold bg-slate-200 text-slate-400 cursor-not-allowed'}
      >
        {loading ? 'Starting...' : 'Start Interview'}
      </button>

      <p className="mt-8 text-slate-500 text-sm">
        10 questions - up to 20 minutes - instant feedback
      </p>

    </div>
  )
}