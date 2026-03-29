import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../services/api'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all fields")
      return
    }
    setLoading(true)
    setError(null)
    try {
      let res
      if (isLogin) {
        res = await loginUser(email, password)
      } else {
        res = await registerUser(name, email, password)
      }
      localStorage.setItem('mm_token', res.token)
      localStorage.setItem('mm_user', JSON.stringify(res.user))
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            MockMate AI
          </h1>
          <p className="text-gray-500 text-sm mt-2">FAANG-level mock interviews powered by AI</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col gap-5">

          {/* Toggle */}
          <div className="flex bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => { setIsLogin(true); setError(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${isLogin ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${!isLogin ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Name (signup only) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="John Doe"
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLogin ? "••••••••" : "Min. 6 characters"}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-base transition-all ${loading ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'}`}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login →' : 'Create Account →'}
          </button>

        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Your data is private and never shared.
        </p>
      </div>
    </div>
  )
}