export default function ProctoringPanel({ videoRef, warnings, proctorMsg, isListening }) {
  const isHealthy = proctorMsg.includes('✅')

  return (
    <div className="w-full lg:w-80 flex flex-col gap-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-md sticky top-6">

        {/* Panel header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">Live Proctoring</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{warnings}/3 Warnings</span>
            <span className={`h-2 w-2 rounded-full animate-pulse ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>

        {/* Webcam feed */}
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4 border border-gray-700 shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-lg backdrop-blur-md ${
              isHealthy
                ? 'bg-green-900/60 text-green-300'
                : 'bg-red-900/80 text-red-200 border border-red-500/50'
            }`}>
              {proctorMsg}
            </span>
          </div>
        </div>

        {/* Status checklist */}
        <div className="text-xs text-gray-400 space-y-2">
          {[
            { label: 'Face visibility tracking' },
            { label: 'Eye movement analysis' },
            { label: 'Device detection active' },
            {
              label: isListening ? 'Mic active — listening' : 'Voice recognition ready',
              active: isListening,
            },
          ].map(({ label, active }) => (
            <p key={label} className="flex items-center gap-2">
              <span className={active ? 'text-blue-400' : 'text-gray-600'}>✓</span>
              {label}
            </p>
          ))}
        </div>

      </div>
    </div>
  )
}