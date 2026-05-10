import Badge from "./Badge";
import VoiceWaveform from "./Voicewaveform";

export default function QuestionBox({phase, questionType, question, isSpeaking}) {
    const questionText =
        phase === 'typing' || phase === 'questioning' || phase === 'coding'
            ? question
            : ''
    
    return (
        <div className = "w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm min-h-30">
            {/* Header row */}
            <div className = "flex items-center gap-3 mb-4">
                <Badge text = {question.questionType.toUpperCase()} color={questionType}/>

                {phase === 'evaluating' && (
                    <span className="text-sm text-gray-500 animate-pulse flex items-center gap-2">
                        <div className = "w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"/>
                        Evaluating...
                    </span>
                )}

                {phase === 'typing' && (
                    <span className = "text-sm text-blue-400 animate-pulse">AI is typing...</span>
                )}

                {isSpeaking && (
                    <span className = "text-sm text-purple-400 flex items-center gap-2">
                        <VoiceWaveform active/>
                    </span>
                )}
            </div>
            {/* Question text */}
            <p className = "text-gray-200 text-lg leading-relaxed font-medium">
                {questionText}
            </p>
        </div>
    )
}