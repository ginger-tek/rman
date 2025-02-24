import { findSunday, api } from '../utils.js'

export default {
  props: {
    range: {
      type: Object,
      default: { start: null, end: null }
    }
  },
  template: `<div class="gantt-tools flex shrink-ui">
    <fieldset role="group">
      <button @click="shiftDaySpan" title="Shorten Date Range" :disabled="daySpan == 7"><i class="bi bi-dash"></i></button>
      <button @click="shiftDaySpan(1)" title="Lengthen Date Range" :disabled="daySpan == 28"><i class="bi bi-plus"></i></button>
    </fieldset>
    <fieldset role="group">
      <button @click="shiftRange" title="Shift Previous Week"><i class="bi bi-chevron-left"></i></button>
      <button @click="resetToToday" title="Reset back to Today" :disabled="todayWithinRange"><i class="bi bi-arrow-clockwise"></i></button>
      <button @click="shiftRange(1)" title="Shift Next Week"><i class="bi bi-chevron-right"></i></button>
    </fieldset>
    <div style="flex:1;text-align:center"><b>{{ filters.start.toFormat('MMM d') }} - {{ filters.end.toFormat('MMM d') }} | {{ daySpan / 7 + ' Week' + (daySpan > 7 ? 's' : '') }}</b></div>
    <fieldset role="group">
      <button @click="toggleWeekends=!toggleWeekends" title="Show/Hide Weekends" :class="{secondary:!toggleWeekends}"><i class="bi bi-layout-split"></i></button>
    </fieldset>
  </div>
  <div class="gantt-wrap">
    <div class="gantt">
      <div class="slots">
        <div :class="['slot',{ today: today.hasSame(s,'day'), weekend: s.isWeekend }]" v-for="s in slots" :key="s">
          <div class="header">{{ s.toFormat('ccc M/d') }}</div>
        </div>
      </div>
      <div class="projects">
        <div :="p.position" v-for="p in projects" :key="p.id">
          <article :class="['status-' + p.status.toLowerCase().replace(' ','-')]">
            <details name="gantt-project">
              <summary>
                <b>{{ p.title }}</b> <span class="badge" :data-tooltip="p.resourceCount + ' Active Resources'"><i class="bi bi-person"></i>{{ p.resourceCount }}</span> <span class="badge" :data-tooltip="p.resourceHours + ' Active Hours'"><i class="bi bi-clock"></i> {{ p.resourceHours }}</span>
              </summary>
              <article class="shrink-ui">
                <table class="shrink-table">
                  <tbody>
                    <tr><th>Current Status</th><td>{{ p.status }}</td></tr>
                    <tr><th>Start Date</th><td>{{ p.startDate }}</td></tr>
                    <tr><th>End Date</th><td>{{ p.endDate }}</td></tr>
                    <tr><th>Active Resources</th><td>{{ p.resourceList }}</td></tr>
                    <tr><th>Active Resource Hours</th><td>{{ p.resourceHours }}</td></tr>
                  </tbody>
                </table>
                <router-link role="button" :to="'/projects/' + p.id" @click="showPreview=false">
                  <i class="bi bi-eye"></i> View Project
                </router-link>
              </article>
            </details>
          </article>
        </div>
      </div>
    </div>
  </div>
  <pv-modal v-model="showPreview">
    {{ project }}
    {{ project?.resources }}
  </pv-modal>`,
  setup(props) {
    const filters = Vue.reactive({
      start: null,
      end: null,
      status: null,
      resources: []
    })
    const today = luxon.DateTime.now().toLocal()
    const toggleWeekends = Vue.ref(true)
    const daySpan = Vue.ref(7)
    const slots = Vue.ref([])
    const projects = Vue.ref([])
    const project = Vue.ref({})
    const showPreview = Vue.ref(false)

    async function getProjects() {
      projects.value = []
      const params = new URLSearchParams()
      params.append('start', filters.start.toFormat('yyyy-MM-dd'))
      params.append('end', filters.end.toFormat('yyyy-MM-dd'))
      const res = await api(`projects/gantt?${params.toString()}`)
      projects.value = parseProjects(res)
    }

    async function previewProject(id) {
      project.value = await api(`projects/${id}`)
      project.value.resources = await api(`projects/${id}/resources`)
      showPreview.value = true
    }

    function createSlots() {
      let slot = filters.start
      slots.value = []
      if (determineSlot(slot))
        slots.value.push(slot)
      while (slot < filters.end) {
        slot = slot.plus({ days: 1 })
        if (determineSlot(slot))
          slots.value.push(slot)
      }
    }

    function determineSlot(s) {
      return !toggleWeekends.value ? !s.isWeekend : true
    }

    function shiftDaySpan(dir = 0) {
      if (dir == 1) {
        daySpan.value += 7
        filters.end = filters.end.plus({ days: 7 })
      } else {
        daySpan.value -= 7
        filters.end = filters.end.minus({ days: 7 })
      }
    }

    function shiftRange(dir = 0) {
      if (dir == 1) {
        filters.start = filters.start.plus({ days: 7 })
        filters.end = filters.end.plus({ days: 7 })
      } else {
        filters.start = filters.start.minus({ days: 7 })
        filters.end = filters.end.minus({ days: 7 })
      }
    }

    function resetToToday() {
      filters.start = findSunday()
      filters.end = filters.start.plus({ days: 6 })
    }

    function parseProjects(res) {
      return res.map(p => ({ ...p, position: calcPosition(p) }))
    }

    function calcPosition(p) {
      const startDate = luxon.DateTime.fromFormat(p.startDate, 'yyyy-MM-dd')
      const endDate = luxon.DateTime.fromFormat(p.endDate, 'yyyy-MM-dd')
      const leftIdx = slots.value.findIndex(s => s.hasSame(startDate, 'day'))
      const rightIdx = slots.value.findIndex(s => s.hasSame(endDate, 'day'))
      const before = startDate < filters.start
      const after = endDate > filters.end
      return {
        style: {
          'margin-left': before ? 0 : (leftIdx / slots.value.length * 100) + '%',
          'margin-right': after ? 0 : 100 - (rightIdx / slots.value.length * 100) + '%',
        },
        class: [
          'project',
          {
            before,
            after
          }
        ]
      }
    }

    Vue.onBeforeMount(() => {
      filters.start = props.start ? luxon.DateTime.fromFormat(props.start, 'yyyy-MM-dd') : findSunday()
      filters.end = props.end ? luxon.DateTime.fromFormat(props.end, 'yyyy-MM-dd') : filters.start.plus({ days: 6 })
    })

    Vue.watch(() => filters, () => Vue.nextTick(() => {
      createSlots()
      getProjects()
    }), { deep: true })

    Vue.watch(() => toggleWeekends.value, () => Vue.nextTick(() => {
      createSlots()
      projects.value = parseProjects(projects.value)
    }))

    const todayWithinRange = Vue.computed(() => today > filters.start && today < filters.end)

    return {
      filters,
      slots,
      projects,
      daySpan,
      today,
      toggleWeekends,
      todayWithinRange,
      project,
      showPreview,
      calcPosition,
      shiftDaySpan,
      shiftRange,
      resetToToday,
      previewProject
    }
  }
}