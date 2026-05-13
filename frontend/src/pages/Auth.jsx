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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700">
            Kore
          </h1>
          <p className="text-slate-600 text-sm mt-2">FAANG-level mock interviews powered by AI</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col gap-5">

          {/* Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => { setIsLogin(true); setError(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${isLogin ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${!isLogin ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Name (signup only) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="John Doe"
                className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLogin ? "••••••••" : "Min. 6 characters"}
              className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-base transition-all ${loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'}`}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>

        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Your data is private and never shared.
        </p>
      </div>
    </div>
  )
}