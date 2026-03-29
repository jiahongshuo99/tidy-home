import { useState } from 'react'
import ApiKeySetup from './components/ApiKeySetup'
import HomePage from './components/HomePage'
import UploadPage from './components/UploadPage'
import SetupResults from './components/SetupResults'
import InspectResults from './components/InspectResults'
import {
  setupAnalyzePhoto,
  setupSynthesize,
  inspectAnalyzePhoto,
  inspectSynthesize,
} from './api/kimi'
import {
  getApiKey, saveApiKey,
  getProfile, saveProfile,
  saveLastInspect,
} from './data/storage'

let photoIdCounter = 0

// Run tasks (array of () => Promise) with max concurrency
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

// steps: api-setup | home | upload | analyzing | setup-results | inspect-results
export default function App() {
  const [apiKey, setApiKey]     = useState(() => getApiKey())
  const [step, setStep]         = useState(() => getApiKey() ? 'home' : 'api-setup')
  const [mode, setMode]         = useState('setup') // 'setup' | 'inspect'
  const [profile, setProfile]   = useState(() => getProfile())

  const [photos, setPhotos]       = useState([])
  const [setupResult, setSetupResult]     = useState(null)
  const [inspectResult, setInspectResult] = useState(null)
  const [stage2Status, setStage2Status]   = useState('idle')

  const [stage1Thinking, setStage1Thinking] = useState(true)
  const [stage2Thinking, setStage2Thinking] = useState(false)
  const [concurrency, setConcurrency]       = useState(3)

  const handleApiKeySubmit = (key) => {
    saveApiKey(key)
    setApiKey(key)
    setStep('home')
  }

  const updatePhoto = (id, patch) =>
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))

  // ── Setup pipeline ─────────────────────────────────────────────────────────

  const startSetup = () => {
    setMode('setup')
    setPhotos([])
    setSetupResult(null)
    setStage2Status('idle')
    setStep('upload')
  }

  const runSetupPipeline = async (currentPhotos) => {
    setStep('analyzing')
    setStage2Status('idle')
    setPhotos(prev => prev.map(p => ({ ...p, status: 'loading' })))

    const tasks = currentPhotos.map(photo => () =>
      setupAnalyzePhoto(apiKey, photo.dataUrl, photo.roomName, stage1Thinking)
        .then(result => {
          updatePhoto(photo.id, { status: 'done', result })
          return { roomName: photo.roomName, ...result }
        })
        .catch(err => {
          updatePhoto(photo.id, { status: 'error', error: err.message })
          return null
        })
    )

    const results = await runConcurrent(tasks, concurrency)
    const successResults = results.filter(Boolean)

    if (successResults.length === 0) {
      setStage2Status('error')
      return
    }

    const roomMap = {}
    successResults.forEach(r => {
      if (!roomMap[r.roomName]) roomMap[r.roomName] = []
      roomMap[r.roomName].push({ zones: r.zones, room_summary: r.room_summary })
    })
    const groupedRooms = Object.entries(roomMap).map(([roomName, analyses]) => ({ roomName, analyses }))

    setStage2Status('loading')
    try {
      const synthesis = await setupSynthesize(apiKey, groupedRooms, stage2Thinking)
      setSetupResult(synthesis)
      setStep('setup-results')
    } catch {
      setStage2Status('error')
    }
  }

  const handleConfirmProfile = () => {
    saveProfile(setupResult)
    setProfile(setupResult)
    setStep('home')
  }

  // ── Inspect pipeline ───────────────────────────────────────────────────────

  const startInspect = () => {
    setMode('inspect')
    setPhotos([])
    setInspectResult(null)
    setStage2Status('idle')
    setStep('upload')
  }

  const runInspectPipeline = async (currentPhotos) => {
    setStep('analyzing')
    setStage2Status('idle')
    setPhotos(prev => prev.map(p => ({ ...p, status: 'loading' })))

    // Build a lookup: roomName → known zones from profile
    const profileRoomMap = {}
    profile?.rooms?.forEach(r => { profileRoomMap[r.roomName] = r.zones })

    const tasks = currentPhotos.map(photo => () => {
      const knownZones = profileRoomMap[photo.roomName] ?? []
      return inspectAnalyzePhoto(apiKey, photo.dataUrl, photo.roomName, knownZones, stage1Thinking)
        .then(result => {
          updatePhoto(photo.id, { status: 'done', result })
          return { roomName: photo.roomName, ...result }
        })
        .catch(err => {
          updatePhoto(photo.id, { status: 'error', error: err.message })
          return null
        })
    })

    const results = await runConcurrent(tasks, concurrency)
    const successResults = results.filter(Boolean)

    if (successResults.length === 0) {
      setStage2Status('error')
      return
    }

    const roomMap = {}
    successResults.forEach(r => {
      if (!roomMap[r.roomName]) roomMap[r.roomName] = []
      roomMap[r.roomName].push({ zones: r.zones, room_summary: r.room_summary })
    })
    const inspectSnapshots = Object.entries(roomMap).map(([roomName, analyses]) => ({ roomName, analyses }))

    setStage2Status('loading')
    try {
      const synthesis = await inspectSynthesize(apiKey, profile, inspectSnapshots, stage2Thinking)
      saveLastInspect(synthesis)
      setInspectResult(synthesis)
      setStep('inspect-results')
    } catch {
      setStage2Status('error')
    }
  }

  // ── Dispatch start analysis based on mode ──────────────────────────────────

  const handleStartAnalysis = () => {
    if (mode === 'setup') runSetupPipeline(photos)
    else runInspectPipeline(photos)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (step === 'api-setup') {
    return <ApiKeySetup onSubmit={handleApiKeySubmit} />
  }

  if (step === 'home') {
    return (
      <HomePage
        profile={profile}
        onStartSetup={startSetup}
        onStartInspect={startInspect}
        onChangeApiKey={() => setStep('api-setup')}
      />
    )
  }

  if (step === 'setup-results') {
    return (
      <SetupResults
        result={setupResult}
        onConfirm={handleConfirmProfile}
        onRedo={startSetup}
        onChangeApiKey={() => setStep('api-setup')}
      />
    )
  }

  if (step === 'inspect-results') {
    return (
      <InspectResults
        result={inspectResult}
        onRedo={startInspect}
        onChangeApiKey={() => setStep('api-setup')}
      />
    )
  }

  // upload | analyzing
  return (
    <UploadPage
      mode={mode}
      photos={photos}
      setPhotos={setPhotos}
      onStartAnalysis={handleStartAnalysis}
      analyzing={step === 'analyzing'}
      stage2Status={stage2Status}
      onChangeApiKey={() => setStep('api-setup')}
      getNextId={() => `photo_${++photoIdCounter}`}
      stage1Thinking={stage1Thinking}
      setStage1Thinking={setStage1Thinking}
      stage2Thinking={stage2Thinking}
      setStage2Thinking={setStage2Thinking}
      concurrency={concurrency}
      setConcurrency={setConcurrency}
    />
  )
}
