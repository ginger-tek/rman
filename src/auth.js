import resources from './resources.js'
import jwt from 'jsonwebtoken'

export function authenticate(req, res, next) {
  if (req.session && req.session.user)
    return next()
  if (!req.session && req.url.match(/^\/api/))
    return res.status(401).json({ error: 'Unauthorized' })
  if (req.query.code) {
    const url = new URL('https://oauth2.googleapis.com/token')
    url.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID)
    url.searchParams.append('client_secret', process.env.GOOGLE_CLIENT_SECRET)
    url.searchParams.append('code', req.query.code)
    url.searchParams.append('grant_type', 'authorization_code')
    url.searchParams.append('redirect_uri', 'http://localhost:7000/api/auth/oauth')
    fetch(url.toString(), { method: 'POST' }).then(r => r.json()).then(d => {
      const data = jwt.decode(d.id_token)
      req.session.user = resources.find(data.email)
      res.redirect('/')
    })
  } else {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID)
    url.searchParams.append('redirect_uri', 'http://localhost:7000/api/auth/oauth')
    url.searchParams.append('response_type', 'code')
    url.searchParams.append('scope', 'profile email')
    url.searchParams.append('access_type', 'offline')
    url.searchParams.append('state', crypto.randomUUID())
    res.redirect(url.toString())
  }
}

export const PERMS = {
  DASHBOARD_VIEW: 2,
  PROJECT_CREATE: 4,
  PROJECT_VIEW: 8,
  PROJECT_UPDATE: 16,
  PROJECT_DELETE: 32,
  RESOURCE_CREATE: 64,
  RESOURCE_VIEW: 128,
  RESOURCE_UPDATE: 256,
  RESOURCE_DELETE: 512,
  APPROVAL_CREATE: 1024,
  APPROVAL_VIEW: 2048,
  APPROVAL_UPDATE: 4096,
  APPROVAL_DELETE: 8192
}

export const ROLES = {
  GUEST: PERMS.DASHBOARD_VIEW,
  PROJECT_MANAGER: PERMS.DASHBOARD_VIEW | PERMS.PROJECT_VIEW | PERMS.PROJECT_UPDATE | PERMS.RESOURCE_VIEW,
  APPROVAL_MANAGER: PERMS.DASHBOARD_VIEW | PERMS.PROJECT_VIEW | PERMS.APPROVAL_UPDATE | PERMS.RESOURCE_VIEW,
  PROJECT_ADMIN: PERMS.DASHBOARD_VIEW | PERMS.PROJECT_CREATE | PERMS.PROJECT_VIEW | PERMS.PROJECT_UPDATE | PERMS.PROJECT_DELETE | PERMS.APPROVAL_UPDATE | PERMS.APPROVAL_DELETE,
  RESOURCE_ADMIN: PERMS.DASHBOARD_VIEW | PERMS.RESOURCE_CREATE | PERMS.RESOURCE_VIEW | PERMS.RESOURCE_UPDATE | PERMS.RESOURCE_DELETE,
  ADMIN: Object.keys(PERMS).reduce((c, r) => c |= r, 0),
}

export function authorize(role) {
  return (req, res, next) => {
    if ((role & req.session.user.roleBit) === req.session.user.roleBit)
      return next()
    res.sendStatus(403)
  }
}