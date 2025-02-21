import { listProjects, listUsers } from './connectors/jira.js'
import { timer } from './utils.js'
import projects from './projects.js'

while (true) {
  const sourceItems = await listProjects()
  for (let sourceItem of sourceItems) {
    let exists = null
    if (exists = projects.read(sourceItem.id))
      projects.update(exists, sourceItem)
    else
      projects.create(sourceItem)
  }
  await timer(60 * 1000)
}