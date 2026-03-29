import { Settings, Camera, RefreshCw, MapPin, ChevronRight } from 'lucide-react'

export default function HomePage({ profile, onStartSetup, onStartInspect, onChangeApiKey }) {
  const hasProfile = profile && profile.rooms?.length > 0

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <header className="bg-white border-b border-[#EEEBE6] sticky top-0 z-40">
        <div className="max-w-[1024px] mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#1C1917]">Tidy Home</span>
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
        {hasProfile ? (
          <>
            <div className="mb-8">
              <h1 className="text-[26px] font-bold text-[#1C1917] tracking-tight leading-snug">
                你好，家里一切都好吗？
              </h1>
              <p className="mt-1.5 text-[15px] text-[#78716C]">
                已建立 {profile.rooms.length} 个房间的收纳档案。上传新照片开始今日巡检，或重新建档。
              </p>
            </div>

            {/* Profile summary */}
            <div className="mb-8 space-y-2">
              {profile.rooms.map(room => (
                <div key={room.roomName} className="bg-white border border-[#DDD9D2] rounded-xl px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={14} className="text-brand-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-[#1C1917]">{room.roomName}</span>
                    <span className="text-xs text-[#A8A29E] ml-1">{room.zones.length} 个区域</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {room.zones.map(zone => (
                      <span
                        key={zone.name}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F7F5F2] text-[#78716C] text-[12px] font-medium border border-[#EEEBE6]"
                      >
                        {zone.name}
                        <ChevronRight size={10} className="opacity-40" />
                        <span className="text-[#A8A29E]">{zone.suitable_items.slice(0, 2).join('、')}…</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onStartInspect}
                className="flex-1 h-12 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-all hover:-translate-y-px active:translate-y-0"
              >
                <Camera size={16} />
                开始巡检
              </button>
              <button
                onClick={onStartSetup}
                className="h-12 px-5 border border-[#DDD9D2] hover:border-[#C4BFB7] text-[#78716C] hover:text-[#1C1917] text-sm font-medium rounded-[10px] flex items-center gap-2 transition-all"
              >
                <RefreshCw size={14} />
                重新建档
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-[26px] font-bold text-[#1C1917] tracking-tight leading-snug">
                欢迎使用 Tidy Home
              </h1>
              <p className="mt-1.5 text-[15px] text-[#78716C]">
                首先拍下家中每个房间，建立收纳档案。档案建立后，随时可以上传新照片进行巡检，发现放错位置的物品。
              </p>
            </div>

            <div className="bg-white border border-[#DDD9D2] rounded-2xl p-6 mb-8">
              <div className="space-y-5">
                {[
                  { step: '01', title: '建立档案', desc: '拍下各房间照片，AI 分析每个区域适合存放的物品类型' },
                  { step: '02', title: '日常巡检', desc: '再次拍照，AI 对比档案，立即发现放错位置的物品' },
                  { step: '03', title: '持续优化', desc: '随时重新建档更新标准，让家越来越整洁' },
                ].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <span className="text-[28px] font-bold text-brand-100 leading-none flex-shrink-0 w-8 tabular-nums">{item.step}</span>
                    <div className="pt-0.5">
                      <p className="text-sm font-semibold text-[#1C1917]">{item.title}</p>
                      <p className="text-xs text-[#78716C] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onStartSetup}
              className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-all hover:-translate-y-px active:translate-y-0"
            >
              <Camera size={16} />
              开始建立家居档案
            </button>
          </>
        )}
      </main>
    </div>
  )
}
