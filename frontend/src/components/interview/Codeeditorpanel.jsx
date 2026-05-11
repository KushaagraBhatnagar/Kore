import Editor from '@monaco-editor/react'

const LANGUAGES = ['javascript', 'python', 'java', 'cpp']

const EDITOR_OPTIONS = {
  minimap:            { enabled: false },
  contextmenu:        false,
  fontSize:           14,
  fontFamily:         'JetBrains Mono, Fira Code, monospace',
  lineNumbers:        'on',
  scrollBeyondLastLine: false,
  automaticLayout:    true,
  tabSize:            2,
  wordWrap:           'on',
  padding:            { top: 16, bottom: 16 },
}

export default function CodeEditorPanel({
  code,
  language,
  loading,
  onCodeChange,
  onLanguageChange,
  onSubmit,
  onPasteViolation,
}) {
  return (
    <div className="w-full flex flex-col gap-3">

      {/* Language selector */}
      <div className="flex gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              language === lang
                ? 'bg-yellow-600 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Paste warning */}
      <div className="flex items-center gap-2 bg-yellow-950/30 border border-yellow-900/50 rounded-xl px-4 py-2">
        <span className="text-yellow-500 text-xs">⚠️</span>
        <p className="text-yellow-400 text-xs font-medium">
          Copy-paste is disabled. Write your solution from scratch.
        </p>
      </div>

      {/* Editor wrapper — intercepts clipboard events */}
      <div
        className="rounded-2xl overflow-hidden border border-gray-700 shadow-inner"
        onPaste={(e)       => { e.preventDefault(); onPasteViolation() }}
        onCopy={(e)        => e.preventDefault()}
        onCut={(e)         => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Editor
          height="320px"
          language={language}
          value={code}
          onChange={(val) => onCodeChange(val ?? '')}
          theme="vs-dark"
          options={EDITOR_OPTIONS}
        />
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!code.trim() || loading}
        className={`w-full py-3 rounded-xl font-semibold text-base transition-all ${
          code.trim() && !loading
            ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-900/20 cursor-pointer'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loading ? 'Reviewing code...' : 'Submit Code'}
      </button>
    </div>
  )
}