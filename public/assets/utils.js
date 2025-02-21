export function findSunday() {
  let s = luxon.DateTime.now().toLocal().set({ hours: 0, minutes: 0, seconds: 0, millisecond: 0 })
  while (s.toFormat('ccc') != 'Sun')
    s = s.minus({ days: 1 })
  return s
}

export async function api(u, m, b) {
  const res = await fetch(`/api/${u}`, {
    method: m || 'GET',
    headers: { 'content-type': 'application/json' },
    body: b ? JSON.stringify(b) : null
  })
  const data = await res.json()
  return res.ok ? data : Promise.reject(data)
}

export function local(s) {
  if (!s) return '...'
  return new Date(s.replace(/Z$/, '') + 'Z').toLocaleString()
}