import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession } from '../services/api'

const JOB_ROLES = [
  { id: 'frontend developer',   label: 'Frontend Developer',   icon: '🖥️' },
  { id: 'backend developer',    label: 'Backend Developer',    icon: '⚙️' },
  { id: 'full stack developer', label: 'Full Stack Developer', icon: '🔗' },
  { id: 'devops engineer',      label: 'DevOps Engineer',      icon: '🚀' },
  { id: 'data scientist',       label: 'Data Scientist',       icon: '📊' },
  { id: 'ai engineer',          label: 'AI Engineer',          icon: '🤖' },
]

export default function Home() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">

      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-3 text-blue-400">
          MockMate AI
        </h1>
        <p className="text-gray-400 text-lg">
          A FAANG-level mock interview powered by AI
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
        {JOB_ROLES.map((role) => {
          let cardClass = 'flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer w-full border-gray-700 bg-gray-900 hover:border-gray-500'
          if (selectedRole === role.id) cardClass = 'flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer w-full border-blue-500 bg-blue-900 scale-105'
          return (
            <button key={role.id} onClick={() => setSelectedRole(role.id)} className={cardClass}>
              <span className="text-3xl">{role.icon}</span>
              <span className="text-sm font-medium text-center">{role.label}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="text-red-400 mb-4 text-sm">{error}</p>
      )}

      <button
        onClick={handleStart}
        disabled={!selectedRole || loading}
        className={selectedRole && !loading
          ? 'px-10 py-4 rounded-2xl text-lg font-semibold bg-blue-600 hover:bg-blue-500 cursor-pointer text-white'
          : 'px-10 py-4 rounded-2xl text-lg font-semibold bg-gray-700 text-gray-500 cursor-not-allowed'}
      >
        {loading ? 'Starting...' : 'Start Interview →'}
      </button>

      <p className="mt-8 text-gray-600 text-sm">
        10 questions · up to 20 minutes · instant feedback
      </p>
    </div>
  )
}