import { useState } from 'react'
import BottomTabBar from './components/BottomTabBar'
import HomeTab from './components/HomeTab'
import SetupTab from './components/SetupTab'
import InspectTab from './components/InspectTab'
import SettingsTab from './components/SettingsTab'
import {
  setupAnalyzePhoto,
  setupSynthesize,
  inspectAnalyzePhoto,
  inspectSynthesize,
} from './api/kimi'
import {
  getApiKey, saveApiKey,
  getProfile, saveProfile,
  getInspectHistory, addInspectHistory,
  getRetryEnabled, saveRetryEnabled,
} from './data/storage'

let photoIdCounter = 0

async function runConcurrent(tasks, limit) {
  const results = new Array(tasks.length).fill(null)
  let next = 0
  async function worker() {
    while (next < tasks.length) {
      const i = next++
      results[i] = await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

// homeState: idle | uploading | analyzing | setup-done | inspect-done
export default function App() {
  const [activeTab,  setActiveTab]  = useState(() => getApiKey() ? 'home' : 'settings')
  const [homeState,  setHomeState]  = useState('idle')
  const [mode,       setMode]       = useState('setup')

  const [apiKey,     setApiKey]     = useState(() => getApiKey())
  const [profile,    setProfile]    = useState(() => getProfile())
  const [history,    setHistory]    = useState(() => getInspectHistory())

  const [photos,        setPhotos]        = useState([])
  const [setupResult,   setSetupResult]   = useState(null)
  const [inspectResult, setInspectResult] = useState(null)
  const [stage2Status,  setStage2Status]  = useState('idle')

  const [stage1Thinking, setStage1Thinking] = useState(true)
  const [stage2Thinking, setStage2Thinking] = useState(false)
  const [concurrency,    setConcurrency]    = useState(3)
  const [retryEnabled,   setRetryEnabled]   = useState(() => getRetryEnabled())

  const handleSetRetryEnabled = (v) => { saveRetryEnabled(v); setRetryEnabled(v) }

  const getNextId = () => `photo_${++photoIdCounter}`

  const updatePhoto = (id, patch) =>
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))

  // ── API key ──────────────────────────────────────────────────────────────

  const handleSaveApiKey = (key) => {
    saveApiKey(key)
    setApiKey(key)
  }

  // ── Setup flow ────────────────────────────────────────────────────────────

  const startSetup = () => {
    setMode('setup')
    setPhotos([])
    setSetupResult(null)
    setStage2Status('idle')
    setHomeState('uploading')
    setActiveTab('home')
  }

  const handleStartAnalysis = async () => {
    const currentPhotos = photos
    setHomeState('analyzing')
    setStage2Status('idle')
    setPhotos(prev => prev.map(p => ({ ...p, status: 'loading' })))

    if (mode === 'setup') {
      const tasks = currentPhotos.map(photo => () =>
        setupAnalyzePhoto(apiKey, photo.dataUrl, photo.roomName, stage1Thinking, retryEnabled)
          .then(result => { updatePhoto(photo.id, { status: 'done', result }); return { roomName: photo.roomName, ...result } })
          .catch(err  => { updatePhoto(photo.id, { status: 'error', error: err.message }); return null })
      )
      const results = (await runConcurrent(tasks, concurrency)).filter(Boolean)
      if (!results.length) { setStage2Status('error'); return }

      const roomMap = {}
      results.forEach(r => {
        if (!roomMap[r.roomName]) roomMap[r.roomName] = []
        roomMap[r.roomName].push({ zones: r.zones, room_summary: r.room_summary })
      })
      const grouped = Object.entries(roomMap).map(([roomName, analyses]) => ({ roomName, analyses }))

      setStage2Status('loading')
      try {
        const synthesis = await setupSynthesize(apiKey, grouped, stage2Thinking, retryEnabled)
        setSetupResult(synthesis)
        setHomeState('setup-done')
        setStage2Status('idle')
      } catch {
        setStage2Status('error')
      }

    } else {
      // inspect
      const profileRoomMap = {}
      profile?.rooms?.forEach(r => { profileRoomMap[r.roomName] = r.zones })

      const tasks = currentPhotos.map(photo => () => {
        const knownZones = profileRoomMap[photo.roomName] ?? []
        return inspectAnalyzePhoto(apiKey, photo.dataUrl, photo.roomName, knownZones, stage1Thinking, retryEnabled)
          .then(result => { updatePhoto(photo.id, { status: 'done', result }); return { roomName: photo.roomName, ...result } })
          .catch(err  => { updatePhoto(photo.id, { status: 'error', error: err.message }); return null })
      })
      const results = (await runConcurrent(tasks, concurrency)).filter(Boolean)
      if (!results.length) { setStage2Status('error'); return }

      const roomMap = {}
      results.forEach(r => {
        if (!roomMap[r.roomName]) roomMap[r.roomName] = []
        roomMap[r.roomName].push({ zones: r.zones, room_summary: r.room_summary })
      })
      const snapshots = Object.entries(roomMap).map(([roomName, analyses]) => ({ roomName, analyses }))

      setStage2Status('loading')
      try {
        const synthesis = await inspectSynthesize(apiKey, profile, snapshots, stage2Thinking, retryEnabled)
        const entry = addInspectHistory(synthesis)
        setHistory(prev => [entry, ...prev])
        setInspectResult(synthesis)
        setHomeState('inspect-done')
        setStage2Status('idle')
      } catch {
        setStage2Status('error')
      }
    }
  }

  const handleConfirmProfile = () => {
    saveProfile(setupResult)
    setProfile(setupResult)
    setHomeState('idle')
  }

  const startInspect = () => {
    setMode('inspect')
    setPhotos([])
    setInspectResult(null)
    setStage2Status('idle')
    setHomeState('uploading')
    setActiveTab('home')
  }

  const cancelUpload = () => {
    setPhotos([])
    setStage2Status('idle')
    setHomeState('idle')
  }

  const handleTabChange = (tab) => setActiveTab(tab)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content — padded for bottom tab bar + safe area */}
      <div className="flex-1" style={{ paddingBottom: 'calc(56px + env(safe-area-inset-bottom))' }}>
        {activeTab === 'home' && (
          <HomeTab
            homeState={homeState}
            mode={mode}
            profile={profile}
            photos={photos}
            setPhotos={setPhotos}
            setupResult={setupResult}
            onConfirmProfile={handleConfirmProfile}
            inspectResult={inspectResult}
            stage2Status={stage2Status}
            getNextId={getNextId}
            onStartAnalysis={handleStartAnalysis}
            onCancelUpload={cancelUpload}
            onRedoSetup={startSetup}
            onRedoInspect={startInspect}
            onGoSetup={() => setActiveTab('setup')}
            onGoInspect={() => setActiveTab('inspect')}
          />
        )}
        {activeTab === 'setup' && (
          <SetupTab profile={profile} onStartSetup={startSetup} />
        )}
        {activeTab === 'inspect' && (
          <InspectTab profile={profile} history={history} onStartInspect={startInspect} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            apiKey={apiKey}
            onSaveApiKey={handleSaveApiKey}
            stage1Thinking={stage1Thinking}
            setStage1Thinking={setStage1Thinking}
            stage2Thinking={stage2Thinking}
            setStage2Thinking={setStage2Thinking}
            concurrency={concurrency}
            setConcurrency={setConcurrency}
            retryEnabled={retryEnabled}
            setRetryEnabled={handleSetRetryEnabled}
          />
        )}
      </div>

      <BottomTabBar activeTab={activeTab} onChange={handleTabChange} analyzing={homeState === 'analyzing'} />
    </div>
  )
}
