import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { generateQuestion, submitAnswer, continueInterview, reviewCode } from '../services/api'

function Badge({ text, color }) {
  let cls = 'text-xs font-semibold px-3 py-1 rounded-full bg-blue-900/50 text-blue-300 border border-blue-800'
  if (color === 'coding') cls = 'text-xs font-semibold px-3 py-1 rounded-full bg-yellow-900/50 text-yellow-300 border border-yellow-800'
  if (color === 'followup') cls = 'text-xs font-semibold px-3 py-1 rounded-full bg-purple-900/50 text-purple-300 border border-purple-800'
  return <span className={cls}>{text}</span>
}

function ScoreBar({ score }) {
  let barColor = 'bg-red-500'
  if (score >= 7) barColor = 'bg-green-500'
  else if (score >= 4) barColor = 'bg-yellow-500'
  const width = (score / 10) * 100 + '%'
  return (
    <div className="w-full bg-gray-800 rounded-full h-2 mt-2 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width }} />
    </div>
  )
}

export default function Interview() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  
  const textareaRef = useRef(null)
  const socketRef = useRef(null)
  const videoRef = useRef(null)

  const lastWarningTime = useRef(0) 
  const faceViolationFrames = useRef(0)
  const lookAwayFrames = useRef(0)
  const frameCounter = useRef(0)
  const objectDetectorRef = useRef(null)

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
  const [warningMessage, setWarningMessage] = useState('') 
  const [proctorMsg, setProctorMsg] = useState('Loading AI Models...') 

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

  const triggerCheatWarning = (type, message) => {
    const now = Date.now()
    if (now - lastWarningTime.current < 2000) return; 
    lastWarningTime.current = now;

    setWarnings((prev) => {
      const newCount = prev + 1;

      if (socketRef.current) {
        socketRef.current.emit("proctor_alert", { sessionId, type, count: newCount })
      }

      if (newCount >= 3) {
        alert("🚨 Interview Terminated: Multiple violations detected.")
        setPhase('done');
        setTimeout(() => navigate('/report/' + sessionId), 2000)
      } else {
        setWarningMessage(message)
        setShowWarningBanner(true);
        setTimeout(() => setShowWarningBanner(false), 5000)
      }
      return newCount;
    })
  }

  // Tab switch monitoring
  useEffect(() => {
    if (phase === 'done' || phase === 'loading') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerCheatWarning("tab_switch", "Tab switching is strictly prohibited!")
      }
    }

    const handleWindowBlur = () => {
      triggerCheatWarning("window_blur", "Do not click outside the interview window!")
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleWindowBlur)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleWindowBlur)
    }
  }, [phase, sessionId, navigate])

  // 🚀 FIXED: Video Proctoring (Runs ONLY ONCE, no more RAM crashing)
  useEffect(() => {
    let faceLandmarker;
    let animationFrameId;
    let stream;
    let isRunning = true; // Component unmount track karne ke liye

    const initProctoring = async () => {
      try {
        setProctorMsg("Loading AI Models...");
        
        await tf.ready();
        objectDetectorRef.current = await cocoSsd.load();

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true, 
          runningMode: "VIDEO",
          numFaces: 2
        });

        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
      } catch (err) {
        console.error("Proctoring init failed:", err);
        setProctorMsg("⚠️ Camera Error!");
      }
    };

    let lastVideoTime = -1;
    const predictWebcam = async () => {
      if (!isRunning) return; 

      // Agar video load nahi hui hai toh agle frame ka wait karo
      if (!videoRef.current || !faceLandmarker) {
        animationFrameId = requestAnimationFrame(predictWebcam);
        return;
      }

      if (videoRef.current.currentTime !== lastVideoTime) {
        lastVideoTime = videoRef.current.currentTime;
        frameCounter.current += 1;

        const results = faceLandmarker.detectForVideo(videoRef.current, performance.now());
        const faceCount = results.faceLandmarks ? results.faceLandmarks.length : 0;

        if (faceCount !== 1) {
          faceViolationFrames.current += 1;
          if (faceViolationFrames.current > 30) { 
            triggerCheatWarning(
              faceCount === 0 ? "face_missing" : "multiple_faces",
              faceCount === 0 ? "Your face must remain visible!" : "Multiple faces detected!"
            );
            faceViolationFrames.current = 0; 
          }
        } else {
          faceViolationFrames.current = 0; 
          
          const landmarks = results.faceLandmarks[0];
          const topOfHead = landmarks[10];
          const nose = landmarks[1];
          const chin = landmarks[152];

          const topToNoseDist = Math.abs(nose.y - topOfHead.y);
          const noseToChinDist = Math.abs(chin.y - nose.y);
          
          const headTiltRatio = topToNoseDist / noseToChinDist;

          let isLookingSides = false;
          let isLookingUp = false;

          if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            const blendshapes = results.faceBlendshapes[0].categories;
            const eyeLookOutLeft = blendshapes.find(b => b.categoryName === 'eyeLookOutLeft')?.score || 0;
            const eyeLookInLeft = blendshapes.find(b => b.categoryName === 'eyeLookInLeft')?.score || 0;
            const eyeLookOutRight = blendshapes.find(b => b.categoryName === 'eyeLookOutRight')?.score || 0;
            const eyeLookInRight = blendshapes.find(b => b.categoryName === 'eyeLookInRight')?.score || 0;
            const eyeLookUpLeft = blendshapes.find(b => b.categoryName === 'eyeLookUpLeft')?.score || 0;
            const eyeLookUpRight = blendshapes.find(b => b.categoryName === 'eyeLookUpRight')?.score || 0;

            isLookingSides = (eyeLookOutLeft > 0.65 && eyeLookInRight > 0.65) || 
                             (eyeLookInLeft > 0.65 && eyeLookOutRight > 0.65);
                             
            isLookingUp = (eyeLookUpLeft > 0.65 && eyeLookUpRight > 0.65);
          }

          if (isLookingSides || isLookingUp || headTiltRatio > 1.85 || headTiltRatio < 0.55) {
            lookAwayFrames.current += 1;
            setProctorMsg("👀 Looking Away!");
            
            if (lookAwayFrames.current > 40) { 
              triggerCheatWarning("eye_tracking_violation", "Please look directly at the screen!");
              lookAwayFrames.current = 0;
            }
          } else {
            lookAwayFrames.current = 0; 
            setProctorMsg("✅ Proctoring Active");
          }
        }

        if (frameCounter.current % 15 === 0 && objectDetectorRef.current) {
          const predictions = await objectDetectorRef.current.detect(videoRef.current);
          
          const forbiddenObject = predictions.find(p => 
            p.class === 'cell phone' || p.class === 'book' || p.class === 'remote'
          );
          
          if (forbiddenObject && forbiddenObject.score > 0.35) { 
             triggerCheatWarning("object_detected", `Forbidden object detected: Mobile Device`);
          }
        }
      }
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    initProctoring();

    return () => {
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (faceLandmarker) faceLandmarker.close();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []); // 🚀 THE BRAMHASTRA: Empty array ensures models load ONLY ONCE

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

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400">Preparing your interview environment...</p>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🎉</div>
        <p className="text-white text-xl font-semibold">Interview Complete!</p>
        <p className="text-gray-400">Generating your performance report...</p>
      </div>
    )
  }

  let submitBtnClass = 'w-full py-3 rounded-xl font-semibold text-base transition-all bg-gray-800 text-gray-500 cursor-not-allowed'
  if (answer.trim() && !loading) submitBtnClass = 'w-full py-3 rounded-xl font-semibold text-base transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 cursor-pointer'

  let codeBtnClass = 'w-full py-3 rounded-xl font-semibold text-base transition-all bg-gray-800 text-gray-500 cursor-not-allowed'
  if (code.trim() && !loading) codeBtnClass = 'w-full py-3 rounded-xl font-semibold text-base transition-all bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-900/20 cursor-pointer'

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 flex justify-center items-start">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 mt-4">
        
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              MockMate AI
            </h1>
            <span className="text-sm font-medium text-gray-400 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
              Question {questionCount} / 10
            </span>
          </div>

          {showWarningBanner && (
            <div className="w-full bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl shadow-lg animate-bounce flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-bold text-sm">Warning {warnings}/3</p>
                <p className="text-xs opacity-80">{warningMessage}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="w-full bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {lastScore !== null && phase !== 'evaluating' && phase !== 'typing' && (
            <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">Previous Answer Evaluation</span>
                <span className="text-lg font-bold text-white">{lastScore}/10</span>
              </div>
              <ScoreBar score={lastScore} />
              {lastEvaluation && (
                <p className="text-sm text-gray-400 mt-4 leading-relaxed bg-gray-950 p-3 rounded-lg border border-gray-800">
                  {lastEvaluation}
                </p>
              )}
            </div>
          )}

          <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm min-h-[150px]">
            <div className="flex items-center gap-3 mb-5">
              <Badge text={questionType.toUpperCase()} color={questionType} />
              {phase === 'evaluating' && (
                <span className="text-sm text-gray-500 animate-pulse flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                  Evaluating answer...
                </span>
              )}
              {phase === 'typing' && (
                <span className="text-sm text-blue-400 animate-pulse">AI is typing...</span>
              )}
            </div>
            <p className="text-gray-200 text-lg leading-relaxed font-medium">
              {phase === 'evaluating' && !streamedQuestion ? '' : ''}
              {phase === 'typing' ? streamedQuestion : ''}
              {(phase === 'questioning' || phase === 'coding') ? question : ''}
            </p>
          </div>

          {phase === 'questioning' && (
            <div className="w-full flex flex-col gap-3">
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your explanation clearly..."
                rows={6}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl p-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-base transition-all"
              />
              <button onClick={handleSubmitAnswer} disabled={!answer.trim() || loading} className={submitBtnClass}>
                {loading ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          )}

          {phase === 'coding' && (
            <div className="w-full flex flex-col gap-3">
              <div className="flex gap-2">
                {['javascript', 'python', 'java', 'cpp'].map((lang) => {
                  const isActive = language === lang
                  return (
                    <button 
                      key={lang} 
                      onClick={() => setLanguage(lang)} 
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive ? 'bg-yellow-600 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  )
                })}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Write your optimized solution here..."
                rows={14}
                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-2xl p-4 text-green-400 placeholder-gray-600 focus:outline-none focus:border-yellow-500 resize-none text-sm font-mono shadow-inner"
              />
              <button onClick={handleSubmitCode} disabled={!code.trim() || loading} className={codeBtnClass}>
                {loading ? 'Reviewing code...' : 'Submit Code'}
              </button>
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-md sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300">Live Proctoring</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{warnings}/3 Warnings</span>
                <span className={`h-2 w-2 rounded-full ${proctorMsg.includes('✅') ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4 border border-gray-700 shadow-inner">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform scale-x-[-1]" 
              />
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-lg backdrop-blur-md ${proctorMsg.includes('✅') ? 'bg-green-900/60 text-green-300' : 'bg-red-900/80 text-red-200 border border-red-500/50'}`}>
                  {proctorMsg}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-2">
              <p className="flex items-center gap-2">
                <span className="text-gray-600">✓</span> Face visibility tracking
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-600">✓</span> Eye movement analysis
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-600">✓</span> Device detection active
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}