import {useState, useRef, useEffect} from 'react'

export function useVoice(questionType){
    const [isSpeaking, setIsSpeaking] = useState(false) // true when TTS is active
    const [isListening, setIsListening] = useState(false) // true when mic is on
    const [answer, setAnswer] = useState('') // stores transcribed speech

    const answerRef = useRef('') // stores latest answer safely for async callbacks
    const recognitionRef = useRef(null) // stores SpeechRecognition instance
    const restartTimerRef = useRef(null) // timer to restart recognition safely
    const isListeningRef = useRef(false)
    const questionTypeRef = useRef(questionType) // stores latest question type safely
    const finalTranscriptRef = useRef('')
    const interimTranscriptRef = useRef('')

    useEffect(()=>{
        questionTypeRef.current = questionType
    },[questionType])

    useEffect(()=>{

        //unmount ke time speech stop,mic off, silence timer off
        return ()=>{
            window.speechSynthesis.cancel()
            recognitionRef.current?.stop()
            if(restartTimerRef.current){
                clearTimeout(restartTimerRef.current)
            }
        }
    },[])

    //TTS
    const speakQuestion = (text)=>{
        if(!text) return
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        const apply = () => {
            const voices = window.speechSynthesis.getVoices()
            utterance.voice = voices.find(v=>v.name ==='Google UK English Male') || voices.find(v=>v.name.includes('Microsoft David')) ||
                voices.find(v=>v.name==='Daniel') ||
                voices.find(v=>v.lang==='en-GB' && !v.localService) ||
                voices.find(v=>v.lang.startsWith('en') && !v.localService) ||
                voices.find(v=>v.lang.startsWith('en')) ||
                voices[0]

                utterance.rate = 0.92
                utterance.pitch = 1.0
                utterance.volume = 1.0

                utterance.onend = () => {
                    setIsSpeaking(false)
                    if(questionTypeRef.current !== 'coding'){
                        startListening()
                    }
                }

                utterance.onerror = () => setIsSpeaking(false)

                setIsSpeaking(true)
                window.speechSynthesis.speak(utterance)
        }

        if(window.speechSynthesis.getVoices().length > 0){
            apply()
        } else {
            window.speechSynthesis.onvoiceschanged = apply // if voices loads then run apply
        }
    }

    //STT
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if(!SpeechRecognition) return

        setAnswer('')
        answerRef.current = ''
        finalTranscriptRef.current = ''
        interimTranscriptRef.current = ''
        isListeningRef.current = true

        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => setIsListening(true)

        recognition.onresult = (e) => {
            let interim = ''
            for(let i = e.resultIndex; i < e.results.length; i++){
                const result = e.results[i]
                if(result.isFinal){
                    finalTranscriptRef.current += result[0].transcript
                } else {
                    interim += result[0].transcript
                }
            }

            interimTranscriptRef.current = interim
            const transcript = `${finalTranscriptRef.current}${interimTranscriptRef.current}`
            setAnswer(transcript)
            answerRef.current = transcript
        }

        recognition.onend = () => {
            if(restartTimerRef.current) clearTimeout(restartTimerRef.current)
            if(isListeningRef.current){
                restartTimerRef.current = setTimeout(() => {
                    recognitionRef.current?.start()
                }, 200)
                return
            }
            setIsListening(false)
        }
        recognition.onerror = (event) => {
            if(event?.error === 'no-speech' && isListeningRef.current){
                return
            }
            if(event?.error === 'not-allowed' || event?.error === 'service-not-allowed'){
                isListeningRef.current = false
                setIsListening(false)
            }
        }

        recognition.start()
    }

    const stopListening = () => {
        isListeningRef.current = false
        recognitionRef.current?.stop()
        if(restartTimerRef.current) clearTimeout(restartTimerRef.current)
        setIsListening(false)
    }

    const reRecord = () => {
        setAnswer('')
        answerRef.current = ''
        finalTranscriptRef.current = ''
        interimTranscriptRef.current = ''
        startListening()
    }

    const voiceSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

    return {
        isSpeaking,
        isListening,
        answer,
        setAnswer,
        answerRef,
        voiceSupported,
        speakQuestion,
        startListening,
        stopListening,
        reRecord
    }

}