import VoiceWaveform from "./Voicewaveform";

export function SpeakingIndicator(){
    return(
        <div className="flex items-center gap-3 bg-purple-950/30 border border-purple-800/50 rounded-2xl px-5 py-4">
            <div className="relative flex items-center justify-center w-5 h-5">
                <div className = "w-2 h-2 bg-purple-400 rounded-full animate-ping absolute"/>
                <div className = "w-2 h-2 bg-purple-300 rounded-full"/>
            </div>
            <span className = "text-purple-300 text-sm font-medium"> 
                Interviewer is speaking...
            </span>
        </div>
    )
}

export function ListeningIndicator({ transcript }) {
  return (
    <div className="flex flex-col gap-3 bg-blue-950/30 border border-blue-800/50 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-5 h-5">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping absolute" />
          <div className="w-2 h-2 bg-blue-300 rounded-full" />
        </div>
        <span className="text-blue-300 text-sm font-medium">Listening... speak your answer</span>
        <div className="ml-auto">
          <VoiceWaveform active />
        </div>
      </div>
 
      {transcript && (
        <p className="text-gray-300 text-sm leading-relaxed border-t border-blue-900/50 pt-3 italic">
          "{transcript}"
        </p>
      )}
    </div>
  )
}