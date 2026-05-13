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
                ? 'bg-blue-600 text-white'
                : 'bg-sky-50 border border-sky-200 text-slate-600 hover:bg-sky-100'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Paste warning */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
        <span className="text-amber-700 text-xs font-semibold bg-amber-100 px-2 py-0.5 rounded-full">NOTICE</span>
        <p className="text-amber-700 text-xs font-medium">
          Copy-paste is disabled. Write your solution from scratch.
        </p>
      </div>

      {/* Editor wrapper — intercepts clipboard events */}
      <div
        className="rounded-2xl overflow-hidden border border-sky-200"
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
          theme="vs-light"
          options={EDITOR_OPTIONS}
        />
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!code.trim() || loading}
        className={`w-full py-3 rounded-xl font-semibold text-base transition-all ${
          code.trim() && !loading
            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
            : 'bg-sky-100 text-sky-500 cursor-not-allowed'
        }`}
      >
        {loading ? 'Reviewing code...' : 'Submit Code'}
      </button>
    </div>
  )
}