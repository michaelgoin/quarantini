'use strict'

const moment = require('moment')

const DEFAULT_EXPIRATION_DAYS = 30

/**
 * Extends a tap Test instance to add quarantine functionality.
 * @param {Test} tapTest a tap Test instance (which includes the default tap export).
 * @param {Object} [opts] optional options object.
 * @param {Object} [opts.expirationInDays] # days from start of quarantine a quarantined
 * test will expire and fail until removed.
 * @param {Boolean} [isQuarantineRun] optional boolean to define if quarantine rules are
 * in effect. Typically process.env.QUARANTINI is defined instead.
 */
function extendTapTest(tapTest, opts, isQuarantineRun) {
  // allow opts to be excluded while still providing isQuarantineRun
  if (typeof opts === 'boolean') {
    isQuarantineRun = opts
    opts = null
  }

  if (opts == null) {
    opts = Object.create(null)
  }

  opts.expirationInDays = opts.expirationInDays || DEFAULT_EXPIRATION_DAYS

  const envSetting = getEnvIsQuarantineRun()
  const isQuarantine = (envSetting != null) ? envSetting : isQuarantineRun
  tapTest.isQuarantineRun = Boolean(isQuarantine)

  tapTest.expirationInDays = opts.expirationInDays
  tapTest.quarantine = quarantine.bind(tapTest)

  // TODO: don't use this anywhere else so perhaps don't need this
  // stored anymore
  if (tapTest.isQuarantineRun) {
    tapTest._originalTest = tapTest.test
    tapTest.test = quarantineSkippedTest.bind(tapTest)
  }

  tapTest.restore = restoreTapTest.bind(tapTest)
}

function getEnvIsQuarantineRun() {
  const envSetting = process.env.QUARANTINI
  if (envSetting != null) {
    const isQuarantineRun =
      (envSetting.toLowerCase() === 'true') ||
      (envSetting === '1')

    return isQuarantineRun
  }

  return null
}

function quarantine(startDate, name, extra, cb) {
  const quarantineName = `[Quarantined (${startDate})]: ${name}`

  if (this.isQuarantineRun) {
    if (this.expirationInDays === Infinity) {
      return this._originalTest(quarantineName, extra, cb)
    }

    if (this.expirationInDays === -Infinity) {
      return this._originalTest(quarantineName, extra, quarantineExpirationFailedTest)
    }

    const expirationDate = moment(startDate).add(this.expirationInDays, 'days')
    if (!expirationDate.isValid()) {
      return this._originalTest(quarantineName, extra, quarantineStartDateFailedTest)
    }

    const currentDate = Date.now()
    if (currentDate >= expirationDate) {
      return this._originalTest(quarantineName, extra, quarantineExpirationFailedTest)
    }

    return this._originalTest(quarantineName, extra, cb)
  }

  // expand args to allow passing in skip for quarantine
  if (typeof extra === 'function') {
    cb = extra
    extra = {}
  }

  const options = Object.assign({}, extra)
  options.todo = true

  return this.test(quarantineName, options, cb)
}

function quarantineStartDateFailedTest(t) {
  t.comment('Quarantine start date invalid. Forcing failure.')

  t.fail(`startDate was an invalid date: ${startDate}`)

  t.end()
}

function quarantineExpirationFailedTest(t) {
  t.comment('Quarantine past expiration. Forcing failure.')

  t.fail(
    'Test was force failed due to being in quarantine longer than' +
    `${this.expirationDate} day expiration.`
  )

  t.end()
}

function quarantineSkippedTest(name, extra, cb) {
  if (typeof extra === 'function') {
    cb = extra
    extra = {}
  }

  const options = Object.assign({}, extra)
  options.skip = true

  return this._originalTest(name, options, cb)
}

function restoreTapTest() {
  if (this._originalTest) {
    this.test = this._originalTest
    delete this._originalTest
  }

  delete this.isQuarantineRun
  delete this.expirationInDays
  delete this.quarantine

  delete this.restore
}

module.exports = extendTapTest
