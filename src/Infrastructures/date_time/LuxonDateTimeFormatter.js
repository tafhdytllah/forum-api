const DateTimeFormatter = require('../../Applications/date_time/DateTimeFormatter');

class LuxonDateTimeFormatter extends DateTimeFormatter {
  constructor(luxon, timezone = "Asia/Jakarta", formatStr = "yyyy-MM-dd'T'HH:mm:ssZZ") {
    super();
    this._luxon = luxon;
    this._timezone = timezone;
    this._formatStr = formatStr;
  }

  formatDateTime(date) {
    return this._luxon
      .fromJSDate(date, { zone: 'UTC' })
      .setZone(this._timezone)
      .toFormat(this._formatStr);
  }
}

module.exports = LuxonDateTimeFormatter;