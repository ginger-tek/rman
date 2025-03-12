import store from './store.js'
import router from './router.js'

store.user = await fetch('/api/auth/session').then(r=>r.json())

Vue.createApp({
  template: `<header>
    <nav>
      <ul>
        <li><b>RMAN</b></li>
        <li><router-link to="/dashboard"><i class="bi bi-bar-chart-steps"></i> Dashboard</router-link></li>
        <li><router-link to="/projects"><i class="bi bi-card-heading"></i> Projects</router-link></li>
        <li><router-link to="/resources"><i class="bi bi-people"></i> Resources</router-link></li>
        <li><router-link to="/approvals"><i class="bi bi-person-check-fill"></i> Approvals</router-link></li>
        <li><router-link to="/my-approvals"><i class="bi bi-person-check-fill"></i> My Approvals</router-link></li>
      </ul>
      <ul>
        <li><pv-dark-mode></pv-dark-mode></li>
        <li>
          <details class="dropdown">
            <summary><i class="bi bi-person-circle"></i> {{ store.user.name }}</summary>
            <ul dir="rtl">
              <li><router-link to="/settings">Settings <i class="bi bi-gear"></i></router-link></li>
              <li><hr></li>
              <li><router-link to="/logout">Logout <i class="bi bi-box-arrow-right"></i></router-link></li>
            </ul>
          </details>
        </li>
      </ul>
    </nav>
  </header>
  <main>
    <router-view :key="route.path"></router-view>
  </main>
  <pv-toaster></pv-toaster>`,
  setup() {
    const route = VueRouter.useRoute()
    return { route, store }
  }
})
  .use(router)
  .use(PicoVue)
  .mount('#app')