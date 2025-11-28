export async function getCurrentWeather(city?: string): Promise<any> {
  let url = '/api/weather/current'
  if (city && city.length > 0) {
    url += `?city=${encodeURIComponent(city)}`
  }

  const resp = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`HTTP ${resp.status}: ${text}`)
  }

  return resp.json()
}

export async function getResults(): Promise<any[]> {
  const resp = await fetch('/api/weather/results', { headers: { 'Accept': 'application/json' } })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`HTTP ${resp.status}: ${text}`)
  }
  return resp.json()
}

export async function getResult(city: string): Promise<any> {
  const url = `/api/weather/result?city=${encodeURIComponent(city)}`
  const resp = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`HTTP ${resp.status}: ${text}`)
  }
  return resp.json()
}

export async function getCurrentFlood(city?: string): Promise<any> {
  let url = '/api/flood/current'
  if (city && city.length > 0) {
    url += `?city=${encodeURIComponent(city)}`
  }

  const resp = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`HTTP ${resp.status}: ${text}`)
  }

  return resp.json()
}

export async function getFloodResults(): Promise<any[]> {
  const resp = await fetch('/api/flood/results', { headers: { 'Accept': 'application/json' } })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`HTTP ${resp.status}: ${text}`)
  }
  return resp.json()
}

export async function getFloodResult(city: string): Promise<any> {
  const url = `/api/flood/result?city=${encodeURIComponent(city)}`
  const resp = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`HTTP ${resp.status}: ${text}`)
  }
  return resp.json()
}
