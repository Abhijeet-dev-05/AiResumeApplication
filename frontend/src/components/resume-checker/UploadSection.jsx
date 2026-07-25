import { useRef, useState, useCallback } from 'react'
import { Upload, FileText, X, Sparkles, AlertCircle } from 'lucide-react'

export default function UploadSection({ onAnalyze, loading, error }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = useCallback((f) => {
    if (!f) return
    if (f.type !== 'application/pdf') {
      alert('Please upload a PDF file.')
      return
    }
    setFile(f)
  }, [])

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files[0]
      handleFile(f)
    },
    [handleFile]
  )

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const onInputChange = (e) => handleFile(e.target.files[0])

  const removeFile = (e) => {
    e.stopPropagation()
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSubmit = () => {
    if (file) onAnalyze(file)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Drop Zone */}
      <div
        onClick={() => !file && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-200 group
          ${dragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : file
            ? 'border-primary/40 bg-primary/5 cursor-default'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={onInputChange}
        />

        {file ? (
          /* File selected state */
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={removeFile}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors mt-1"
            >
              <X className="w-3.5 h-3.5" />
              Remove file
            </button>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
              ${dragging ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'}`}>
              <Upload className={`w-7 h-7 transition-colors ${dragging ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                Drop your resume here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or{' '}
                <span className="text-primary font-medium underline underline-offset-2">
                  browse files
                </span>
                {' '}· PDF only
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className={`
          w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm
          transition-all duration-200
          ${!file || loading
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.99] shadow-md hover:shadow-lg'
          }
        `}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            Analyzing your resume...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Analyze Resume
          </>
        )}
      </button>

      {loading && (
        <p className="text-center text-xs text-muted-foreground">
          This takes 20–60 seconds. The AI is doing a thorough review.
        </p>
      )}
    </div>
  )
}
