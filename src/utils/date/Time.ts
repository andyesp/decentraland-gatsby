import Time from 'dayjs'
import utc from 'dayjs/plugin/utc'
import isToday from 'dayjs/plugin/isToday'
import isTomorrow from 'dayjs/plugin/isTomorrow'
import isYesterday from 'dayjs/plugin/isYesterday'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import pluralGetSet from 'dayjs/plugin/pluralGetSet'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import './extend.d.ts'

Time.extend(utc)
Time.extend(isToday)
Time.extend(isTomorrow)
Time.extend(isYesterday)
Time.extend(isBetween)
Time.extend(isSameOrAfter)
Time.extend(isSameOrBefore)
Time.extend(pluralGetSet)
Time.extend(customParseFormat)
Time.extend((_options, Dayjs, factory) => {
  const Constants = {
    Millisecond: 1,
    Second: 1000 /* milliseconds */,
    Minute: 1000 /* milliseconds */ * 60 /* seconds */,
    Hour: 1000 /* milliseconds */ * 60 /* seconds */ * 60 /* minutes */,
    Day: 1000 /* milliseconds */ * 60 /* seconds */ * 60 /* minutes */ * 24 /* hours */,
    Week: 1000 /* milliseconds */ * 60 /* seconds */ * 60 /* minutes */ * 24 /* hours */ * 7 /* days */,
  }

  const Formats = Object.freeze({
    GoogleCalendar: 'YYYYMMDDTHHmmss[Z]',
    DateInput: 'YYYY-MM-DD',
    TimeInput: 'HH:mm',
  })

  function date(value?: null | number | string | Date | Time.Dayjs) {
    if (value === null || value === undefined) {
      return null
    }

    if (value instanceof Date) {
      return value
    }

    return Time(value).toDate()
  }

  function from(date: Time.ConfigType, utc?: boolean): Time.Dayjs {
    if (utc) {
      return Time.utc(date)
    } else {
      return Time(date)
    }
  }

  Object.assign(factory, Constants, { Formats, isTime: factory.isDayjs, date, from })

  // console.log(Dayjs.prototype as any)
  const parse = (Dayjs.prototype as any).parse
  Object.assign(Dayjs.prototype, {
    parse: function (cfg: any) {
      if (
        typeof cfg.date === 'string' &&
        typeof cfg.args[0] === 'string' &&
        cfg.args[1] === Formats.TimeInput
      ) {
        cfg.date = '1970-01-01 ' + cfg.date
        cfg.utc = true
        cfg.args[0] = cfg.date
        cfg.args[1] = Formats.DateInput + ' ' + Formats.TimeInput
      }

      parse.bind(this)(cfg)
    }
  })

  Dayjs.prototype.getTime = function timeGetTime() {
    return this.toDate().getTime()
  }

  Dayjs.prototype.toJSON = function timeToJSON() {
    return this.toDate().toJSON()
  }
})

export default Time