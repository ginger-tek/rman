import { Router } from 'express'
import projects from './projects.js'
import resources from './resources.js'
import projectResources from './projectResources.js'
import { authorize, ROLES } from './auth.js'

const apiRouter = Router()

apiRouter.use('/auth', (req, res, next) => {
  const authRoutes = Router()

  authRoutes.get('/session', (req, res) => res.json(req.session.user))

  authRoutes(req, res, next)
})

apiRouter.use('/projects', (req, res, next) => {
  const projectsRoutes = Router()

  projectsRoutes.post('/', authorize(ROLES.PROJECT_MANAGER), (req, res) => res.json(projects.create(req.body)))
  projectsRoutes.get('/', (_, res) => res.json(projects.list()))
  projectsRoutes.put('/', (req, res) => res.json(projects.update(req.body)))
  projectsRoutes.get('/gantt', (req, res) => res.json(projects.gantt(req.query)))
  projectsRoutes.get('/:id', (req, res) => res.json(projects.read(req.params.id)))
  projectsRoutes.get('/:id/resources', (req, res) => res.json(projects.listResources(req.params.id, req.query.start, req.query.end, req.query.status)))

  projectsRoutes(req, res, next)
})

apiRouter.use('/resources', (req, res, next) => {
  const resourcesRoutes = Router()

  resourcesRoutes.post('/', (req, res) => res.json(resources.create(req.body)))
  resourcesRoutes.get('/', (_, res) => res.json(resources.list()))
  resourcesRoutes.get('/available', (req, res) => res.json(resources.listAvailable(req.query)))
  resourcesRoutes.put('/', (req, res) => res.json(resources.update(req.body)))
  resourcesRoutes.get('/:id', (req, res) => res.json(resources.read(req.params.id)))

  resourcesRoutes(req, res, next)
})

apiRouter.use('/project-resources', (req, res, next) => {
  const projectResourcesRoutes = Router()

  projectResourcesRoutes.post('/', (req, res) => res.json(projectResources.create(req.body)))
  projectResourcesRoutes.get('/', (req, res) => res.json(projectResources.list()))
  projectResourcesRoutes.get('/mine', (req, res) => res.json(projectResources.listByApprover(req.session.user.id, req.query.status)))
  projectResourcesRoutes.put('/', (req, res) => res.json(projectResources.update(req.body)))
  projectResourcesRoutes.get('/:id', (req, res) => res.json(projectResources.read(req.params.id)))

  projectResourcesRoutes(req, res, next)
})

apiRouter.get('/roles', (_, res) => res.json(ROLES))

apiRouter.all('*', (_, res) => res.status(404).json({ error: 'Route not found' }))

export default apiRouter