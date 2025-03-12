import { connect } from './db.js'

export function create({ title, link, startDate, endDate }) {
  const conn = connect()
  const id = crypto.randomUUID()
  const res = conn.prepare(`insert into projects(id, title, link, startDate, endDate) values(?,?,?,?,?)`).run([
    id, title, link, startDate, endDate
  ])
  return res.changes == 1 ? read(id) : false
}

export function read(id) {
  const conn = connect()
  const res = conn.prepare(`select * from projects
    where id = ?`).get([id])
  return res
}

export function list() {
  const conn = connect()
  const res = conn.prepare(`select * from projects`).all()
  return res
}

export function listResources(id, startDate, endDate, status = null) {
  const conn = connect()
  const res = conn.prepare(`select
      pr.*,
      r.name as resourceName,
      p.title as projectTitle
    from project_resources pr
    left join resources r on r.id = pr.resourceId
    left join projects p on p.id = pr.projectId
    where pr.projectId = ?
    and (pr.startDate between ? and ? or pr.endDate between ? and ?)
    ${status ? `and pr.status = ?` : ''}`).all([
    id,
    startDate,
    endDate,
    startDate,
    endDate,
    status
  ].filter(v => !!v))
  return res
}

export function gantt({ start, end }) {
  const conn = connect()
  const res = conn.prepare(`select
      p.*,
      count(pr.id) as resourceCount,
      case
        when p.status in ('Planning','Canceled','Completed') then 0
        else sum(pr.weeklyHours)
      end as resourceHours,
      group_concat(r.name,', ') as resourceList
    from projects p
    left join project_resources pr on pr.projectId = p.id and (pr.startDate between ? and ?
      or pr.endDate between ? and ?
      or pr.startDate < ? and pr.endDate > ?) and pr.status = 'Approved'
    left join resources r on r.id = pr.resourceId
    where (p.startDate between ? and ?
      or p.endDate between ? and ?
      or p.startDate < ? and p.endDate > ?)
    group by p.id`).all([
    start,
    end,
    start,
    end,
    start,
    end,
    start,
    end,
    start,
    end,
    start,
    end
  ])
  return res
}

export function update({ id, title, status, description, link, startDate, endDate }) {
  const conn = connect()
  const res = conn.prepare(`update projects set
    title = ?,
    status = ?,
    description = ?,
    link = ?,
    startDate = ?,
    endDate = ?,
    updated = current_timestamp
  where id = ?`).run([
    title,
    status,
    description,
    link,
    startDate,
    endDate,
    id
  ])
  return res.changes == 1 ? read(id) : false
}

export default {
  create,
  read,
  list,
  listResources,
  gantt,
  update,
}