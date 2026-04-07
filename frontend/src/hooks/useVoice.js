import {useState, useRef, useEffect} from 'react'

export function useVoice(questionType){
    const [isSpeaking, setIsSpeaking] = useState(false) // true when TTS is active
    const [isListening, setIsListening] = useState(false) // true when mic is on
    const [answer, setAnswer] = useState('') // stores transcribed speech

    const answerRef = useRef('') // stores latest answer safely for async callbacks
    const recognitionRef = useRef(null) // stores SpeechRecognition instance
    const silenceTimerRef = useRef(null) // timer to detect silence
    const questionTypeRef = useRef(questionType) // stores latest question type safely

    useEffect(()=>{
        questionTypeRef.current = questionType
    },[questionType])

    useEffect(()=>{

        //unmount ke time speech stop,mic off, silence timer off
        return ()=>{
            window.speechSynthesis.cancel()
            recognitionRef.current?.stop()
            if(silenceTimerRef.current){
                clearTimeout(silenceTimerRef.current)
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
                    if(questionTypeRef.current === 'coding'){
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
        answerRef.current=''

        const recognition = new SpeechRecognition()
        recognition.current = recognition
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => setIsListening(true)

        recognition.onresult = (e) => {
            const transcript = Array.from(e.results).map(r=> r[0].transcript).join('')
            setAnswer(transcript)
            answerRef.current = transcript
            
            //pehle se timer chlra toh bnd krdo
            if(silenceTimerRef.current){
                clearTimeout(silenceTimerRef.current)
            }

            //naya timer chalaya
            silenceTimerRef.current = setTimeout(()=> recognition.stop(),2500)
        }

        recognition.onend = () => {
            setIsListening(false)
            if(silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        }
        recognition.onerror = () => setIsListening(false)

        recognition.start()
    }

    const stopListening = () => {
        recognitionRef.current?.stop()
        if(silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
            setIsListening(false)
    }

    const reRecord = () => {
        setAnswer('')
        answerRef.current = ''
        startListening()
    }

    const voiceSupported = !!(window.speechSynthesis || window.webkitSpeechRecognition)

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