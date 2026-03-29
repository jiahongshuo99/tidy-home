import { useState } from 'react'
import { Eye, EyeOff, Home, ArrowRight } from 'lucide-react'

export default function ApiKeySetup({ onSubmit }) {
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = key.trim()
    if (!trimmed) {
      setError('请输入 API Key')
      return
    }
    if (!trimmed.startsWith('sk-')) {
      setError('API Key 格式不正确，应以 sk- 开头')
      return
    }
    onSubmit(trimmed)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-4">
            <Home size={22} className="text-brand-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#1C1917] tracking-tight">Tidy Home</h1>
          <p className="mt-1.5 text-sm text-[#78716C]">整理你的家，从一张照片开始</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#DDD9D2] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#78716C] mb-1.5">
                Moonshot API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={e => { setKey(e.target.value); setError('') }}
                  placeholder="sk-..."
                  className="w-full h-[42px] px-3.5 pr-10 border border-[#DDD9D2] rounded-[10px] text-[15px] text-[#1C1917] placeholder:text-[#A8A29E] outline-none transition-all focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(217,119,87,0.12)]"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#78716C] transition-colors"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="mt-1.5 text-xs text-red-600">{error}</p>
              )}
              <p className="mt-2 text-xs text-[#A8A29E]">
                在{' '}
                <a
                  href="https://platform.moonshot.cn"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-500 hover:text-brand-600 underline underline-offset-2"
                >
                  platform.moonshot.cn
                </a>
                {' '}获取 API Key，仅存储在本地
              </p>
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-[10px] flex items-center justify-center gap-2 transition-all hover:-translate-y-px active:translate-y-0"
            >
              开始使用
              <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
