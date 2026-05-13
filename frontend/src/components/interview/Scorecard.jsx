import ScoreBar from './ScoreBar'

export default function ScoreCard({ score, evaluation }) {
  return (
    <div className="w-full bg-sky-50 border border-sky-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-600">Previous Answer</span>
        <span className="text-lg font-bold text-slate-900">{score}/10</span>
      </div>

      <ScoreBar score={score} />

      {evaluation && (
        <p className="text-sm text-slate-600 mt-4 leading-relaxed bg-sky-100 p-3 rounded-lg border border-sky-200">
          {evaluation}
        </p>
      )}
    </div>
  )
}