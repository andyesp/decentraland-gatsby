import { ScheduleFunction, UpdatePayloadFunction } from './types'

export default class JobContext<P extends object = {}> {
  constructor(
    public id: string | null,
    public name: string | null,
    public payload: P = {} as P,
    private _schedule: ScheduleFunction,
    private _update: UpdatePayloadFunction
  ) {}

  log(message: string, data?: Record<string, any>) {
    console.log(`[${this.name || 'cron'}] ${message}`, {
      type: this.name ? 'job' : 'cron',
      name: this.name || 'cron',
      ...data
    })
  }

  async updatePayload(payload: object = {}) {
    if (this.id) {
      await this._update(this.id, payload)
    }
  }

  async schedule(name: string | null, date: Date, payload: object = {}) {
    if (name) {
      await this._schedule(name, date, payload)
    }
  }
}
