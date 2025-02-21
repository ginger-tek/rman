import fs from 'fs/promises'
import { DateTime } from 'luxon'
import { basename, dirname } from 'path'

export default class Logger {
  constructor(file) {
    this.name = basename(file)
    this.dir = dirname(file)
  }
  get path() {
    const date = DateTime.now().toFormat('yyyyMMdd')
    return `${this.dir}/${date}_${this.name}`
  }
  _clean(str) {
    return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
  }
  info(msg) {
    fs.appendFile(this.path, `${DateTime.now().toUTC()} [INFO]  ${this._clean(msg).trim()}\n`)
  }
  warn(msg) {
    fs.appendFile(this.path, `${DateTime.now().toUTC()} [WARN]  ${this._clean(msg).trim()}\n`)
  }
  error(msg) {
    fs.appendFile(this.path, `${DateTime.now().toUTC()} [ERROR] ${this._clean(msg).trim()}\n`)
  }
}