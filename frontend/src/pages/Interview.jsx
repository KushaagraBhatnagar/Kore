import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { generateQuestion, submitAnswer, continueInterview, reviewCode } from '../services/api'

function Badge({ text, color }) {
  let cls = 'text-xs font-semibold px-3 py-1 rounded-full bg-blue-900 text-blue-300'
  if (color === 'coding') cls = 'text-xs font-semibold px-3 py-1 rounded-full bg-yellow-900 text-yellow-300'
  if (color === 'followup') cls = 'text-xs font-semibold px-3 py-1 rounded-full bg-purple-900 text-purple-300'
  return <span className={cls}>{text}</span>
}

function ScoreBar({ score }) {
  let barColor = 'bg-red-500'
  if (score >= 7) barColor = 'bg-green-500'
  else if (score >= 4) barColor = 'bg-yellow-500'
  const width = (score / 10) * 100 + '%'
  return (
    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
      <div className={'h-2 rounded-full transition-all duration-700 ' + barColor} style={{ width }} />
    </div>
  )
}

export default function Interview() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  
  // Refs
  const textareaRef = useRef(null)
  const socketRef = useRef(null)
  const lastWarningTime = useRef(0) 

  // States
  const [phase, setPhase] = useState('loading')
  const [question, setQuestion] = useState(null)
  const [streamedQuestion, setStreamedQuestion] = useState('')
  const [questionType, setQuestionType] = useState('concept')
  const [answer, setAnswer] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [lastScore, setLastScore] = useState(null)
  const [lastEvaluation, setLastEvaluation] = useState(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [warnings, setWarnings] = useState(0)
  const [showWarningBanner, setShowWarningBanner] = useState(false)

  // Socket initialization
  useEffect(() => {
    socketRef.current = io("http://localhost:8000")

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join_session", sessionId)
    })

    socketRef.current.on("ai_stream_chunk", (data) => {
      setPhase((prev) => (prev === 'evaluating' ? 'typing' : prev))
      setStreamedQuestion((prev) => prev + data.chunk)
    })

    startInterview()

    return () => {
      if (socketRef.current) socketRef.current.disconnect()
    }
  }, [sessionId])

  // Anti-cheating logic (Tab switch detection)
  useEffect(() => {
    if (phase === 'done' || phase === 'loading') return;

    const handleCheatingAttempt = () => {
      const now = Date.now()
      
      // Throttle: ignore if triggered within 1 second of the last warning
      if (now - lastWarningTime.current < 1000) return; 
      lastWarningTime.current = now;

      setWarnings((prev) => {
        const newCount = prev + 1;

        if (socketRef.current) {
          socketRef.current.emit("proctor_alert", { sessionId, type: "tab_switch", count: newCount })
        }

        if (newCount >= 3) {
          alert("You have been disqualified for switching tabs multiple times during the interview.")
          setPhase('done');
          setTimeout(() => navigate('/report/' + sessionId), 2000)
        } else {
          setShowWarningBanner(true);
          setTimeout(() => setShowWarningBanner(false), 5000)
        }
        
        return newCount;
      })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') handleCheatingAttempt()
    }

    const handleWindowBlur = () => {
      handleCheatingAttempt();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleWindowBlur)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleWindowBlur)
    }
  }, [phase, navigate, sessionId])

  // API Calls
  const startInterview = async () => {
    setPhase('loading')
    setError(null)
    try {
      const res = await generateQuestion(sessionId)
      setQuestion(res.question.question)
      setQuestionType(res.questionType)
      setQuestionCount(1)
      setPhase(res.questionType === 'coding' ? 'coding' : 'questioning')
    } catch (err) {
      setError(err.message)
      setPhase('questioning')
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return
    setLoading(true)
    setError(null)
    try {
      await submitAnswer(sessionId, answer)
      setAnswer('')
      await handleContinue()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSubmitCode = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await reviewCode(sessionId, code, language)
      setLastScore(res.review.score)
      setLastEvaluation(res.review.feedback)
      await handleContinue()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleContinue = async () => {
    setPhase('evaluating')
    setStreamedQuestion('')
    try {
      const res = await continueInterview(sessionId)
      if (res.interviewCompleted) {
        setPhase('done')
        setTimeout(() => navigate('/report/' + sessionId), 2000)
        return
      }
      setLastScore(res.score)
      setLastEvaluation(res.evaluation)
      setQuestion(res.nextQuestion)
      setStreamedQuestion('')
      setQuestionType(res.questionType)
      setQuestionCount((c) => c + 1)
      setCode('')
      setPhase(res.questionType === 'coding' ? 'coding' : 'questioning')
    } catch (err) {
      setError(err.message)
      setPhase('questioning')
    } finally {
      setLoading(false)
    }
  }

  // Render logic
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400">Preparing your interview...</p>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🎉</div>
        <p className="text-white text-xl font-semibold">Interview Complete!</p>
        <p className="text-gray-400">Generating your report...</p>
      </div>
    )
  }

  let submitBtnClass = 'w-full py-3 rounded-2xl font-semibold text-base transition-all bg-gray-800 text-gray-600 cursor-not-allowed'
  if (answer.trim() && !loading) submitBtnClass = 'w-full py-3 rounded-2xl font-semibold text-base transition-all bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'

  let codeBtnClass = 'w-full py-3 rounded-2xl font-semibold text-base transition-all bg-gray-800 text-gray-600 cursor-not-allowed'
  if (code.trim() && !loading) codeBtnClass = 'w-full py-3 rounded-2xl font-semibold text-base transition-all bg-yellow-600 hover:bg-yellow-500 text-white cursor-pointer'

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-blue-400">MockMate AI</h1>
        <span className="text-sm text-gray-500">Question {questionCount} / 10</span>
      </div>

      {/* Warning Banner */}
      {showWarningBanner && (
        <div className="w-full max-w-2xl bg-red-600 text-white font-bold px-4 py-3 rounded-xl mb-6 shadow-lg shadow-red-900/50 animate-bounce flex justify-between items-center">
          <span>⚠️ Warning {warnings}/3: Tab switching is strictly prohibited!</span>
        </div>
      )}

      {/* Score Banner */}
      {lastScore !== null && phase !== 'evaluating' && phase !== 'typing' && (
        <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-400">Previous answer score</span>
            <span className="text-sm font-bold text-white">{lastScore}/10</span>
          </div>
          <ScoreBar score={lastScore} />
          {lastEvaluation && (
            <p className="text-xs text-gray-400 mt-2 italic">{lastEvaluation}</p>
          )}
        </div>
      )}

      {/* Question Card */}
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge text={questionType} color={questionType} />
          {phase === 'evaluating' && (
            <span className="text-xs text-gray-500 animate-pulse">AI is thinking...</span>
          )}
          {phase === 'typing' && (
            <span className="text-xs text-blue-400 animate-pulse">AI is typing...</span>
          )}
        </div>
        <p className="text-gray-100 text-base leading-relaxed">
          {phase === 'evaluating' && !streamedQuestion ? '⏳ Evaluating your answer...' : ''}
          {phase === 'typing' ? streamedQuestion : ''}
          {(phase === 'questioning' || phase === 'coding') ? question : ''}
        </p>
      </div>

      {error && (
        <div className="w-full max-w-2xl bg-red-950 border border-red-700 rounded-xl p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Concept Answer Input */}
      {phase === 'questioning' && (
        <div className="w-full max-w-2xl flex flex-col gap-3">
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={5}
            className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none text-sm"
          />
          <button
            onClick={handleSubmitAnswer}
            disabled={!answer.trim() || loading}
            className={submitBtnClass}
          >
            {loading ? 'Submitting...' : 'Submit Answer →'}
          </button>
        </div>
      )}

      {/* Coding Answer Input */}
      {phase === 'coding' && (
        <div className="w-full max-w-2xl flex flex-col gap-3">
          <div className="flex gap-2">
            {['javascript', 'python', 'java', 'cpp'].map((lang) => {
              let langBtn = 'px-3 py-1 rounded-lg text-xs font-semibold transition-all bg-gray-800 text-gray-400 hover:bg-gray-700 cursor-pointer'
              if (language === lang) langBtn = 'px-3 py-1 rounded-lg text-xs font-semibold transition-all bg-yellow-600 text-white cursor-pointer'
              return (
                <button key={lang} onClick={() => setLanguage(lang)} className={langBtn}>
                  {lang}
                </button>
              )
            })}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            rows={12}
            className="w-full bg-gray-900 border border-yellow-800 rounded-2xl p-4 text-green-300 placeholder-gray-600 focus:outline-none focus:border-yellow-500 resize-none text-sm font-mono"
          />
          <button
            onClick={handleSubmitCode}
            disabled={!code.trim() || loading}
            className={codeBtnClass}
          >
            {loading ? 'Reviewing code...' : 'Submit Code →'}
          </button>
        </div>
      )}
    </div>
  )
}