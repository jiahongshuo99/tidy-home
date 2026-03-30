import { Camera, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { useState } from 'react'

function formatDate(iso) {
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function HistoryCard({ entry }) {
  const [expanded, setExpanded] = useState(false)
  const items = entry.result?.misplaced_items ?? []

  return (
    <div className="bg-white border border-[#DDD9D2] rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-4 py-4 flex items-center gap-3 text-left"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${items.length > 0 ? 'bg-amber-50' : 'bg-[#F0F7F3]'}`}>
          {items.length > 0
            ? <AlertTriangle size={15} className="text-amber-500" />
            : <CheckCircle2 size={15} className="text-[#4D7C5F]" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1C1917]">
            {items.length > 0 ? `发现 ${items.length} 件错位物品` : '全部符合档案标准'}
          </p>
          <p className="text-xs text-[#A8A29E] mt-0.5">{formatDate(entry.timestamp)}</p>
        </div>
        {items.length > 0 && (
          expanded ? <ChevronUp size={16} className="text-[#A8A29E] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#A8A29E] flex-shrink-0" />
        )}
      </button>

      {expanded && items.length > 0 && (
        <div className="border-t border-[#EEEBE6] divide-y divide-[#EEEBE6]">
          {items.map((item, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1917]">{item.item}</p>
                  <p className="text-xs text-[#78716C] mt-0.5">{item.current_zone}</p>
                  <p className="text-xs text-[#78716C] mt-1 leading-relaxed">{item.reason}</p>
                  <div className="flex items-start gap-1.5 bg-brand-50 rounded-lg px-2.5 py-1.5 mt-1.5">
                    <ArrowRight size={11} className="text-brand-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-brand-900 leading-relaxed">{item.suggestion}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function InspectTab({ profile, history, onStartInspect }) {
  const hasProfile = profile?.rooms?.length > 0

  return (
    <div>
      <header
        className="bg-white border-b border-[#EEEBE6] sticky top-0 z-40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[600px] mx-auto px-5 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#1C1917]">巡检</span>
          {hasProfile && (
            <button
              onClick={onStartInspect}
              className="h-8 px-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-[8px] flex items-center gap-1.5 transition-all"
            >
              <Camera size={13} />
              开始巡检
            </button>
          )}
        </div>
      </header>

      <div className="max-w-[600px] mx-auto px-5 py-6">
        {!hasProfile ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-[#1C1917] mb-1">尚未建档</p>
            <p className="text-xs text-[#A8A29E]">请先前往「建档」页建立收纳档案，再开始巡检</p>
          </div>
        ) : history.length === 0 ? (
          <>
            <div className="flex flex-col items-center justify-center py-12 text-center mb-6">
              <p className="text-sm font-medium text-[#1C1917] mb-1">暂无巡检记录</p>
              <p className="text-xs text-[#A8A29E]">上传照片开始第一次巡检</p>
            </div>
            <button
              onClick={onStartInspect}
              className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-all hover:-translate-y-px"
            >
              <Camera size={16} />
              开始第一次巡检
            </button>
          </>
        ) : (
          <>
            <p className="text-xs font-medium text-[#A8A29E] mb-3">共 {history.length} 次巡检记录</p>
            <div className="space-y-3">
              {history.map(entry => (
                <HistoryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
