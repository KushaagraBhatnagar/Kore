const BAR_HEIGHTS = [0.4, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8, 0.4, 0.7, 0.6]

export default function VoiceWaveform({ active }) {
  return (
    <div className="flex items-center gap-1" style={{ height: '32px' }}>
      <style>{`
        @keyframes voiceBar {
          0%   { height: 4px; }
          100% { height: var(--bar-h); }
        }
      `}</style>

      {BAR_HEIGHTS.map((h, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            borderRadius: '4px',
            backgroundColor: active ? '#60a5fa' : '#374151',
            height: active ? undefined : '3px',
            '--bar-h': `${h * 28}px`,
            animation: active
              ? `voiceBar 0.6s ease-in-out ${i * 0.07}s infinite alternate`
              : 'none',
            minHeight: '3px',
            transition: 'background-color 0.3s',
          }}
        />
      ))}
    </div>
  )
}