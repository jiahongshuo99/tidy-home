const KEYS = {
  apiKey:  'tidyhome_apikey',
  profile: 'tidyhome_profile',
  lastInspect: 'tidyhome_last_inspect',
}

export function getApiKey()  { return localStorage.getItem(KEYS.apiKey) || '' }
export function saveApiKey(k) { localStorage.setItem(KEYS.apiKey, k) }

export function getProfile()  {
  const raw = localStorage.getItem(KEYS.profile)
  return raw ? JSON.parse(raw) : null
}
export function saveProfile(p) { localStorage.setItem(KEYS.profile, JSON.stringify(p)) }

export function getLastInspect()  {
  const raw = localStorage.getItem(KEYS.lastInspect)
  return raw ? JSON.parse(raw) : null
}
export function saveLastInspect(r) { localStorage.setItem(KEYS.lastInspect, JSON.stringify(r)) }
