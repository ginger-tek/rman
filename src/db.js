import Database from "better-sqlite3"
import fs from 'fs/promises'

const schema = await fs.readFile('schema.sql', 'utf-8')

export function connect() {
  const conn = Database('rman.db')
  conn.exec(schema)
  return conn
}