import { connect } from './db.js'

export function create({ projectId, resourceId, projectRole, weeklyHours, startDate, endDate }) {
  const conn = connect()
  const id = crypto.randomUUID()
  const res = conn.prepare(`insert into project_resources(id,projectId,resourceId,projectRole,weeklyHours,startDate,endDate) values(?,?,?,?,?,?,?)`).run([
    id, projectId, resourceId, projectRole, weeklyHours, startDate, endDate
  ])
  return res.changes == 1 ? read(id) : false
}

export function read(id) {
  const conn = connect()
  const res = conn.prepare(`select * from project_resources
    where id = ?`).get([id])
  return res
}

export function list() {
  const conn = connect()
  const res = conn.prepare(`select * from project_resources`).all()
  return res
}

export function update({ id, status, projectRole, weeklyHours, startDate, endDate }) {
  const conn = connect()
  const res = conn.prepare(`update project_resources set
    status = ?,
    projectRole = ?,
    weeklyHours = ?,
    startDate = ?,
    endDate = ?,
    updated = current_timestamp
  where id = ?`).run([
    status,
    projectRole,
    weeklyHours,
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
  update,
}