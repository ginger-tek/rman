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
  const res = conn.prepare(`select
      pr.*,
      r.name as resourceName,
      p.title as projectTitle
    from project_resources pr
    join resources r on r.id = pr.resourceId
    join projects p on p.id = pr.projectId
    where pr.id = ?`).get([id])
  return res
}

export function list() {
  const conn = connect()
  const res = conn.prepare(`select
      pr.*,
      r.name as resourceName,
      p.title as projectTitle
    from project_resources pr
    join resources r on r.id = pr.resourceId
    join projects p on p.id = pr.projectId`).all()
  return res
}

export function listByApprover(approverId, status = 'Pending') {
  const conn = connect()
  const res = conn.prepare(`select
      pr.*,
      r.name as resourceName,
      p.title as projectTitle
    from project_resources pr
    join resources r on r.id = pr.resourceId
    join projects p on p.id = pr.projectId 
    where r.resourceApproverId = ?
    and pr.status = ?`).all([approverId, status])
  return res
}

export function update({ id, status, rejectReason, projectRole, weeklyHours, startDate, endDate }) {
  const conn = connect()
  const res = conn.prepare(`update project_resources set
    status = ?,
    rejectReason = ?,
    projectRole = ?,
    weeklyHours = ?,
    startDate = ?,
    endDate = ?,
    updated = current_timestamp
  where id = ?`).run([
    status,
    rejectReason,
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
  listByApprover,
  update,
}