import { useState } from 'react'
import { Eye, EyeOff, Save } from 'lucide-react'

function Toggle({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#EEEBE6]">
      <div>
        <p className="text-sm font-medium text-[#1C1917]">{label}</p>
        {description && <p className="text-xs text-[#A8A29E] mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ml-4 ${enabled ? 'bg-brand-500' : 'bg-[#D6D3D1]'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default function SettingsTab({
  apiKey, onSaveApiKey,
  stage1Thinking, setStage1Thinking,
  stage2Thinking, setStage2Thinking,
  concurrency, setConcurrency,
}) {
  const [draftKey, setDraftKey] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [keyError, setKeyError] = useState('')

  const handleSaveKey = () => {
    const trimmed = draftKey.trim()
    if (!trimmed) { setKeyError('请输入 API Key'); return }
    if (!trimmed.startsWith('sk-')) { setKeyError('格式不正确，应以 sk- 开头'); return }
    setKeyError('')
    onSaveApiKey(trimmed)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <header
        className="bg-white border-b border-[#EEEBE6] sticky top-0 z-40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[600px] mx-auto px-5 h-14 flex items-center">
          <span className="text-sm font-semibold text-[#1C1917]">设置</span>
        </div>
      </header>

      <div className="max-w-[600px] mx-auto px-5 py-6 space-y-6">
        {/* API Key */}
        <div>
          <p className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider mb-3">API Key</p>
          <div className="bg-white border border-[#DDD9D2] rounded-2xl px-4 py-4">
            <label className="block text-xs font-medium text-[#78716C] mb-1.5">Moonshot API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={draftKey}
                  onChange={e => { setDraftKey(e.target.value); setKeyError('') }}
                  placeholder="sk-..."
                  className="w-full h-10 px-3 pr-9 border border-[#DDD9D2] rounded-[8px] text-sm text-[#1C1917] placeholder:text-[#A8A29E] outline-none transition-all focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#78716C] transition-colors"
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <button
                onClick={handleSaveKey}
                className={`h-10 px-4 text-sm font-semibold rounded-[8px] flex items-center gap-1.5 transition-all ${saved ? 'bg-[#4D7C5F] text-white' : 'bg-brand-500 hover:bg-brand-600 text-white'}`}
              >
                <Save size={14} />
                {saved ? '已保存' : '保存'}
              </button>
            </div>
            {keyError && <p className="mt-1.5 text-xs text-red-600">{keyError}</p>}
            <p className="mt-2 text-xs text-[#A8A29E]">
              在{' '}
              <a href="https://platform.moonshot.cn" target="_blank" rel="noreferrer" className="text-brand-500 hover:text-brand-600 underline underline-offset-2">
                platform.moonshot.cn
              </a>
              {' '}获取，仅存储在本地
            </p>
          </div>
        </div>

        {/* Model */}
        <div>
          <p className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider mb-3">模型参数</p>
          <div className="bg-white border border-[#DDD9D2] rounded-2xl px-4">
            <Toggle
              label="建档阶段思考（Stage 1）"
              description="图片分析开启深度思考，更准确但更慢"
              enabled={stage1Thinking}
              onChange={setStage1Thinking}
            />
            <Toggle
              label="综合分析思考（Stage 2）"
              description="建档/巡检综合分析开启深度思考"
              enabled={stage2Thinking}
              onChange={setStage2Thinking}
            />
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-[#1C1917]">并发度</p>
                <p className="text-xs text-[#A8A29E] mt-0.5">同时分析的照片数量上限（1–10）</p>
              </div>
              <input
                type="number"
                min={1}
                max={10}
                value={concurrency}
                onChange={e => setConcurrency(Math.max(1, Math.min(10, Number(e.target.value))))}
                className="w-14 h-8 text-center text-sm font-medium text-[#1C1917] border border-[#DDD9D2] rounded-[8px] bg-white outline-none focus:border-brand-500 ml-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
