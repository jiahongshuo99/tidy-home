import { useRef, useState, useCallback } from 'react'
import { Upload, Settings, Sparkles } from 'lucide-react'
import RoomCard from './RoomCard'

const DEFAULT_ROOM_NAME = '客厅'
const MAX_PHOTOS = 50

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
  mode,
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
  concurrency,
  setConcurrency,
}) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const existingRoomNames = [...new Set(photos.map(p => p.roomName).filter(Boolean))]

  const addFiles = useCallback(async (files) => {
    const imageFiles = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, MAX_PHOTOS - photos.length)
    if (!imageFiles.length) return

    const newPhotos = await Promise.all(
      imageFiles.map(async (file) => ({
        id: getNextId(),
        file,
        dataUrl: await fileToDataUrl(file),
        roomName: DEFAULT_ROOM_NAME,
        status: 'waiting',
        result: null,
        error: null,
      }))
    )
    setPhotos(prev => [...prev, ...newPhotos])
  }, [getNextId, setPhotos, photos.length])

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
  const handleRoomNameChange = (id, roomName) =>
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, roomName } : p))

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
            {mode === 'inspect' ? (
              <span className="text-xs text-[#4D7C5F] font-medium bg-[#F0F7F3] px-2 py-0.5 rounded-full">巡检</span>
            ) : (
              <span className="text-xs text-brand-500 font-medium bg-brand-50 px-2 py-0.5 rounded-full">建档</span>
            )}
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
            {mode === 'inspect' ? '拍下当前各房间的状态' : '拍下你的每个房间'}
          </h1>
          <p className="mt-1.5 text-[15px] text-[#78716C]">
            {mode === 'inspect'
              ? '上传照片，AI 将对比档案发现放错位置的物品。同名照片合并为一个房间。'
              : '上传后为每张照片填写房间名称。同名照片将合并为一个房间进行分析。'
            }
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
            <p className="mt-1 text-xs text-[#A8A29E]">支持 JPG、PNG、HEIC，最多 {MAX_PHOTOS} 张</p>
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
                onRoomNameChange={handleRoomNameChange}
                analyzing={analyzing}
                existingRoomNames={existingRoomNames}
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
            <div className="flex items-center gap-5 px-1 flex-wrap">
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
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-[#A8A29E] font-medium">并发度</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={concurrency}
                  onChange={e => setConcurrency(Math.max(1, Math.min(10, Number(e.target.value))))}
                  className="w-12 h-6 text-center text-xs font-medium text-[#1C1917] border border-[#DDD9D2] rounded-md bg-white outline-none focus:border-brand-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#A8A29E]">
                {photos.length > 0
                  ? `${photos.length} 张照片 · ${[...new Set(photos.map(p => p.roomName))].length} 个房间`
                  : '还没有上传照片'}
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
