const KEYS = {
  apiKey:         'tidyhome_apikey',
  profile:        'tidyhome_profile',
  inspectHistory: 'tidyhome_inspect_history',
}

export function getApiKey()   { return localStorage.getItem(KEYS.apiKey) || '' }
export function saveApiKey(k) { localStorage.setItem(KEYS.apiKey, k) }

export function getProfile()    {
  const raw = localStorage.getItem(KEYS.profile)
  return raw ? JSON.parse(raw) : null
}
export function saveProfile(p) { localStorage.setItem(KEYS.profile, JSON.stringify(p)) }

export function getInspectHistory() {
  const raw = localStorage.getItem(KEYS.inspectHistory)
  return raw ? JSON.parse(raw) : []
}

export function addInspectHistory(result) {
  const history = getInspectHistory()
  const entry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    misplacedCount: result?.misplaced_items?.length ?? 0,
    result,
  }
  history.unshift(entry) // newest first
  localStorage.setItem(KEYS.inspectHistory, JSON.stringify(history))
  return entry
}
