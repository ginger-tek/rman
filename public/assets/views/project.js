import { api, local } from "../utils.js"

export default {
  template: `<form @submit.prevent="save" class="container">
    <article>
      <div class="flex shrink-ui">
        <h2 style="flex:1">{{ project.title }} <span :aria-busy="loading"></span></h2>
        <div class="flex">
          <button type="submit" :disabled="loading"><i class="bi bi-floppy2"></i> Save</button>
          <button type="button" :disabled="loading" class="secondary"><i class="bi bi-trash"></i> Delete</button>
        </div>
      </div>
      <div class="grid">
        <div>
          <label>Project Title
            <input type="text" v-model="project.title" required>
          </label>
          <label>Status
            <select v-model="project.status" required>
              <option>Planning</option>
              <option>Approving</option>
              <option>Active</option>
              <option>Canceled</option>
              <option>Completed</option>
            </select>
          </label>
          <div class="grid">
            <label>Start Date
              <input type="date" v-model="project.startDate" required>
            </label>
            <label>End Date
              <input type="date" v-model="project.endDate" required>
            </label>
          </div>
          <label><a :href="project.link" target="_blank">Source Link <i class="bi bi-link-45deg"></i></a>
            <input type="url" v-model="project.link" required>
          </label>
        </div>
        <label style="display:flex;flex-direction:column">Description
          <textarea style="flex:1" v-model="project.description" rows="3"></textarea>
        </label>
      </div>
      <div class="flex shrink-ui">
        <div style="flex:1">Project Resources</div>
        <button type="button" @click="showRequest=true"><i class="bi bi-person-plus"></i> Request Project Resource</button>
      </div>
      <pv-table :items="projectResources" :fields="fields" filter sort bordered>
        <template #resource-name="{resourceId,resourceName}">
          <router-link :to="'/resources/' + resourceId">{{ resourceName }}</router-link>
        </template>
      </pv-table>
      <hr>
      <div><i class="bi bi-clock-history"></i> Created {{ local(project.created) }} - Updated {{ local(project.updated) }}</div>
    </article>
  </form>
  <pv-modal v-model="showRequest">
    <template #header>
      <b>Request Project Resource</b>
    </template>
    <form @submit.prevent="requestResource">
      <div class="grid">
        <label>Project Role
          <select name="projectRole" @change="findAvailableResources" required>
            <option :value="null">Select a project role</option>
            <option v-for="role in roles" :value="role">{{ role }}</option>
          </select>
        </label>
        <label>Weekly Hours
          <input name="weeklyHours" type="number" value="1" required>
        </label>
      </div>
      <div class="grid">
        <label>Start Date
          <input name="startDate" type="date" :min="project.startDate" :value="project.startDate" required>
        </label>
        <label>End Date
          <input name="endDate" type="date" :max="project.endDate" :value="project.endDate" required>
        </label>
      </div>
      <div>Available Resources
        <label v-for="resource in availableResources">
          <input type="radio" name="resourceId" :value="resource.id"> {{ resource.name }}
        </label>
      </div>
      <div class="grid">
        <button type="reset" :disabled="loading" @click="showRequest=false" class="secondary">Cancel</button>
        <button type="submit" :disabled="loading">Add</button>
      </div>
    </form>
  </pv-modal>`,
  setup() {
    const route = VueRouter.useRoute()
    const project = Vue.ref({})
    const projectResources = Vue.ref([])
    const availableResources = Vue.ref([])
    const loading = Vue.ref(true)
    const showRequest = Vue.ref(false)
    const fields = [
      'resourceName',
      'projectRole',
      'status',
      'weeklyHours',
      'startDate',
      'endDate'
    ]
    const roles = [
      'Project Manager',
      'Business Lead',
      'Analyst',
      'Engineer',
      'Developer',
      'QA/Tester',
    ]

    async function getProject() {
      try {
        project.value = await api(`projects/${route.params.id}`)
      } catch (ex) {
        PicoVue.appendToast('Failed to load project', { type: 'danger' })
        console.log(ex)
      } finally {
        loading.value = false
      }
    }

    async function getProjectResources() {
      const params = new URLSearchParams()
      params.append('start', project.value.startDate)
      params.append('end', project.value.endDate)
      projectResources.value = await api(`projects/${project.value.id}/resources?${params.toString()}`)
    }

    async function findAvailableResources() {
      const params = new URLSearchParams()
      params.append('start', project.value.startDate)
      params.append('end', project.value.endDate)
      availableResources.value = await api(`/resources/available?${params.toString()}`)
    }

    async function requestResource(ev) {
      try {
        loading.value = true
        const data = {
          projectId: project.value.id,
          resourceId: ev.target.resourceId.value,
          weeklyHours: parseFloat(ev.target.weeklyHours.value),
          projectRole: ev.target.projectRole.value,
          startDate: ev.target.startDate.value,
          endDate: ev.target.endDate.value,
        }
        const res = await api(`project-resources`, 'POST', data)
        await getProjectResources()
        showRequest.value = false
        PicoVue.appendToast('Resource requested! Pending manager approval', { type: 'success' })
      } catch (ex) {
        PicoVue.appendToast('Failed to request resource', { type: 'danger' })
        console.error(ex)
      } finally {
        loading.value = false
      }
    }

    async function save() {
      loading.value = true
      project.value = await api(`projects`, 'PUT', project.value)
      PicoVue.appendToast('Saved!', { type: 'success' })
      loading.value = false
    }

    Vue.onBeforeMount(async () => {
      await getProject()
      getProjectResources()
    })

    return {
      project,
      projectResources,
      availableResources,
      loading,
      fields,
      showRequest,
      roles,
      local,
      save,
      findAvailableResources,
      requestResource
    }
  }
}