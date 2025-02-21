const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: () => import('./views/dashboard.js') },
  { path: '/projects', component: () => import('./views/projects.js') },
  { path: '/projects/:id', component: () => import('./views/project.js') },
  { path: '/resources', component: () => import('./views/resources.js') },
  { path: '/resources/:id', component: () => import('./views/resource.js') },
  { path: '/:pathMatch(.*)*', component: () => import('./views/notFound.js') },
]

const router = VueRouter.createRouter({
  routes,
  history: VueRouter.createWebHistory()
})

export default router