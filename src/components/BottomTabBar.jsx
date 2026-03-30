import { Home, BookOpen, ClipboardList, Settings } from 'lucide-react'

const TABS = [
  { key: 'home',    label: '首页',  Icon: Home },
  { key: 'setup',   label: '建档',  Icon: BookOpen },
  { key: 'inspect', label: '巡检',  Icon: ClipboardList },
  { key: 'settings',label: '设置',  Icon: Settings },
]

export default function BottomTabBar({ activeTab, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EEEBE6]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-[600px] mx-auto flex">
        {TABS.map(({ key, label, Icon }) => {
          const active = activeTab === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
            >
              <Icon
                size={22}
                className={active ? 'text-brand-500' : 'text-[#A8A29E]'}
                strokeWidth={active ? 2 : 1.5}
              />
              <span className={`text-[10px] font-medium ${active ? 'text-brand-500' : 'text-[#A8A29E]'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
