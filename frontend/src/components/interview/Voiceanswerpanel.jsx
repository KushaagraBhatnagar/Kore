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

      {isListening && (
        <div className="flex items-center gap-2 text-xs text-sky-700 bg-sky-100 border border-sky-200 rounded-xl px-3 py-2">
          <span className="font-semibold">Mic locked on</span>
          <span className="text-slate-600">Press Stop to end recording.</span>
        </div>
      )}

      {/* Recorded transcript review */}
      {!isListening && answer && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Your Answer</p>
          <p className="text-slate-800 text-sm leading-relaxed">{answer}</p>
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
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-sky-100 hover:bg-sky-200 text-slate-800'
            }`}
          >
            {isListening ? 'Stop' : answer ? 'Re-record' : 'Start Speaking'}
          </button>
        ) : (
          <p className="text-red-600 text-xs self-center">
            Voice not supported. Use Chrome or Edge.
          </p>
        )}

        <button
          onClick={onSubmit}
          disabled={!answer.trim() || loading || isListening}
          className={`flex-1 py-3 rounded-xl font-semibold text-base transition-all ${
            answer.trim() && !loading && !isListening
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              : 'bg-sky-100 text-sky-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Answer'}
        </button>
      </div>

      {/* Hint when idle */}
      {!isListening && !answer && (
        <p className="text-slate-500 text-xs text-center">
          Mic will start automatically after the question. You can also tap Mic to speak.
        </p>
      )}
    </div>
  )
}