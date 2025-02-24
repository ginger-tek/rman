import fs from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { DateTime } from 'luxon'
import { basename, dirname } from 'path'

export default class Logger {
  constructor(file) {
    this.name = basename(file)
    this.dir = dirname(file)
    if (!existsSync(this.dir))
      mkdirSync(this.dir, { recursive: true })
  }
  get path() {
    const date = DateTime.now().toFormat('yyyyMMdd')
    return `${this.dir}/${date}_${this.name}`
  }
  _clean(str) {
    return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').trim()
  }
  async info(msg) {
    fs.appendFile(this.path, `${DateTime.now().toUTC()} [INFO]  ${this._clean(msg)}\n`)
  }
  async warn(msg) {
    fs.appendFile(this.path, `${DateTime.now().toUTC()} [WARN]  ${this._clean(msg)}\n`)
  }
  async error(msg) {
    fs.appendFile(this.path, `${DateTime.now().toUTC()} [ERROR] ${this._clean(msg)}\n`)
  }
}