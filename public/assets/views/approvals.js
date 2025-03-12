import { api } from '../utils.js'

export default {
  template: `<div class="container">
    <div class="flex spread shrink-ui">
      <h4>All Approvals</h4>
    </div>
    <pv-table :items="approvals" :fields="fields" :busy="loading" filter sort bordered>
      <template #resource-name="{resourceName,id}">
        <router-link :to="'/approvals/' + id">{{ resourceName }}</router-link>
      </template>
      <template #empty>
        <p>No approvals yet</p>
      </template>
    </pv-table>
  </div>`,
  setup() {
    const approvals = Vue.ref([])
    const loading = Vue.ref(false)
    const fields = [
      { name: 'resourceName', label: 'Resource' },
      { name: 'projectTitle', label: 'Project' },
      'projectRole',
      'status',
      'weeklyHours',
      'startDate',
      'endDate'
    ]

    async function getApprovals() {
      loading.value = true
      approvals.value = await api('project-resources')
      loading.value = false
    }

    Vue.onBeforeMount(getApprovals)

    return {
      fields,
      approvals,
      loading,
    }
  }
}