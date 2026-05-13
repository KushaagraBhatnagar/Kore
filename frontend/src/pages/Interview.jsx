import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'

import { generateQuestion, submitAnswer, continueInterview, reviewCode } from '../services/api'

//hooks
import { useVoice }      from '../hooks/useVoice'
import { useProctoring } from '../hooks/useProctoring'

// components
import QuestionBox      from '../components/interview/QuestionBox'
import ScoreCard        from '../components/interview/ScoreCard'
import VoiceAnswerPanel from '../components/interview/VoiceAnswerPanel'
import CodeEditorPanel  from '../components/interview/CodeEditorPanel'
import ProctoringPanel  from '../components/interview/ProctoringPanel'
import WarningBanner    from '../components/interview/WarningBanner'
import { SpeakingIndicator } from '../components/interview/StatusIndicators'

// full-screen overlays (loading / done)
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-600">Preparing your interview environment...</p>
    </div>
  )
}

function DoneScreen() {
  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center gap-4">
      <div className="px-3 py-1 rounded-full bg-sky-100 text-blue-700 text-sm font-semibold">Done</div>
      <p className="text-slate-900 text-xl font-semibold">Interview Complete!</p>
      <p className="text-slate-600">Generating your performance report...</p>
    </div>
  )
}

//main component

export default function Interview() {
  const { sessionId } = useParams()
  const navigate      = useNavigate()

  // interview state
  const [phase, setPhase]                 = useState('loading')
  const [question, setQuestion]           = useState('')    // doubles as streamed buffer during 'typing'
  const [questionType, setQuestionType]   = useState('concept')
  const [code, setCode]                   = useState('')
  const [language, setLanguage]           = useState('javascript')
  const [lastResult, setLastResult]       = useState(null) // { score, evaluation } | null
  const [questionCount, setQuestionCount] = useState(0)
  const [error, setError]                 = useState(null)
  const [loading, setLoading]             = useState(false)

  // ── Socket ──
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io('http://localhost:8000')

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_session', sessionId)
    })

    // Stream chunks append directly into `question`
    socketRef.current.on('ai_stream_chunk', ({ chunk }) => {
      setPhase(prev => prev === 'evaluating' ? 'typing' : prev)
      setQuestion(prev => prev + chunk)
    })

    startInterview()

    return () => socketRef.current?.disconnect()
  }, [sessionId])

  // ── Voice hook ──
  const {
    isSpeaking,
    isListening,
    answer,
    setAnswer,
    answerRef,
    voiceSupported,
    speakQuestion,
    stopListening,
    reRecord,
  } = useVoice(questionType)

  // ── Proctoring hook ──
  const {
    warnings,
    showWarningBanner,
    warningMessage,
    proctorMsg,
    videoRef,
    triggerCheatWarning,
  } = useProctoring({ sessionId, phase, navigate, socketRef })

  // Interview flow

  const startInterview = async () => {
    setPhase('loading')
    setError(null)
    try {
      const res = await generateQuestion(sessionId)
      setQuestion(res.question.question)
      setQuestionType(res.questionType)
      setQuestionCount(1)
      setPhase(res.questionType === 'coding' ? 'coding' : 'questioning')
      speakQuestion(res.question.question)
    } catch (err) {
      setError(err.message)
      setPhase('questioning')
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return
    stopListening()
    setLoading(true)
    setError(null)
    try {
      await submitAnswer(sessionId, answer)
      setAnswer('')
      answerRef.current = ''
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
      setLastResult({ score: res.review.score, evaluation: res.review.feedback })
      await handleContinue()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleContinue = async () => {
    setPhase('evaluating')
    setQuestion('')          
    try {
      const res = await continueInterview(sessionId)

      if (res.interviewCompleted) {
        window.speechSynthesis.cancel()
        speakQuestion('Interview complete! Generating your performance report now.')
        setPhase('done')
        setTimeout(() => navigate('/report/' + sessionId), 3000)
        return
      }

      setLastResult({ score: res.score, evaluation: res.evaluation })
      setQuestion(res.nextQuestion)   // overwrites streamed buffer with authoritative value
      setQuestionType(res.questionType)
      setQuestionCount(c => c + 1)
      setCode('')
      setPhase(res.questionType === 'coding' ? 'coding' : 'questioning')
      speakQuestion(res.nextQuestion)
    } catch (err) {
      setError(err.message)
      setPhase('questioning')
    } finally {
      setLoading(false)
    }
  }

  //render

  if (phase === 'loading') return <LoadingScreen />
  if (phase === 'done')    return <DoneScreen />

  return (
    <div className="min-h-screen bg-sky-50 text-slate-900 p-6 flex justify-center items-start">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 mt-4">

        {/* Left column of interview area */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-sky-200">
            <h1 className="text-2xl font-bold tracking-tight text-blue-700">
              Kore
            </h1>
            <span className="text-sm font-medium text-slate-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              Question {questionCount} / 10
            </span>
          </div>

          {/* Warning banner */}
          {showWarningBanner && (
            <WarningBanner warnings={warnings} message={warningMessage} />
          )}

          {/* API error */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Previous answer score */}
          {lastResult && phase !== 'evaluating' && phase !== 'typing' && (
            <ScoreCard score={lastResult.score} evaluation={lastResult.evaluation} />
          )}

          {/* Question */}
          <QuestionBox
            phase={phase}
            questionType={questionType}
            question={question}
            isSpeaking={isSpeaking}
          />

          {/* AI speaking indicator */}
          {isSpeaking && <SpeakingIndicator />}

          {/* Voice answer panel */}
          {phase === 'questioning' && !isSpeaking && (
            <VoiceAnswerPanel
              isListening={isListening}
              answer={answer}
              loading={loading}
              voiceSupported={voiceSupported}
              onStopListening={stopListening}
              onReRecord={reRecord}
              onSubmit={handleSubmitAnswer}
            />
          )}

          {/* Code editor panel */}
          {phase === 'coding' && (
            <CodeEditorPanel
              code={code}
              language={language}
              loading={loading}
              onCodeChange={setCode}
              onLanguageChange={setLanguage}
              onSubmit={handleSubmitCode}
              onPasteViolation={() =>
                triggerCheatWarning('paste_detected', 'Copy-paste is not allowed in coding section!')
              }
            />
          )}

        </div>

        {/* Right column proctoring */}
        <ProctoringPanel
          videoRef={videoRef}
          warnings={warnings}
          proctorMsg={proctorMsg}
          isListening={isListening}
        />

      </div>
    </div>
  )
}