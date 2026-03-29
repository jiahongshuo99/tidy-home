import { useRef, useState, useCallback } from 'react'
import { Upload, Settings, Sparkles } from 'lucide-react'
import RoomCard from './RoomCard'

const DEFAULT_ROOM_TYPE = '客厅'

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function ThinkingToggle({ label, enabled, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span className="text-xs text-[#78716C]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${enabled ? 'bg-brand-500' : 'bg-[#D6D3D1]'}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </label>
  )
}

export default function UploadPage({
  photos,
  setPhotos,
  onStartAnalysis,
  analyzing,
  stage2Status,
  onChangeApiKey,
  getNextId,
  stage1Thinking,
  setStage1Thinking,
  stage2Thinking,
  setStage2Thinking,
}) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const addFiles = useCallback(async (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!imageFiles.length) return

    const newPhotos = await Promise.all(
      imageFiles.map(async (file) => ({
        id: getNextId(),
        file,
        dataUrl: await fileToDataUrl(file),
        roomType: DEFAULT_ROOM_TYPE,
        status: 'waiting',
        result: null,
        error: null,
      }))
    )
    setPhotos(prev => [...prev, ...newPhotos])
  }, [getNextId, setPhotos])

  const handleDragEnter = (e) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }
  const handleDragLeave = (e) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }
  const handleDragOver = (e) => { e.preventDefault() }
  const handleDrop = (e) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleRemove = (id) => setPhotos(prev => prev.filter(p => p.id !== id))
  const handleRoomTypeChange = (id, roomType) =>
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, roomType } : p))

  const doneCount = photos.filter(p => p.status === 'done').length
  const totalCount = photos.length

  const progressPct = analyzing && totalCount > 0
    ? Math.round((doneCount / totalCount) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Progress bar */}
      {analyzing && (
        <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#EEEBE6] z-50">
          <div
            className="h-full bg-brand-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-[#EEEBE6] sticky top-0 z-40">
        <div className="max-w-[1024px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#1C1917]">Tidy Home</span>
            <div className="flex items-center gap-1 text-xs text-[#A8A29E]">
              <span className={`${!analyzing ? 'text-brand-500 font-medium' : 'text-[#A8A29E]'}`}>
                上传照片
              </span>
              <span>→</span>
              <span className={`${analyzing ? 'text-brand-500 font-medium' : 'text-[#A8A29E]'}`}>
                分析中
              </span>
              <span>→</span>
              <span className="text-[#A8A29E]">查看结果</span>
            </div>
          </div>
          <button
            onClick={onChangeApiKey}
            className="flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <Settings size={13} />
            API Key
          </button>
        </div>
      </header>

      <main className="max-w-[1024px] mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-[#1C1917] tracking-tight leading-snug">
            拍下你的每个房间
          </h1>
          <p className="mt-1.5 text-[15px] text-[#78716C]">
            AI 帮你找出收纳问题，给出具体的整理方案。建议覆盖每个主要区域，拍摄角度尽量包含整面墙。
          </p>
        </div>

        {/* Drop zone */}
        {!analyzing && (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              mb-6 rounded-2xl border-2 border-dashed cursor-pointer
              flex flex-col items-center justify-center h-[180px]
              transition-all duration-150
              ${isDragging
                ? 'border-brand-500 bg-brand-50'
                : 'border-[#DDD9D2] bg-white hover:border-brand-500 hover:bg-brand-50'
              }
            `}
          >
            <Upload
              size={22}
              className={`mb-2.5 ${isDragging ? 'text-brand-500' : 'text-[#A8A29E]'}`}
            />
            <p className={`text-sm font-medium ${isDragging ? 'text-brand-600' : 'text-[#78716C]'}`}>
              {isDragging ? '松开即可上传' : '拖拽照片到这里，或点击选择'}
            </p>
            <p className="mt-1 text-xs text-[#A8A29E]">支持 JPG、PNG、HEIC，最多 20 张</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />
          </div>
        )}

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {photos.map(photo => (
              <RoomCard
                key={photo.id}
                photo={photo}
                onRemove={handleRemove}
                onRoomTypeChange={handleRoomTypeChange}
                analyzing={analyzing}
              />
            ))}
          </div>
        )}

        {/* Stage 2 banner */}
        {stage2Status === 'loading' && (
          <div className="w-full rounded-xl bg-brand-50 border border-brand-100 px-5 py-4 flex items-center gap-3 mb-6">
            <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
            <span className="text-sm text-brand-900">
              正在综合分析所有房间，生成整体收纳方案…
            </span>
          </div>
        )}

        {stage2Status === 'error' && (
          <div className="w-full rounded-xl bg-red-50 border border-red-100 px-5 py-4 flex items-center gap-3 mb-6">
            <span className="text-sm text-red-700">综合分析失败，请检查 API Key 后重试</span>
          </div>
        )}

        {/* Bottom action */}
        {!analyzing && (
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-5 px-1">
              <span className="text-xs text-[#A8A29E] font-medium">模型思考</span>
              <ThinkingToggle
                label="图片分析（Stage 1）"
                enabled={stage1Thinking}
                onChange={setStage1Thinking}
              />
              <ThinkingToggle
                label="综合分析（Stage 2）"
                enabled={stage2Thinking}
                onChange={setStage2Thinking}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#A8A29E]">
                {photos.length > 0 ? `已上传 ${photos.length} 张照片` : '还没有上传照片'}
              </p>
              <button
                onClick={onStartAnalysis}
                disabled={photos.length === 0}
                className="h-10 px-5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-[10px] flex items-center gap-2 transition-all hover:enabled:-translate-y-px active:enabled:translate-y-0"
              >
                <Sparkles size={15} />
                开始分析（{photos.length} 张照片）
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
