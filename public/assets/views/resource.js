import { api, local } from "../utils.js"

export default {
  template: `<form @submit.prevent="save" class="container">
    <article>
      <div class="flex">
        <h2 style="flex:1">{{ resource.name }} <span :aria-busy="loading"></span></h2>
        <div class="flex">
          <button type="submit" :disabled="loading"><i class="bi bi-floppy2"></i> Save</button>
          <button type="button" :disabled="loading" class="secondary"><i class="bi bi-trash"></i> Delete</button>
        </div>
      </div>
      <div class="grid">
        <label>Resource Name
          <input type="text" v-model="resource.name" required>
        </label>
        <label>Resource Email
          <input type="email" v-model="resource.email" required>
        </label>
      </div>
      <label>Resource Approver
        <select v-model="resource.resourceApproverId" :disabled="resources.length == 0">
          <option :value="null">{{ resources.length == 0 ? 'No resources yet' : 'No approver selected' }}</option>
          <option v-for="r in resources" :value="r.id">{{ r.name }} ({{ r.email }})</option>
        </select>
      </label>
      <hr>
      <div><i class="bi bi-clock-history"></i> Created {{ local(resource.created) }} - Updated {{ local(resource.updated) }}</div>
    </article>
  </form>`,
  setup() {
    const route = VueRouter.useRoute()
    const resource = Vue.ref({})
    const resources = Vue.ref({})
    const loading = Vue.ref(true)

    async function getResource() {
      try {
        resource.value = await api(`resources/${route.params.id}`)
      } catch (ex) {
        PicoVue.appendToast('Failed to load resource', { type: 'danger' })
        console.log(ex)
      } finally {
        loading.value = false
      }
    }

    async function getResources() {
      resources.value = await api(`resources`).then(d => d.filter(r => r.id != resource.value.id))
    }

    async function save() {
      resource.value = await api(`resources`, 'PUT', resource.value)
      PicoVue.appendToast('Saved!', { type: 'success' })
    }

    Vue.onBeforeMount(async () => {
      await getResource()
      getResources()
    })

    return {
      resource,
      resources,
      loading,
      local,
      save
    }
  }
}