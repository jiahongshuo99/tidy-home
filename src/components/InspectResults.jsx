import { Settings, RotateCcw, AlertTriangle, CheckCircle2, MapPin, ArrowRight } from 'lucide-react'

export default function InspectResults({ result, onRedo, onChangeApiKey }) {
  const items = result?.misplaced_items ?? []

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <header className="bg-white border-b border-[#EEEBE6] sticky top-0 z-40">
        <div className="max-w-[1024px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#1C1917]">Tidy Home</span>
            <span className="text-xs text-[#4D7C5F] font-medium bg-[#F0F7F3] px-2 py-0.5 rounded-full">巡检</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onChangeApiKey}
              className="flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#1C1917] transition-colors"
            >
              <Settings size={13} />
              API Key
            </button>
            <button
              onClick={onRedo}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-[#78716C] border border-[#DDD9D2] rounded-[8px] hover:border-[#C4BFB7] hover:text-[#1C1917] transition-all"
            >
              <RotateCcw size={12} />
              再次巡检
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1024px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-[#1C1917] tracking-tight">巡检报告</h1>
          {items.length > 0 ? (
            <p className="mt-1.5 text-[15px] text-[#78716C]">
              发现 <span className="text-amber-600 font-semibold">{items.length}</span> 件物品放置不合理，建议整理。
            </p>
          ) : (
            <p className="mt-1.5 text-[15px] text-[#78716C]">
              太棒了！所有物品均符合收纳档案标准。
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F0F7F3] flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-[#4D7C5F]" />
            </div>
            <p className="text-base font-semibold text-[#1C1917] mb-1">家里很整洁</p>
            <p className="text-sm text-[#A8A29E]">没有发现放置不合理的物品</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-[#DDD9D2] border-l-4 border-l-amber-400 rounded-xl px-5 py-4"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1C1917]">{item.item}</p>
                    <div className="flex items-center gap-1.5 mt-1 mb-2">
                      <MapPin size={11} className="text-[#A8A29E] flex-shrink-0" />
                      <span className="text-xs text-[#78716C]">{item.current_zone}</span>
                    </div>
                    <p className="text-xs text-[#78716C] leading-relaxed mb-2">{item.reason}</p>
                    <div className="flex items-start gap-1.5 bg-brand-50 rounded-lg px-3 py-2">
                      <ArrowRight size={12} className="text-brand-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-brand-900 leading-relaxed">{item.suggestion}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
