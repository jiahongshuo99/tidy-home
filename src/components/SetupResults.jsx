import { Settings, RotateCcw, CheckCircle2, MapPin } from 'lucide-react'

export default function SetupResults({ result, onConfirm, onRedo, onChangeApiKey }) {
  const rooms = result?.rooms ?? []

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <header className="bg-white border-b border-[#EEEBE6] sticky top-0 z-40">
        <div className="max-w-[1024px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#1C1917]">Tidy Home</span>
            <span className="text-xs text-brand-500 font-medium bg-brand-50 px-2 py-0.5 rounded-full">建档</span>
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
              重新拍照
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1024px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-[#1C1917] tracking-tight">家居档案草稿</h1>
          <p className="mt-1.5 text-[15px] text-[#78716C]">
            AI 已识别 {rooms.length} 个房间、
            {rooms.reduce((n, r) => n + r.zones.length, 0)} 个区域的收纳标准。
            确认后将作为巡检基准保存。
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {rooms.map(room => (
            <div key={room.roomName} className="bg-white border border-[#DDD9D2] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#EEEBE6] flex items-center gap-2">
                <MapPin size={14} className="text-brand-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-[#1C1917]">{room.roomName}</span>
                <span className="text-xs text-[#A8A29E] ml-1">{room.zones.length} 个区域</span>
              </div>
              <div className="divide-y divide-[#EEEBE6]">
                {room.zones.map(zone => (
                  <div key={zone.name} className="px-5 py-3.5">
                    <p className="text-xs font-semibold text-[#1C1917] mb-2">{zone.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {zone.suitable_items?.map((item, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-900 text-[12px] font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 h-12 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-all hover:-translate-y-px active:translate-y-0"
          >
            <CheckCircle2 size={16} />
            确认并保存档案
          </button>
          <button
            onClick={onRedo}
            className="h-12 px-5 border border-[#DDD9D2] hover:border-[#C4BFB7] text-[#78716C] hover:text-[#1C1917] text-sm font-medium rounded-[10px] flex items-center gap-2 transition-all"
          >
            <RotateCcw size={14} />
            重拍
          </button>
        </div>
      </main>
    </div>
  )
}
