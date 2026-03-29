import { useState } from 'react'
import ApiKeySetup from './components/ApiKeySetup'
import UploadPage from './components/UploadPage'
import AnalysisResults from './components/AnalysisResults'
import { analyzePhoto, synthesizeResults } from './api/kimi'

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

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tidyhome_apikey') || '')
  const [step, setStep] = useState(() =>
    localStorage.getItem('tidyhome_apikey') ? 'upload' : 'setup'
  )
  const [photos, setPhotos] = useState([])
  const [analysisResult, setAnalysisResult] = useState(null)
  const [stage2Status, setStage2Status] = useState('idle') // idle | loading | error
  const [stage1Thinking, setStage1Thinking] = useState(true)
  const [stage2Thinking, setStage2Thinking] = useState(false)
  const [concurrency, setConcurrency] = useState(3)

  const handleApiKeySubmit = (key) => {
    localStorage.setItem('tidyhome_apikey', key)
    setApiKey(key)
    setStep('upload')
  }

  const updatePhoto = (id, patch) =>
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))

  const handleStartAnalysis = async () => {
    setStep('analyzing')
    setStage2Status('idle')
    setPhotos(prev => prev.map(p => ({ ...p, status: 'loading' })))

    // Stage 1: analyze each photo with concurrency limit
    const tasks = photos.map(photo => () =>
      analyzePhoto(apiKey, photo.dataUrl, photo.roomName, stage1Thinking)
        .then(result => {
          updatePhoto(photo.id, { status: 'done', result })
          return { photoId: photo.id, roomName: photo.roomName, ...result }
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

    // Group results by roomName for Stage 2
    const roomMap = {}
    successResults.forEach(r => {
      if (!roomMap[r.roomName]) roomMap[r.roomName] = []
      roomMap[r.roomName].push({ zones: r.zones, room_summary: r.room_summary })
    })
    const groupedRooms = Object.entries(roomMap).map(([roomName, analyses]) => ({
      roomName,
      analyses,
    }))

    // Stage 2: synthesize
    setStage2Status('loading')
    try {
      const synthesis = await synthesizeResults(apiKey, groupedRooms, stage2Thinking)
      setAnalysisResult(synthesis)
      setStep('results')
    } catch {
      setStage2Status('error')
    }
  }

  const handleReset = () => {
    setPhotos([])
    setAnalysisResult(null)
    setStage2Status('idle')
    setStep('upload')
  }

  if (step === 'setup') {
    return <ApiKeySetup onSubmit={handleApiKeySubmit} />
  }

  if (step === 'results') {
    return (
      <AnalysisResults
        result={analysisResult}
        onReset={handleReset}
        onChangeApiKey={() => setStep('setup')}
      />
    )
  }

  return (
    <UploadPage
      photos={photos}
      setPhotos={setPhotos}
      onStartAnalysis={handleStartAnalysis}
      analyzing={step === 'analyzing'}
      stage2Status={stage2Status}
      onChangeApiKey={() => setStep('setup')}
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
