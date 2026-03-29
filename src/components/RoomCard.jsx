import { X, Loader2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'

const ROOM_TYPES = ['客厅', '卧室', '厨房', '书房', '餐厅', '卫生间', '其他']

const ZONE_TYPE_LABEL = {
  storage: '收纳',
  surface: '台面',
  display: '展示',
}

const STATUS_BORDER = {
  waiting: 'border-[#DDD9D2]',
  loading: 'border-l-4 border-l-brand-500 border-[#DDD9D2]',
  done:    'border-l-4 border-l-[#4D7C5F] border-[#DDD9D2]',
  error:   'border-l-4 border-l-red-500 border-[#DDD9D2]',
}

export default function RoomCard({ photo, onRemove, onRoomTypeChange, analyzing }) {
  const { id, dataUrl, roomType, status = 'waiting', result, error } = photo

  return (
    <div className={`bg-white rounded-xl border ${STATUS_BORDER[status]} overflow-hidden transition-all duration-150 group`}>
      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F5F2]">
        <img
          src={dataUrl}
          alt={roomType}
          className={`w-full h-full object-cover transition-all duration-300 ${status === 'loading' ? 'blur-sm scale-105' : ''}`}
        />

        {/* Status overlay */}
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

        {/* Skeleton shimmer for waiting */}
        {status === 'waiting' && (
          <div className="absolute inset-0 shimmer bg-[#F7F5F2]" />
        )}

        {/* Remove button — only when not analyzing */}
        {!analyzing && (
          <button
            onClick={() => onRemove(id)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="px-3 py-2.5 space-y-2">
        {/* Room type selector */}
        {!analyzing ? (
          <select
            value={roomType}
            onChange={e => onRoomTypeChange(id, e.target.value)}
            className="w-full text-xs font-medium text-[#1C1917] bg-transparent outline-none cursor-pointer"
          >
            {ROOM_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#1C1917]">{roomType}</span>
            {status === 'loading' && (
              <span className="text-xs text-brand-500 font-medium">分析中…</span>
            )}
            {status === 'waiting' && (
              <span className="text-xs text-[#A8A29E]">等待中</span>
            )}
          </div>
        )}

        {/* Result: zone tags */}
        {status === 'done' && result?.zones?.length > 0 && (
          <div className="pt-1 border-t border-[#EEEBE6]">
            <p className="text-xs text-[#A8A29E] mb-1.5">识别到 {result.zones.length} 个区域</p>
            <div className="flex flex-wrap gap-1">
              {result.zones.map(zone => (
                <span
                  key={zone.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-900 text-[11px] font-medium"
                >
                  {zone.name}
                  {zone.issues?.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  )}
                </span>
              ))}
            </div>
            {result.room_summary && (
              <p className="mt-1.5 text-[11px] text-[#A8A29E] leading-relaxed">{result.room_summary}</p>
            )}
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <p className="text-[11px] text-red-500">{error || '分析失败，请检查 API Key 后重试'}</p>
        )}
      </div>
    </div>
  )
}
