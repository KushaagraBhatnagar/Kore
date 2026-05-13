import VoiceWaveform from "./Voicewaveform";

export function SpeakingIndicator(){
    return(
  <div className="flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-2xl px-5 py-4">
            <div className="relative flex items-center justify-center w-5 h-5">
        <div className = "w-2 h-2 bg-blue-500 rounded-full animate-ping absolute"/>
        <div className = "w-2 h-2 bg-blue-500 rounded-full"/>
            </div>
      <span className = "text-slate-700 text-sm font-medium"> 
                Interviewer is speaking...
            </span>
        </div>
    )
}

export function ListeningIndicator({ transcript }) {
  return (
    <div className="flex flex-col gap-3 bg-sky-50 border border-sky-200 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-5 h-5">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping absolute" />
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
        <span className="text-slate-700 text-sm font-medium">Listening... speak your answer</span>
        <div className="ml-auto">
          <VoiceWaveform active />
        </div>
      </div>
 
      {transcript && (
        <p className="text-slate-600 text-sm leading-relaxed border-t border-sky-200 pt-3 italic">
          "{transcript}"
        </p>
      )}
    </div>
  )
}