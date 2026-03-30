import { Camera, MapPin, RefreshCw } from 'lucide-react'

export default function SetupTab({ profile, onStartSetup }) {
  const hasProfile = profile?.rooms?.length > 0

  return (
    <div>
      <header
        className="bg-white border-b border-[#EEEBE6] sticky top-0 z-40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[600px] mx-auto px-5 h-14 flex items-center">
          <span className="text-sm font-semibold text-[#1C1917]">建档</span>
        </div>
      </header>

      <div className="max-w-[600px] mx-auto px-5 py-6">
        {hasProfile ? (
          <>
            <div className="mb-5">
              <h2 className="text-[20px] font-bold text-[#1C1917]">当前档案</h2>
              <p className="mt-1 text-sm text-[#78716C]">
                已记录 {profile.rooms.length} 个房间、{profile.rooms.reduce((n, r) => n + r.zones.length, 0)} 个区域的收纳标准。
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {profile.rooms.map(room => (
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
                            <span key={i} className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-900 text-[12px] font-medium">
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

            <button
              onClick={onStartSetup}
              className="w-full h-11 border border-[#DDD9D2] hover:border-brand-500 text-[#78716C] hover:text-brand-600 text-sm font-medium rounded-[10px] flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={14} />
              重新建档
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-[20px] font-bold text-[#1C1917]">尚未建档</h2>
              <p className="mt-1.5 text-sm text-[#78716C] leading-relaxed">
                拍下家中各房间照片，AI 将分析每个区域适合存放的物品类型，生成专属收纳档案。
              </p>
            </div>

            <div className="bg-[#F7F5F2] border border-[#EEEBE6] rounded-2xl p-5 mb-6">
              <p className="text-xs text-[#A8A29E] leading-relaxed">
                建档后，你可以随时拍照「巡检」——AI 会对比档案，立即指出哪些物品放错了位置，并给出搬移建议。
              </p>
            </div>

            <button
              onClick={onStartSetup}
              className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-all hover:-translate-y-px active:translate-y-0"
            >
              <Camera size={16} />
              开始建档
            </button>
          </>
        )}
      </div>
    </div>
  )
}
