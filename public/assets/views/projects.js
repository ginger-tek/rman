import { api } from "../utils.js"

export default {
  template: `<div class="container">
    <div class="flex spread shrink-ui">
      <h4>Projects</h4>
      <button @click="showCreate=true"><i class="bi bi-plus"></i> Add Project</button>
    </div>
    <pv-table :items="projects" :fields="fields" :busy="loading" filter sort bordered>
      <template #title="{title,id}">
        <router-link :to="'/projects/' + id">{{ title }}</router-link>
      </template>
      <template #empty>
        <p>No projects yet</p>
      </template>
    </pv-table>
    <pv-modal v-model="showCreate">
      <template #header>
        <b>Add Project</b>
      </template>
      <form @submit.prevent="createProject">
        <label>Project Title
          <input type="text" name="title" required>
        </label>
        <label>Source Link
          <input type="url" name="link" placeholder="https://company.jira-cloud.net/project/PROJ-123" required>
        </label>
        <div class="grid">
          <label>Project Start Date
            <input type="date" name="startDate" required>
          </label>
          <label>Project End Date
            <input type="date" name="endDate" required>
          </label>
        </div>
        <div class="grid">
          <button type="reset" :disabled="loading" @click="showCreate=false" class="secondary">Cancel</button>
          <button type="submit" :disabled="loading">Add</button>
        </div>
      </form>
    </pv-modal>
  </div>`,
  setup() {
    const router = VueRouter.useRouter()
    const showCreate = Vue.ref(false)
    const fields = [
      'title',
      'status',
      'startDate',
      'endDate'
    ]
    const projects = Vue.ref([])
    const loading = Vue.ref(false)

    async function createProject(ev) {
      try {
        loading.value = true
        const data = {
          title: ev.target.title.value,
          link: ev.target.link.value,
          startDate: ev.target.startDate.value,
          endDate: ev.target.endDate.value
        }
        const res = await api('projects', 'POST', data)
        PicoVue.appendToast(`${data.title} project added!`, { type: 'success' })
        showCreate.value = false
        router.replace(`/projects/${res.id}`)
      } catch (ex) {
        PicoVue.appendToast('Failed to add project', { type: 'danger' })
        console.error(ex)
      } finally {
        loading.value = false
      }
    }

    async function getProjects() {
      loading.value = true
      projects.value = await api('projects')
      loading.value = false
    }

    Vue.onBeforeMount(getProjects)

    return {
      fields,
      projects,
      showCreate,
      loading,
      createProject
    }
  }
}