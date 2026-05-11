import { ListeningIndicator } from './StatusIndicators'

export default function VoiceAnswerPanel({
  isListening,
  answer,
  loading,
  voiceSupported,
  onStopListening,
  onReRecord,
  onSubmit,
}) {
  return (
    <div className="w-full flex flex-col gap-3">

      {/* Live transcript while mic is active */}
      {isListening && <ListeningIndicator transcript={answer} />}

      {/* Recorded transcript review */}
      {!isListening && answer && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Your Answer</p>
          <p className="text-gray-200 text-sm leading-relaxed">{answer}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {voiceSupported ? (
          <button
            onClick={isListening ? onStopListening : onReRecord}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              isListening
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <span>{isListening ? '⏹' : '🎙️'}</span>
            {isListening ? 'Stop' : answer ? 'Re-record' : 'Start Speaking'}
          </button>
        ) : (
          <p className="text-red-400 text-xs self-center">
            Voice not supported. Use Chrome or Edge.
          </p>
        )}

        <button
          onClick={onSubmit}
          disabled={!answer.trim() || loading || isListening}
          className={`flex-1 py-3 rounded-xl font-semibold text-base transition-all ${
            answer.trim() && !loading && !isListening
              ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-900/20'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Answer'}
        </button>
      </div>

      {/* Hint when idle */}
      {!isListening && !answer && (
        <p className="text-gray-600 text-xs text-center">
          Mic will start automatically after the question. You can also tap 🎙️ to speak.
        </p>
      )}
    </div>
  )
}