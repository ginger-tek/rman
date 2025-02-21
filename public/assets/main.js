import store from './store.js'
import router from './router.js'

Vue.createApp({
  template: `<header>
    <nav>
      <ul>
        <li><b>RMAN</b></li>
        <li><router-link to="/dashboard"><i class="bi bi-bar-chart-steps"></i> Dashboard</router-link></li>
        <li><router-link to="/projects"><i class="bi bi-card-heading"></i> Projects</router-link></li>
        <li><router-link to="/resources"><i class="bi bi-people"></i> Resources</router-link></li>
      </ul>
      <ul>
        <li><pv-dark-mode></pv-dark-mode></li>
        <li>
          <details class="dropdown">
            <summary><i class="bi bi-person-circle"></i> User</summary>
            <ul dir="rtl">
              <li><router-link to="/settings">Settings</router-link></li>
              <li><hr></li>
              <li><router-link to="/logout">Logout</router-link></li>
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