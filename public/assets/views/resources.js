import { api } from "../utils.js"

export default {
  template: `<div class="container">
    <div class="flex spread shrink-ui">
      <h4>Resources</h4>
      <button @click="showCreate=true"><i class="bi bi-plus"></i> Add Resource</button>
    </div>
    <pv-table :items="resources" :fields="fields" :busy="loading" filter sort bordered>
      <template #name="{name,id}">
        <router-link :to="'/resources/' + id">{{ name }}</router-link>
      </template>
      <template #resource-approver="{resourceApprover}">
        <span v-if="resourceApprover">{{ resourceApprover }}</span>
        <span v-else><i>No approver selected</i></span>
      </template>
      <template #empty>
        <p>No resources yet</p>
      </template>
    </pv-table>
    <pv-modal v-model="showCreate">
      <template #header>
        <b>Add Resource</b>
      </template>
      <form @submit.prevent="createResource">
        <label>Resource Name
          <input type="text" name="name" required>
        </label>
        <label>Resource Email
          <input type="email" name="email" required>
        </label>
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
      'name',
      'resourceApprover',
      'activeProjects',
      'activeHours'
    ]
    const resources = Vue.ref([])
    const loading = Vue.ref(false)

    async function createResource(ev) {
      try {
        loading.value = true
        const data = {
          name: ev.target.name.value,
          email: ev.target.email.value
        }
        const res = await api('resources', 'POST', data)
        PicoVue.appendToast(`${data.name} resource added!`, { type: 'success' })
        showCreate.value = false
        router.replace(`/resources/${res.id}`)
      } catch (ex) {
        PicoVue.appendToast('Failed to add resource', { type: 'danger' })
        console.error(ex)
      } finally {
        loading.value = false
      }
    }

    async function getResources() {
      loading.value = true
      resources.value = await api('resources')
      loading.value = false
    }

    Vue.onBeforeMount(getResources)

    return {
      fields,
      resources,
      showCreate,
      loading,
      createResource
    }
  }
}