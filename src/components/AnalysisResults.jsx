import { useState } from 'react'
import { Settings, RotateCcw, MapPin, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'

const TABS = [
  { key: 'guidelines', label: '区域规范' },
  { key: 'misplaced',  label: '问题清单' },
  { key: 'actions',    label: '行动建议' },
]

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <CheckCircle2 size={32} className="text-[#4D7C5F] mb-3 opacity-60" />
      <p className="text-sm text-[#A8A29E]">{text}</p>
    </div>
  )
}

function ZoneGuidelines({ items = [] }) {
  if (!items.length) return <EmptyState text="暂无区域规范数据" />
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item, i) => (
        <div key={i} className="bg-white border border-[#DDD9D2] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} className="text-brand-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-[#1C1917]">{item.zone}</span>
          </div>
          <div className="border-t border-[#EEEBE6] pt-3">
            <p className="text-xs text-[#78716C] mb-2">适合放置：</p>
            <div className="flex flex-wrap gap-1.5">
              {item.suitable_items?.map((si, j) => (
                <span
                  key={j}
                  className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-900 text-[12px] font-medium"
                >
                  {si}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MisplacedItems({ items = [] }) {
  if (!items.length) return <EmptyState text="没有发现放置不合理的物品，收纳状态良好" />
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-[#FFFBEB] border border-[#FEF3C7] border-l-4 border-l-amber-400 rounded-xl px-5 py-4"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#1C1917]">{item.item}</p>
              <p className="text-xs text-[#78716C] mt-0.5">当前位置：{item.current_zone}</p>
              <p className="text-xs text-[#78716C] mt-1.5 leading-relaxed">{item.reason}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Actions({ items = [] }) {
  if (!items.length) return <EmptyState text="暂无行动建议" />
  return (
    <div className="space-y-3">
      {items
        .sort((a, b) => a.priority - b.priority)
        .map((item, i) => (
          <div
            key={i}
            className="bg-white border border-[#DDD9D2] rounded-xl px-5 py-5 flex gap-5"
          >
            <span className="text-[32px] font-bold text-brand-500 leading-none flex-shrink-0 w-10 text-right tabular-nums">
              {String(item.priority || i + 1).padStart(2, '0')}
            </span>
            <div className="pt-1">
              <p className="text-[15px] font-semibold text-[#1C1917] leading-snug">{item.action}</p>
              <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed">{item.reason}</p>
            </div>
          </div>
        ))}
    </div>
  )
}

export default function AnalysisResults({ result, onReset, onChangeApiKey }) {
  const [activeTab, setActiveTab] = useState('guidelines')

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#EEEBE6] sticky top-0 z-40">
        <div className="max-w-[1024px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#1C1917]">Tidy Home</span>
            <div className="flex items-center gap-1 text-xs text-[#A8A29E]">
              <span>上传照片</span>
              <span>→</span>
              <span>分析中</span>
              <span>→</span>
              <span className="text-brand-500 font-medium">查看结果</span>
            </div>
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
              onClick={onReset}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-[#78716C] border border-[#DDD9D2] rounded-[8px] hover:border-[#C4BFB7] hover:text-[#1C1917] transition-all"
            >
              <RotateCcw size={12} />
              重新分析
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1024px] mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-[#1C1917] tracking-tight">收纳分析报告</h1>
          <p className="mt-1.5 text-[15px] text-[#78716C]">
            基于你上传的房间照片，以下是 AI 给出的收纳优化方案。
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: '识别区域', value: result?.zone_guidelines?.length ?? 0, unit: '个' },
            { label: '放置问题', value: result?.misplaced_items?.length ?? 0, unit: '处' },
            { label: '行动建议', value: result?.actions?.length ?? 0, unit: '条' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-[#DDD9D2] rounded-xl px-5 py-4">
              <p className="text-xs text-[#78716C] mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-[#1C1917]">
                {stat.value}
                <span className="text-sm font-normal text-[#A8A29E] ml-1">{stat.unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#EEEBE6] mb-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-4 py-2.5 text-sm font-medium border-b-2 transition-colors mr-1
                ${activeTab === tab.key
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
                }
              `}
            >
              {tab.label}
              {tab.key === 'misplaced' && result?.misplaced_items?.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
                  {result.misplaced_items.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'guidelines' && <ZoneGuidelines items={result?.zone_guidelines} />}
        {activeTab === 'misplaced'  && <MisplacedItems items={result?.misplaced_items} />}
        {activeTab === 'actions'    && <Actions items={result?.actions} />}
      </main>
    </div>
  )
}
