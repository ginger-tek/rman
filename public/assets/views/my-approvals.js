import { api } from '../utils.js'

export default {
  template: `<div class="container">
    <div class="flex spread shrink-ui">
      <h4>My Approvals</h4>
      <select v-model="status" @change="getApprovals">
        <option>Pending</option>
        <option>Rejected</option>
        <option>Approved</option>
      </select>
    </div>
    <pv-table :items="approvals" :fields="fields" :busy="loading" filter sort bordered>
      <template #resource-name="{resourceName,id}">
        <router-link :to="'/approvals/' + id">{{ resourceName }}</router-link>
      </template>
      <template #empty>
        <p v-if="status == 'Pending'">No pending approvals to review</p>
        <p v-else>No {{ status.toLowerCase() }} approvals yet</p>
      </template>
    </pv-table>
  </div>`,
  setup() {
    const approvals = Vue.ref([])
    const loading = Vue.ref(false)
    const status = Vue.ref('Pending')
    const fields = [
      { name: 'resourceName', label: 'Resource' },
      { name: 'projectTitle', label: 'Project' },
      'projectRole',
      'weeklyHours',
      'startDate',
      'endDate'
    ]

    async function getApprovals() {
      loading.value = true
      approvals.value = await api(`project-resources/mine?status=${status.value}`)
      loading.value = false
    }

    Vue.onBeforeMount(getApprovals)

    return {
      fields,
      status,
      approvals,
      loading,
      getApprovals,
    }
  }
}