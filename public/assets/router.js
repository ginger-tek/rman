const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: () => import('./views/dashboard.js') },
  { path: '/projects', component: () => import('./views/projects.js') },
  { path: '/projects/:id', component: () => import('./views/project.js') },
  { path: '/resources', component: () => import('./views/resources.js') },
  { path: '/resources/:id', component: () => import('./views/resource.js') },
  { path: '/approvals', component: () => import('./views/approvals.js') },
  { path: '/my-approvals', component: () => import('./views/my-approvals.js') },
  { path: '/approvals/:id', component: () => import('./views/approval.js') },
  { path: '/:pathMatch(.*)*', component: () => import('./views/notFound.js') },
]

const router = VueRouter.createRouter({
  routes,
  history: VueRouter.createWebHistory()
})

export default router