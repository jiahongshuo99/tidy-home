import { useRef, useState, useCallback } from 'react'
import { Upload, X, Loader2, CheckCircle2, AlertTriangle, MapPin, ArrowRight, RotateCcw, Sparkles, Camera, ChevronDown } from 'lucide-react'

const MAX_PHOTOS = 50
const PRESET_ROOMS = ['客厅', '主卧', '次卧', '厨房', '卫生间', '书房', '餐厅', '阳台', '儿童房', '储物间']

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Idle: Home screen ────────────────────────────────────────────────────────

function HomeIdle({ profile, onGoSetup, onGoInspect }) {
  const hasProfile = profile?.rooms?.length > 0

  if (!hasProfile) {
    return (
      <div className="px-5 py-8">
        <h1 className="text-[24px] font-bold text-[#1C1917] tracking-tight leading-snug">
          欢迎使用 Tidy Home
        </h1>
        <p className="mt-2 text-[15px] text-[#78716C] leading-relaxed">
          拍下家里每个房间，AI 帮你建立收纳档案，之后随时巡检发现放错位置的物品。
        </p>

        <div className="mt-6 bg-white border border-[#DDD9D2] rounded-2xl p-5 space-y-4 mb-6">
          {[
            { step: '01', title: '建立档案', desc: '拍照 → AI 分析每个区域适合存放的物品类型' },
            { step: '02', title: '日常巡检', desc: '再次拍照 → AI 对比档案发现放错位置的物品' },
            { step: '03', title: '持续优化', desc: '随时重新建档更新标准，让家越来越整洁' },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <span className="text-[26px] font-bold text-brand-100 leading-none flex-shrink-0 w-8 tabular-nums">{item.step}</span>
              <div className="pt-0.5">
                <p className="text-sm font-semibold text-[#1C1917]">{item.title}</p>
                <p className="text-xs text-[#78716C] mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onGoSetup}
          className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-all hover:-translate-y-px active:translate-y-0"
        >
          <Camera size={16} />
          去建档页开始建立档案
        </button>
      </div>
    )
  }

  return (
    <div className="px-5 py-8">
      <h1 className="text-[24px] font-bold text-[#1C1917] tracking-tight leading-snug">
        准备好巡检了吗？
      </h1>
      <p className="mt-2 text-[15px] text-[#78716C]">
        档案已涵盖 {profile.rooms.length} 个房间，上传照片开始今日巡检。
      </p>

      <button
        onClick={onGoInspect}
        className="mt-6 w-full h-12 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-all hover:-translate-y-px active:translate-y-0"
      >
        <Camera size={16} />
        去巡检页开始巡检
      </button>

      <div className="mt-6">
        <p className="text-xs font-medium text-[#A8A29E] mb-3">当前档案概览</p>
        <div className="space-y-2">
          {profile.rooms.map(room => (
            <div key={room.roomName} className="bg-white border border-[#DDD9D2] rounded-xl px-4 py-3 flex items-center gap-2">
              <MapPin size={13} className="text-brand-500 flex-shrink-0" />
              <span className="text-sm font-medium text-[#1C1917]">{room.roomName}</span>
              <span className="text-xs text-[#A8A29E] ml-auto">{room.zones.length} 个区域</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── RoomPicker: bottom sheet modal ───────────────────────────────────────────

function RoomPicker({ currentName, usedNames, onSelect, onClose }) {
  const [custom, setCustom] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const inputRef = useRef(null)

  const extraNames = usedNames.filter(n => !PRESET_ROOMS.includes(n))
  const allOptions = [...PRESET_ROOMS, ...extraNames]

  const handleShowCustom = () => {
    setShowCustom(true)
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-2xl">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#DDD9D2] rounded-full" />
        </div>

        <div
          className="px-5 pt-3 pb-6"
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
        >
          <p className="text-sm font-semibold text-[#1C1917] mb-4">选择房间</p>

          {/* Preset chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {allOptions.map(name => (
              <button
                key={name}
                onClick={() => onSelect(name)}
                className={`h-9 px-4 rounded-full text-sm font-medium transition-colors active:scale-95 ${
                  currentName === name
                    ? 'bg-brand-500 text-white'
                    : 'bg-[#F7F5F2] text-[#78716C] active:bg-brand-50 active:text-brand-600'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Custom input */}
          {showCustom ? (
            <div className="flex gap-2 mb-3">
              <input
                ref={inputRef}
                type="text"
                value={custom}
                onChange={e => setCustom(e.target.value)}
                placeholder="输入房间名称"
                className="flex-1 h-11 px-3 border border-[#DDD9D2] focus:border-brand-500 rounded-[10px] text-sm outline-none"
                onKeyDown={e => { if (e.key === 'Enter' && custom.trim()) onSelect(custom.trim()) }}
              />
              <button
                onClick={() => custom.trim() && onSelect(custom.trim())}
                disabled={!custom.trim()}
                className="h-11 px-4 bg-brand-500 disabled:opacity-40 text-white text-sm font-semibold rounded-[10px] transition-opacity"
              >
                确认
              </button>
            </div>
          ) : (
            <button
              onClick={handleShowCustom}
              className="w-full h-11 mb-3 border border-dashed border-[#DDD9D2] rounded-[10px] text-sm text-[#A8A29E] flex items-center justify-center gap-1.5 active:bg-[#F7F5F2] transition-colors"
            >
              + 自定义房间名
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full h-11 text-sm font-medium text-[#A8A29E]"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Upload: photo grid + drop zone ────────────────────────────────────────────

const STATUS_BORDER = {
  waiting: 'border-[#DDD9D2]',
  loading: 'border-l-4 border-l-brand-500 border-[#DDD9D2]',
  done:    'border-l-4 border-l-[#4D7C5F] border-[#DDD9D2]',
  error:   'border-l-4 border-l-red-500 border-[#DDD9D2]',
}

function PhotoCard({ photo, onRemove, onOpenPicker, analyzing }) {
  const { id, dataUrl, roomName, status = 'waiting', result, error } = photo
  return (
    <div className={`bg-white rounded-xl border ${STATUS_BORDER[status]} overflow-hidden transition-all duration-150 group`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F5F2]">
        <img src={dataUrl} alt={roomName} className={`w-full h-full object-cover transition-all duration-300 ${status === 'loading' ? 'blur-sm scale-105' : ''}`} />
        {status === 'loading' && (
          <div className="absolute inset-0 bg-white/30 flex items-center justify-center">
            <Loader2 size={24} className="text-brand-500 animate-spin" />
          </div>
        )}
        {status === 'done' && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 rounded-full bg-[#4D7C5F] flex items-center justify-center">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 bg-red-50/80 flex items-center justify-center">
            <div className="text-center px-3">
              <AlertTriangle size={20} className="text-red-500 mx-auto mb-1" />
              <p className="text-xs text-red-600">分析失败</p>
            </div>
          </div>
        )}
        {status === 'waiting' && <div className="absolute inset-0 shimmer bg-[#F7F5F2]" />}
        {!analyzing && (
          <button
            onClick={() => onRemove(id)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="px-3 py-2.5 space-y-2">
        {!analyzing ? (
          <button
            onClick={() => onOpenPicker(id)}
            className="w-full flex items-center justify-between bg-[#F7F5F2] rounded-lg px-2.5 py-2 active:bg-[#EEEBE6] transition-colors"
          >
            <span className="text-xs font-medium text-[#1C1917]">{roomName || '选择房间'}</span>
            <ChevronDown size={12} className="text-[#A8A29E] flex-shrink-0" />
          </button>
        ) : (
          <div className="flex items-center justify-between px-2.5 py-2">
            <span className="text-xs font-medium text-[#1C1917]">{roomName}</span>
            {status === 'loading' && <span className="text-xs text-brand-500 font-medium">分析中…</span>}
            {status === 'waiting' && <span className="text-xs text-[#A8A29E]">等待中</span>}
          </div>
        )}
        {status === 'done' && result?.zones?.length > 0 && (
          <div className="pt-1 border-t border-[#EEEBE6]">
            <div className="flex flex-wrap gap-1">
              {result.zones.map(zone => (
                <span key={zone.id || zone.name} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-900 text-[11px] font-medium">
                  {zone.name}
                  {zone.issues?.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                </span>
              ))}
            </div>
          </div>
        )}
        {status === 'error' && <p className="text-[11px] text-red-500">{error || '分析失败，请检查 API Key'}</p>}
      </div>
    </div>
  )
}

function UploadSection({ mode, photos, setPhotos, analyzing, stage2Status, getNextId, onStartAnalysis, onCancel }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [pickerPhotoId, setPickerPhotoId] = useState(null)
  const dragCounter = useRef(0)

  const usedNames = [...new Set(photos.map(p => p.roomName).filter(Boolean))]
  const pickerPhoto = pickerPhotoId ? photos.find(p => p.id === pickerPhotoId) : null

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
        roomName: '客厅',
        status: 'waiting',
        result: null,
        error: null,
      }))
    )
    setPhotos(prev => [...prev, ...newPhotos])
  }, [getNextId, setPhotos, photos.length])

  const handleDragEnter = (e) => { e.preventDefault(); dragCounter.current++; setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); dragCounter.current--; if (dragCounter.current === 0) setIsDragging(false) }
  const handleDragOver  = (e) => { e.preventDefault() }
  const handleDrop      = (e) => { e.preventDefault(); dragCounter.current = 0; setIsDragging(false); addFiles(e.dataTransfer.files) }
  const handleRemove    = (id) => setPhotos(prev => prev.filter(p => p.id !== id))
  const handleRoomNameChange = (id, roomName) => setPhotos(prev => prev.map(p => p.id === id ? { ...p, roomName } : p))

  const handlePickerSelect = (name) => {
    if (pickerPhotoId) handleRoomNameChange(pickerPhotoId, name)
    setPickerPhotoId(null)
  }

  const doneCount = photos.filter(p => p.status === 'done').length

  return (
    <div className="px-5 py-6">
      {/* Drop zone */}
      {!analyzing && (
        <div
          onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
          onDragOver={handleDragOver} onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`mb-5 rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center h-[160px] transition-all duration-150 ${isDragging ? 'border-brand-500 bg-brand-50' : 'border-[#DDD9D2] bg-white hover:border-brand-500 hover:bg-brand-50'}`}
        >
          <Upload size={20} className={`mb-2 ${isDragging ? 'text-brand-500' : 'text-[#A8A29E]'}`} />
          <p className={`text-sm font-medium ${isDragging ? 'text-brand-600' : 'text-[#78716C]'}`}>
            {isDragging ? '松开即可上传' : '拍照或选择图片'}
          </p>
          <p className="mt-1 text-xs text-[#A8A29E]">最多 {MAX_PHOTOS} 张</p>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          {photos.map(photo => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onRemove={handleRemove}
              onOpenPicker={setPickerPhotoId}
              analyzing={analyzing}
            />
          ))}
        </div>
      )}

      {/* Stage 2 banner */}
      {stage2Status === 'loading' && (
        <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 flex items-center gap-3 mb-5">
          <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
          <span className="text-sm text-brand-900">正在综合分析，生成{mode === 'setup' ? '档案' : '巡检报告'}…</span>
        </div>
      )}
      {stage2Status === 'error' && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
          <p className="text-sm text-red-700">综合分析失败，请检查 API Key 后重试</p>
        </div>
      )}

      {/* Action row */}
      {!analyzing && (
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="h-11 px-4 border border-[#DDD9D2] hover:border-[#C4BFB7] text-[#78716C] text-sm font-medium rounded-[10px] transition-all"
          >
            取消
          </button>
          <button
            onClick={onStartAnalysis}
            disabled={photos.length === 0}
            className="flex-1 h-11 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-all hover:enabled:-translate-y-px"
          >
            <Sparkles size={15} />
            开始{mode === 'setup' ? '建档' : '巡检'}（{photos.length} 张）
          </button>
        </div>
      )}
      {analyzing && (
        <div className="flex items-center justify-between text-xs text-[#A8A29E]">
          <span>已完成 {doneCount} / {photos.length} 张</span>
        </div>
      )}

      {/* Room picker bottom sheet */}
      {pickerPhotoId && pickerPhoto && !analyzing && (
        <RoomPicker
          currentName={pickerPhoto.roomName}
          usedNames={usedNames}
          onSelect={handlePickerSelect}
          onClose={() => setPickerPhotoId(null)}
        />
      )}
    </div>
  )
}

// ── Setup results ─────────────────────────────────────────────────────────────

function SetupDone({ result, onConfirm, onRedo }) {
  const rooms = result?.rooms ?? []
  return (
    <div className="px-5 py-6">
      <div className="mb-5">
        <h2 className="text-[20px] font-bold text-[#1C1917]">家居档案草稿</h2>
        <p className="mt-1 text-sm text-[#78716C]">
          识别 {rooms.length} 个房间、{rooms.reduce((n, r) => n + r.zones.length, 0)} 个区域。确认后保存为巡检基准。
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {rooms.map(room => (
          <div key={room.roomName} className="bg-white border border-[#DDD9D2] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#EEEBE6] flex items-center gap-2">
              <MapPin size={13} className="text-brand-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-[#1C1917]">{room.roomName}</span>
              <span className="text-xs text-[#A8A29E] ml-auto">{room.zones.length} 个区域</span>
            </div>
            <div className="divide-y divide-[#EEEBE6]">
              {room.zones.map(zone => (
                <div key={zone.name} className="px-4 py-3">
                  <p className="text-xs font-semibold text-[#1C1917] mb-2">{zone.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {zone.suitable_items?.map((item, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-900 text-[12px] font-medium">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onConfirm} className="flex-1 h-11 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-all hover:-translate-y-px">
          <CheckCircle2 size={15} />
          确认并保存档案
        </button>
        <button onClick={onRedo} className="h-11 px-4 border border-[#DDD9D2] hover:border-[#C4BFB7] text-[#78716C] text-sm font-medium rounded-[10px] transition-all flex items-center gap-1.5">
          <RotateCcw size={13} />
          重拍
        </button>
      </div>
    </div>
  )
}

// ── Inspect results ───────────────────────────────────────────────────────────

function InspectDone({ result, onRedo }) {
  const items = result?.misplaced_items ?? []
  return (
    <div className="px-5 py-6">
      <div className="mb-5">
        <h2 className="text-[20px] font-bold text-[#1C1917]">巡检报告</h2>
        <p className="mt-1 text-sm text-[#78716C]">
          {items.length > 0
            ? `发现 ${items.length} 件物品放置不合理`
            : '所有物品均符合收纳档案标准'
          }
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F0F7F3] flex items-center justify-center mb-3">
            <CheckCircle2 size={28} className="text-[#4D7C5F]" />
          </div>
          <p className="text-sm font-semibold text-[#1C1917]">家里很整洁</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {items.map((item, i) => (
            <div key={i} className="bg-white border border-[#DDD9D2] border-l-4 border-l-amber-400 rounded-xl px-4 py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1917]">{item.item}</p>
                  <p className="text-xs text-[#78716C] mt-0.5">{item.current_zone}</p>
                  <p className="text-xs text-[#78716C] mt-1.5 leading-relaxed">{item.reason}</p>
                  <div className="flex items-start gap-1.5 bg-brand-50 rounded-lg px-3 py-2 mt-2">
                    <ArrowRight size={11} className="text-brand-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-brand-900 leading-relaxed">{item.suggestion}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={onRedo} className="w-full h-11 border border-[#DDD9D2] hover:border-[#C4BFB7] text-[#78716C] text-sm font-medium rounded-[10px] flex items-center justify-center gap-2 transition-all">
        <RotateCcw size={13} />
        再次巡检
      </button>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function HomeTab({
  homeState,
  mode,
  profile,
  photos, setPhotos,
  setupResult, onConfirmProfile,
  inspectResult,
  stage2Status,
  getNextId,
  onStartAnalysis,
  onCancelUpload,
  onRedoSetup,
  onRedoInspect,
  onGoSetup,
  onGoInspect,
}) {
  const analyzing = homeState === 'analyzing'
  const modeBadge = mode === 'inspect'
    ? <span className="text-xs text-[#4D7C5F] font-medium bg-[#F0F7F3] px-2 py-0.5 rounded-full">巡检</span>
    : <span className="text-xs text-brand-500 font-medium bg-brand-50 px-2 py-0.5 rounded-full">建档</span>

  const progressPct = analyzing && photos.length > 0
    ? Math.round((photos.filter(p => p.status === 'done').length / photos.length) * 100)
    : 0

  return (
    <div>
      {/* Progress bar — below status bar */}
      {analyzing && (
        <div
          className="fixed left-0 right-0 h-[3px] bg-[#EEEBE6] z-50"
          style={{ top: 'env(safe-area-inset-top)' }}
        >
          <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      {/* Header — extends into status bar with safe-area padding */}
      <header
        className="bg-white border-b border-[#EEEBE6] sticky top-0 z-40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[600px] mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-[#1C1917]">Tidy Home</span>
            {(homeState === 'uploading' || homeState === 'analyzing' || homeState === 'setup-done' || homeState === 'inspect-done') && modeBadge}
          </div>
        </div>
      </header>

      <div className="max-w-[600px] mx-auto">
        {homeState === 'idle' && (
          <HomeIdle profile={profile} onGoSetup={onGoSetup} onGoInspect={onGoInspect} />
        )}
        {(homeState === 'uploading' || homeState === 'analyzing') && (
          <UploadSection
            mode={mode}
            photos={photos}
            setPhotos={setPhotos}
            analyzing={analyzing}
            stage2Status={stage2Status}
            getNextId={getNextId}
            onStartAnalysis={onStartAnalysis}
            onCancel={onCancelUpload}
          />
        )}
        {homeState === 'setup-done' && (
          <SetupDone result={setupResult} onConfirm={onConfirmProfile} onRedo={onRedoSetup} />
        )}
        {homeState === 'inspect-done' && (
          <InspectDone result={inspectResult} onRedo={onRedoInspect} />
        )}
      </div>
    </div>
  )
}
