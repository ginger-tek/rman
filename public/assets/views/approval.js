import { api, local } from "../utils.js"

export default {
  template: `<form @submit.prevent="save" class="container">
    <article>
      <div class="flex">
        <h2 style="flex:1">{{ projectResource.resourceName }} on {{ projectResource.projectTitle }} <span :aria-busy="loading"></span></h2>
      </div>
      <div class="grid">
        <label>Project Role
          <input type="text" :value="projectResource.projectRole" readonly>
        </label>
        <label>Start Date
          <input type="date" :value="projectResource.startDate" readonly>
        </label>
        <label>End Date
          <input type="date" :value="projectResource.endDate" readonly>
        </label>
        <label>Weekly Hours
          <input type="text" :value="projectResource.weeklyHours" readonly>
        </label>
        <label>Total Hours
          <input type="number" :value="totalHours" readonly>
        </label>
      </div>
      <template v-if="projectResource.status == 'Pending'">
        <div v-if="showRejectReason">
          <label>Reject Reason
            <textarea v-model="projectResource.rejectReason" required></textarea>
          </label>
          <div class="grid">
            <button type="submit" :disabled="loading" class="danger"><i class="bi bi-floppy2"></i> Reject</button>
            <button type="button" @click="showRejectReason=false" :disabled="loading" class="secondary"><i class="bi bi-x-circle"></i> Cancel</button>
          </div>
        </div>
        <div v-else class="grid">
          <button type="submit" :disabled="loading" class="success"><i class="bi bi-floppy2"></i> Approve</button>
          <button type="button" @click="showRejectReason=true" :disabled="loading" class="danger"><i class="bi bi-trash"></i> Reject</button>
        </div>
      </template>
      <template v-else>
        <label>Status
          <input :value="projectResource.status">
        </label>
        <label v-if="projectResource.rejectReason">Reject Reason
          <textarea>{{ projectResource.rejectReason }}</textarea>
        </label>
      </template>
      <hr>
      <div><i class="bi bi-clock-history"></i> Created {{ local(projectResource.created) }} - Updated {{ local(projectResource.updated) }}</div>
    </article>
  </form>`,
  setup() {
    const route = VueRouter.useRoute()
    const router = VueRouter.useRouter()
    const projectResource = Vue.ref({})
    const resources = Vue.ref({})
    const loading = Vue.ref(true)
    const showRejectReason = Vue.ref(false)

    async function getResource() {
      try {
        projectResource.value = await api(`project-resources/${route.params.id}`)
      } catch (ex) {
        PicoVue.appendToast('Failed to load resource', { type: 'danger' })
        console.log(ex)
      } finally {
        loading.value = false
      }
    }

    async function getResources() {
      resources.value = await api(`resources`).then(d => d.filter(r => r.id != projectResource.value.id))
    }

    async function save() {
      projectResource.value.status = projectResource.value.rejectReason ? 'Rejected' : 'Approved'
      projectResource.value = await api(`project-resources`, 'PUT', projectResource.value)
      PicoVue.appendToast(`Approval ${projectResource.value.status}`, { type: 'info' })
      router.replace('/my-approvals')
    }

    const totalHours = Vue.computed(() => {
      const { startDate, endDate } = projectResource.value
      if (!startDate || !endDate) return 0
      const d = luxon.DateTime.fromFormat(endDate, 'yyyy-MM-dd').diff(luxon.DateTime.fromFormat(startDate, 'yyyy-MM-dd'), 'weeks')
      return Math.round(d.weeks) * projectResource.value.weeklyHours
    })

    Vue.onBeforeMount(async () => {
      await getResource()
      getResources()
    })

    return {
      projectResource,
      totalHours,
      resources,
      loading,
      showRejectReason,
      local,
      save
    }
  }
}