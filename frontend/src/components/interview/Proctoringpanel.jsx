export default function ProctoringPanel({ videoRef, warnings, proctorMsg, isListening }) {
  const isHealthy = proctorMsg.includes('✅')
  const displayMsg = proctorMsg.replace('✅', 'OK').replace('⚠️', 'Alert')

  return (
    <div className="w-full lg:w-80 flex flex-col gap-6">
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 shadow-sm sticky top-6">

        {/* Panel header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Live Proctoring</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{warnings}/3 Warnings</span>
            <span className={`h-2 w-2 rounded-full animate-pulse ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>

        {/* Webcam feed */}
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4 border border-sky-200">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${
              isHealthy
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {displayMsg}
            </span>
          </div>
        </div>

        {/* Status checklist */}
        <div className="text-xs text-slate-600 space-y-2">
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
              <span className={active ? 'text-blue-600' : 'text-slate-400'}>{active ? 'OK' : 'Idle'}</span>
              {label}
            </p>
          ))}
        </div>

      </div>
    </div>
  )
}