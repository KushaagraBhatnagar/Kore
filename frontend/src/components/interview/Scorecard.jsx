import ScoreBar from './ScoreBar'

export default function ScoreCard({ score, evaluation }) {
  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">Previous Answer</span>
        <span className="text-lg font-bold text-white">{score}/10</span>
      </div>

      <ScoreBar score={score} />

      {evaluation && (
        <p className="text-sm text-gray-400 mt-4 leading-relaxed bg-gray-950 p-3 rounded-lg border border-gray-800">
          {evaluation}
        </p>
      )}
    </div>
  )
}