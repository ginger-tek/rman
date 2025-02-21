import dotenv from 'dotenv'

dotenv.config()

const basicAuth = `Basic ${atob(`${process.env.JIRA_API_USER}:${process.env.JIRA_API_TOKEN}`)}`

export async function request(u, m, b) {
  const base = `https://${process.env.JIRA_DOMAIN}.atlassian.net/rest/api/3`
  const res = await fetch(`${base}/${u}`, {
    method: m || 'GET',
    headers: {
      'authorization': basicAuth(),
      'content-type': 'application/json',
      'accept': 'application/json'
    },
    body: b ? JSON.stringify(b) : null
  })
  const data = await res.json()
  return res.ok ? data : Promise.reject(data)
}

export async function listProjects() {
  const params = new URLSearchParams()
  params.append('maxResults', 100)
  params.append('query', ``)
  return request(`project/search?${params.toString()}`)
}

export async function listUsers() {
  const params = new URLSearchParams()
  params.append('maxResults', 100)
  params.append('query', ``)
  return request(`user/search/query?${params.toString()}`)
}