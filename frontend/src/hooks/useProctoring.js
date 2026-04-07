import {useState, useRef, useEffect} from 'react'
import {FaceLandmarker, FilesetResolver} from '@mediapipe/tasks-vision'

import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

const MEDIAPIPE_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
const FACE_LANDMARK_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

const LOOK_AWAY_THRESHOLD = 0.65
const LOOK_AWAY_FRAMES = 40
const FACE_VIOLATION_FRAMES = 30
const OBJECT_DETECT_EVERY = 15
const FORBIDDEN_OBJECTS = new Set(['cell phone', 'laptop', 'book', 'tablet', 'remote'])
const WARNING_COOLDOWN_MS = 2000

export function useProctoring({sessionId, phase, navigate, socketRef}){
    const [warnings, setWarnings] = useState(0)
    const [showWarningBanner, setShowWarningBanner] = useState(false)
    const [warningMessage, setWarningMessage] = useState('')
    const [proctorMsg, setProctorMsg] = useState('Loading AI Models...')

    const videoRef = useRef(null)
    const objectDetectorRef = useRef(null)
    const lastWarningTime = useRef(0)
    const faceViolationFrames = useRef(0)
    const lookAwayFrames = useRef(0)
    const frameCounter = useRef(0)

    //warning logic
    const triggerCheatWarning = (type, message) => {
        const now = Date.now()
        if(now-lastWarningTime.current < WARNING_COOLDOWN_MS) {
            return
        }
        lastWarningTime.current = now
        setWarnings(prev => {
            const newCount = prev + 1

            socketRef.current?.emit('proctor_alert', {sessionId, type, count: newCount})

            if(newCount >= 3){
                alert('🚨 Interview Terminated: Multiple violations detected.')
                navigate('/report/'+sessionId)
            } else {
                setWarningMessage(message)
                setShowWarningBanner(true)
                setTimeout(() => setShowWarningBanner(false), 3000)
            }
            return newCount
        })
    }

    useEffect(()=>{
        if(phase === 'done' || phase==='loading') return

        const onHidden = () => {
            if(document.visibilityState === 'hidden')
                triggerCheatWarning('tab_switch','Tab switching is strictly prohibited during the interview.')
        }

        const onBlur = () => {
            triggerCheatWarning('window_blur','Do not click outside the interview window during the session.')
        }

        document.addEventListener('visibilitychange', onHidden)//tab change
        window.addEventListener('blur', onBlur)//click outside

        return () => {
            document.removeEventListener('visibilitychange', onHidden)
            window.removeEventListener('blur', onBlur)
        }
    },[phase, sessionId])

    useEffect(()=> {
        let faceLandmarker
        let animationFrameId
        let stream
        let isRunning = true

        const init = async () => {
            try{
                setProctorMsg('Loading AI Models...')
                await tf.ready()

                objectDetectorRef.current = await cocoSsd.load()
                const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM)
                faceLandmarker = await FaceLandmarker.createFromOptions(vision,{
                    baseOptions:{modelAssetPath:FACE_LANDMARK_MODEL, delegate:'GPU'},
                    outputFaceBlendshapes:true,
                    runningMode:'VIDEO',
                    numFaces:2
                })
                stream = await navigator.mediaDevices.getUserMedia({video:true})
                if(videoRef.current){
                    videoRef.current.srcObject = stream
                    videoRef.current.addEventListener('loadedmetadata', runDetectionLoop)
                }
            } catch(err){
                console.error('Proctoring initialization failed:', err)
                setProctorMsg('⚠️ Proctoring Unavailable: '+err.message)
            }
        }

        

    })
}