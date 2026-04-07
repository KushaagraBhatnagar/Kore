import {useState, useEffect, useRef} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {io} from 'socket.io-client'

import {generateQuestion, submitAnswer, continueInterview, reviewCode} from '../services/api'

//hooks
import {useVoice} from '../hooks/useVoice'
import {useProctoring} from '../hooks/useProctoring'

//components
import QuestionBox from '..components/interview/QuestionBox'
import ScoreCard from '..components/interview/ScoreCard'
import VoiceAnswerPanel from '..components/interview/VoiceAnswerPanel'
import CodeEditorPanel from '..components/interview/CodeEditorPanel'
import ProctoringPanel from '..components/interview/ProctoringPanel'
import WarningBanner from '..components/interview/WarningBanner'
import {SpeakingIndicator} from '..components/interview/SpeakingIndicator'

//full screen overlays

function LoadingScreen(){
  return(
    <div>
      <div/>
      <p>Preparing your interview environment...</p>
    </div>
  )
}

function DoneScreen(){
  return(
    <div>
      <div>🎉</div>
      <p>Interview complete!</p>
      <p>Generating your performance report...</p>
    </div>
  )
}

//main
export default function Interview(){
  const {sessionId} = useParams()
  const navigate = useNavigate()

  //interview state
  const [phase, setPhase] = useState('loading')
  const [question, setQuestion] = useState('')
  const [questionType, setQuestionType] = useState('concept')
  const [code,setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [lastResult, setLastResult] = useState(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  //socket
  const socketRef = useRef(null)

  useEffect(()=>{
    socketRef.current = io('http://localhost:8000')

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_session', sessionId)
    })

    socketRef.current.on('ai_stream_chunk', ({chunk}) => {
      setPhase(prev => prev === 'evaluating' ? 'typing' : prev)
      setQuestion(prev => prev+chunk)
    })

    startInterview()

    return () => socketRef.current?.disconnect()
  }, [sessionId])

  //voice hook
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

  //proctoring hook
  const {
    warnings,
    showWarningBanner,
    warningMessage,
    proctorMsg,
    videoRef,
    triggerCheatWarning,
  } = useProctoring({sessionId, phase, navigate, socketRef})


}