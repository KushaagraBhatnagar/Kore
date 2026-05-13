export default function WarningBanner({ warnings, message }) {
  return (
    <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm flex items-center gap-3">
      <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">ALERT</span>
      <div>
        <p className="font-bold text-sm">Warning {warnings}/3</p>
        <p className="text-xs opacity-80">{message}</p>
      </div>
    </div>
  )
}