export default function ScoreBar({ score }) {
  const barColor =
    score >= 7 ? 'bg-green-500' :
    score >= 4 ? 'bg-yellow-500' :
                 'bg-red-500'

  const width = `${(score / 10) * 100}%`

  return (
    <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
        style={{ width }}
      />
    </div>
  )
}