import { useState, useEffect } from 'react'
import ApiKeySetup from './components/ApiKeySetup'
import UploadPage from './components/UploadPage'
import AnalysisResults from './components/AnalysisResults'
import { analyzePhoto, synthesizeResults } from './api/kimi'

let photoIdCounter = 0

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

    // Stage 1: analyze each photo in parallel
    const tasks = photos.map(photo =>
      analyzePhoto(apiKey, photo.dataUrl, photo.roomType, stage1Thinking)
        .then(result => {
          updatePhoto(photo.id, { status: 'done', result })
          return { roomType: photo.roomType, ...result }
        })
        .catch(err => {
          updatePhoto(photo.id, { status: 'error', error: err.message })
          return null
        })
    )

    // Mark all as loading immediately
    setPhotos(prev => prev.map(p => ({ ...p, status: 'loading' })))

    const results = await Promise.all(tasks)
    const successResults = results.filter(Boolean)

    if (successResults.length === 0) {
      setStage2Status('error')
      return
    }

    // Stage 2: synthesize
    setStage2Status('loading')
    try {
      const synthesis = await synthesizeResults(apiKey, successResults, stage2Thinking)
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
    />
  )
}
