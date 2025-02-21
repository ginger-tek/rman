import express from 'express'
import morgan from 'morgan'
import { spawn } from 'child_process'
import session from 'express-session'
import Logger from './src/logger.js'
import apiRoutes from './src/apiRoutes.js'

// const syncLog = new Logger('logs/sync.log')
// const syncProc = spawn('node', ['src/sync.js'], {
//   cwd: import.meta.dirname,
//   env: process.env,
// })
// mainLog.info(`Sync process started - PID ${syncProc.pid}`)
// syncProc.stdout.on('data', d => syncLog.info(d.toString().trim()))
// syncProc.stderr.on('data', e => syncLog.error(e.toString().trim()))
// syncProc.on('close', c => syncLog.info(`Sync process exited with code ${c}`))

const app = express()
const port = 7000
const webLog = new Logger('logs/web.log')

app.use(morgan('dev', { stream: { write: str => webLog.info(str) } }))
app.use(express.json())
app.use(session({ secret: crypto.randomUUID(), resave: true, saveUninitialized: true }))
app.use('/api', apiRoutes)
app.use('/nm', express.static(import.meta.dirname + '/node_modules'))
app.use('/assets', express.static(import.meta.dirname + '/public/assets'))
app.get('*', (_, res) => res.sendFile(import.meta.dirname + '/public/index.html'))

app.listen(port, () => console.log(`Web server started on http://localhost:${port}`))