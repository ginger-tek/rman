import { connect } from './db.js'

export function create({ name, email, resourceApproverId }) {
  const conn = connect()
  const id = crypto.randomUUID()
  const res = conn.prepare(`insert into resources(id, name, email, resourceApproverId) values(?,?,?,?)`).run([
    id, name, email, resourceApproverId
  ])
  return res.changes == 1 ? read(id) : false
}

export function read(id) {
  const conn = connect()
  const res = conn.prepare(`select * from resources
    where id = ?`).get([id])
  return res
}

export function find(email) {
  const conn = connect()
  const res = conn.prepare(`select * from resources
    where email = ?`).get([email])
  return res
}

export function list() {
  const conn = connect()
  const res = conn.prepare(`select
      r.id,
      r.name,
      r.email,
      ra.name as resourceApprover,
      coalesce(count(pr.id), 0) as activeProjects,
      coalesce(sum(pr.weeklyHours), 0) as activeHours,
      r.created,
      r.updated
    from resources r
    left join resources ra on ra.id = r.resourceApproverId
    left join project_resources pr on pr.resourceId = r.id and pr.status = 'Approved' and date('now') between pr.startDate and pr.endDate
    group by r.id`).all()
  return res
}

export function listAvailable({ start, end }) {
  const conn = connect()
  const res = conn.prepare(`select
      r.id,
      r.name,
      r.email,
      ra.name as resourceApprover,
      coalesce(count(pr.id), 0) as activeProjects,
      coalesce(sum(pr.weeklyHours), 0) as activeHours,
      r.created,
      r.updated
    from resources r
    left join resources ra on ra.id = r.resourceApproverId
    left join project_resources pr on pr.resourceId = r.id and pr.status = 'Approved' and pr.startDate <= ? and pr.endDate >= ?
    group by r.id`).all([
      start,
      end
    ])
  return res
}

export function update({ id, name, email, resourceApproverId }) {
  const conn = connect()
  const res = conn.prepare(`update resources set
    name = ?,
    email = ?,
    resourceApproverId = ?,
    updated = current_timestamp
  where id = ?`).run([
    name,
    email,
    resourceApproverId,
    id
  ])
  return res.changes == 1 ? read(id) : false
}

export default {
  create,
  read,
  find,
  list,
  listAvailable,
  update,
}