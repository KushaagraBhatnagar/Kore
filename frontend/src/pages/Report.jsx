import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReport } from '../services/api'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-1">
      <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</span>
      <span className="text-slate-900 text-3xl font-bold">{value}</span>
      {sub && <span className="text-slate-500 text-xs">{sub}</span>}
    </div>
  )
}

function ScoreCircle({ score }) {
  const maxScore = 100
  const pct = Math.round((score / maxScore) * 100)
  let color = 'text-red-400'
  let ring = 'stroke-red-500'
  if (pct >= 70) { color = 'text-green-400'; ring = 'stroke-green-500' }
  else if (pct >= 40) { color = 'text-yellow-400'; ring = 'stroke-yellow-500' }

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            className={ring}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{score}</span>
          <span className="text-slate-500 text-xs">/ 100</span>
        </div>
      </div>
      <span className="text-slate-600 text-sm">Total Score</span>
    </div>
  )
}

function TopicBadge({ topic, type }) {
  const base = 'px-3 py-1.5 rounded-xl text-xs font-semibold capitalize'
  const style = type === 'strong'
    ? `${base} bg-green-50 text-green-700 border border-green-200`
    : `${base} bg-red-50 text-red-700 border border-red-200`
  return <span className={style}>{topic}</span>
}

function DifficultyBar({ level }) {
  const levels = ['warmup', 'core', 'advanced', 'challenge']
  const idx = levels.indexOf(level)
  const colors = ['bg-blue-500', 'bg-blue-400', 'bg-blue-600', 'bg-blue-700']

  return (
    <div className="flex items-center gap-2 mt-2">
      {levels.map((l, i) => (
        <div key={l} className="flex-1 flex flex-col items-center gap-1">
          <div className={`h-2 w-full rounded-full transition-all duration-700 ${i <= idx ? colors[i] : 'bg-slate-200'}`} />
          <span className={`text-[10px] font-medium ${i === idx ? 'text-slate-900' : 'text-slate-400'}`}>
            {l}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Report() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await getReport(sessionId)
        setReport(res.report)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600">Generating your report...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-lg font-semibold text-red-600">Error</div>
        <p className="text-red-600 text-center">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    )
  }

  if (!report) return null

  const avgPct = Math.round((report.averageScore / 10) * 100)
  let performanceLabel = 'Needs Work'
  let performanceColor = 'text-red-600'
  if (avgPct >= 70) { performanceLabel = 'Strong Performance'; performanceColor = 'text-green-600' }
  else if (avgPct >= 40) { performanceLabel = 'Decent Attempt'; performanceColor = 'text-blue-600' }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">
            Interview Complete
          </h1>
          <p className={`text-lg font-semibold ${performanceColor}`}>{performanceLabel}</p>
          <p className="text-slate-500 text-sm mt-1">Session ID: {sessionId.slice(-8).toUpperCase()}</p>
        </div>

        {/* Score Circle + Stats Grid */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <ScoreCircle score={report.totalScore} />
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1 w-full">
            <StatCard
              label="Questions Asked"
              value={report.totalQuestions}
              sub="out of 10 max"
            />
            <StatCard
              label="Avg Score"
              value={`${report.averageScore.toFixed(1)}/10`}
              sub="per question"
            />
            <StatCard
              label="Coding Questions"
              value={report.codingQuestionsAsked}
              sub="code reviewed"
            />
            <StatCard
              label="Avg Accuracy"
              value={`${avgPct}%`}
              sub="overall performance"
            />
          </div>
        </div>

        {/* Difficulty Reached */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-sm font-medium text-slate-600 mb-1">Difficulty Reached</p>
          <p className="text-slate-900 font-bold capitalize text-lg">{report.difficultyReached}</p>
          <DifficultyBar level={report.difficultyReached} />
        </div>

        {/* Strong Topics */}
        {report.strongTopics.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full">OK</span>
              <p className="text-sm font-semibold text-slate-700">Strong Topics</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.strongTopics.map((topic) => (
                <TopicBadge key={topic} topic={topic} type="strong" />
              ))}
            </div>
          </div>
        )}

        {/* Weak Topics */}
        {report.weakTopics.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-red-600 text-xs font-semibold bg-red-100 px-2 py-1 rounded-full">X</span>
              <p className="text-sm font-semibold text-slate-700">Topics to Improve</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {report.weakTopics.map((topic) => (
                <TopicBadge key={topic} topic={topic} type="weak" />
              ))}
            </div>
            <p className="text-xs text-slate-500 border-t border-slate-200 pt-3 mt-2">
              Tip: Revisit these concepts and try another mock session focused on these topics.
            </p>
          </div>
        )}

        {/* AI Feedback */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Interviewer Feedback</p>
          <p className="text-slate-700 text-sm leading-relaxed">{report.feedback}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
          >
            Start New Interview
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 rounded-xl font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer"
          >
            Refresh Report
          </button>
        </div>

      </div>
    </div>
  )
}