'use strict'

const moment = require('moment')
const tap = require('tap')
const test = tap.test

const extendTapTest = require('../src/extend-tap-test')

test('Non Quarantine Run', (t) => {
  t.autoend()

  test('should add new API members, only test instance provided', (t) => {
    const testInstance = new tap.Test()

    const hasOwnProperty = Object.hasOwnProperty.bind(testInstance)
    t.notOk(hasOwnProperty('isQuarantineRun'))
    t.notOk(hasOwnProperty('expirationInDays'))
    t.notOk(hasOwnProperty('quarantine'))
    t.notOk(hasOwnProperty('restore'))

    extendTapTest(testInstance)
    t.tearDown(() => {
      testInstance.restore()
    })

    t.ok(hasOwnProperty('isQuarantineRun'))
    t.ok(hasOwnProperty('expirationInDays'))
    t.ok(hasOwnProperty('quarantine'))
    t.ok(hasOwnProperty('restore'))

    t.end()
  })

  test('should add new API members, test instance and options provided', (t) => {
    const testInstance = new tap.Test()

    const hasOwnProperty = Object.hasOwnProperty.bind(testInstance)
    t.notOk(hasOwnProperty('isQuarantineRun'))
    t.notOk(hasOwnProperty('expirationInDays'))
    t.notOk(hasOwnProperty('quarantine'))
    t.notOk(hasOwnProperty('restore'))

    extendTapTest(testInstance, {})
    t.tearDown(() => {
      testInstance.restore()
    })

    t.ok(hasOwnProperty('isQuarantineRun'))
    t.ok(hasOwnProperty('expirationInDays'))
    t.ok(hasOwnProperty('quarantine'))
    t.ok(hasOwnProperty('restore'))

    t.end()
  })

  test('should add new API members, test instance and isQuarantine provided', (t) => {
    const testInstance = new tap.Test()

    const hasOwnProperty = Object.hasOwnProperty.bind(testInstance)
    t.notOk(hasOwnProperty('isQuarantineRun'))
    t.notOk(hasOwnProperty('expirationInDays'))
    t.notOk(hasOwnProperty('quarantine'))
    t.notOk(hasOwnProperty('restore'))

    extendTapTest(testInstance, false)
    t.tearDown(() => {
      testInstance.restore()
    })

    t.ok(hasOwnProperty('isQuarantineRun'))
    t.ok(hasOwnProperty('expirationInDays'))
    t.ok(hasOwnProperty('quarantine'))
    t.ok(hasOwnProperty('restore'))

    t.end()
  })

  test('should add new API members, all params provided', (t) => {
    const testInstance = new tap.Test()

    const hasOwnProperty = Object.hasOwnProperty.bind(testInstance)
    t.notOk(hasOwnProperty('isQuarantineRun'))
    t.notOk(hasOwnProperty('expirationInDays'))
    t.notOk(hasOwnProperty('quarantine'))
    t.notOk(hasOwnProperty('restore'))

    extendTapTest(testInstance, {}, false)
    t.tearDown(() => {
      testInstance.restore()
    })

    t.ok(hasOwnProperty('isQuarantineRun'))
    t.ok(hasOwnProperty('expirationInDays'))
    t.ok(hasOwnProperty('quarantine'))
    t.ok(hasOwnProperty('restore'))

    t.end()
  })

  test('should add new API members', (t) => {
    const testInstance = new tap.Test()
    const originalTest = testInstance.test

    extendTapTest(testInstance)
    t.tearDown(() => {
      testInstance.restore()
    })

    t.equal(testInstance.test, originalTest)

    t.end()
  })

  test('restore should remove added functionality', (t) => {
    const testInstance = new tap.Test()
    const hasOwnProperty = Object.hasOwnProperty.bind(testInstance)

    extendTapTest(testInstance)

    testInstance.restore()

    t.notOk(hasOwnProperty('isQuarantineRun'))
    t.notOk(hasOwnProperty('expirationInDays'))
    t.notOk(hasOwnProperty('quarantine'))
    t.notOk(hasOwnProperty('restore'))

    t.end()
  })

  t.test('should allow normal test runs', (t) => {
    const testInstance = new tap.Test()
    extendTapTest(testInstance)

    t.tearDown(() => {
      testInstance.restore()
    })

    testInstance.on('end', () => {
      t.ok(testInstance.results.ok)
      t.equal(testInstance.results.pass, 1)

      t.notOk(testInstance.results.bailout)
      t.equal(testInstance.results.fail, 0)
      t.equal(testInstance.results.skip, 0)
      t.equal(testInstance.results.todo, 0)

      t.end()
    })

    testInstance.plan(1)

    testInstance.test('this test should run', (t) => {
      t.ok(true)
      t.end()
    })
  })

  t.test('should flag quarantine test as TODO', (t) => {
    const testInstance = new tap.Test()
    extendTapTest(testInstance)

    t.tearDown(() => {
      testInstance.restore()
    })

    testInstance.on('end', () => {
      t.ok(testInstance.results.ok)
      t.equal(testInstance.results.todo, 1)
      t.equal(testInstance.results.pass, 1)

      t.notOk(testInstance.results.bailout)
      t.equal(testInstance.results.fail, 0)
      t.equal(testInstance.results.skip, 0)

      t.end()
    })

    // test run marked TODO still counts as a planned item
    testInstance.plan(1)

    testInstance.quarantine('20200417', 'should not run', (t) => {
      throw new Error('THIS SHOULD NOT BLOW UP')
    })
  })
})

test('Quarantine Run', (t) => {
  t.autoend()

  test('should add new API members', (t) => {
    const testInstance = new tap.Test()
    const originalTest = testInstance.test

    const hasOwnProperty = Object.hasOwnProperty.bind(testInstance)

    t.notOk(hasOwnProperty('isQuarantineRun'))
    t.notOk(hasOwnProperty('expirationInDays'))
    t.notOk(hasOwnProperty('quarantine'))
    t.notOk(hasOwnProperty('restore'))

    extendTapTest(testInstance, true)

    t.tearDown(() => {
      testInstance.restore()
    })

    t.ok(hasOwnProperty('isQuarantineRun'))
    t.ok(hasOwnProperty('expirationInDays'))
    t.ok(hasOwnProperty('quarantine'))
    t.ok(hasOwnProperty('restore'))

    t.notEqual(testInstance.test, originalTest)

    t.end()
  })

  test('restore should remove added functionality', (t) => {
    const testInstance = new tap.Test()
    const originalTest = testInstance.test

    const hasOwnProperty = Object.hasOwnProperty.bind(testInstance)

    extendTapTest(testInstance, true)

    testInstance.restore()

    t.notOk(hasOwnProperty('isQuarantineRun'))
    t.notOk(hasOwnProperty('expirationInDays'))
    t.notOk(hasOwnProperty('quarantine'))
    t.notOk(hasOwnProperty('restore'))

    t.equal(testInstance.test, originalTest)

    t.end()
  })

  t.test('should skip test runs', (t) => {
    const testInstance = new tap.Test()
    extendTapTest(testInstance, true)

    t.tearDown(() => {
      testInstance.restore()
    })

    testInstance.on('end', () => {
      t.ok(testInstance.results.ok)
      t.equal(testInstance.results.skip, 1)
      t.equal(testInstance.results.pass, 1)

      t.notOk(testInstance.results.bailout)
      t.equal(testInstance.results.todo, 0)
      t.equal(testInstance.results.fail, 0)

      t.end()
    })

    testInstance.autoend()

    testInstance.test('should be skipped', (t) => {
      throw new Error('THIS SHOULD NOT BLOW UP')
    })
  })

  t.test('should skip test runs when ran as individual function', (t) => {
    const testInstance = new tap.Test()
    extendTapTest(testInstance, true)

    t.tearDown(() => {
      testInstance.restore()
    })

    testInstance.on('end', () => {
      t.ok(testInstance.results.ok)
      t.equal(testInstance.results.skip, 1)
      t.equal(testInstance.results.pass, 1)

      t.notOk(testInstance.results.bailout)
      t.equal(testInstance.results.todo, 0)
      t.equal(testInstance.results.fail, 0)

      t.end()
    })

    testInstance.autoend()

    const testFunc = testInstance.test
    testFunc('should be skipped', (t) => {
      throw new Error('THIS SHOULD NOT BLOW UP')
    })
  })

  t.test('should run quarantine items younger than expiration', (t) => {
    const testInstance = new tap.Test()
    extendTapTest(testInstance, true)

    t.tearDown(() => {
      testInstance.restore()
    })

    testInstance.on('end', () => {
      t.ok(testInstance.results.ok)
      t.equal(testInstance.results.pass, 2)

      t.notOk(testInstance.results.bailout)
      t.equal(testInstance.results.skip, 0)
      t.equal(testInstance.results.todo, 0)
      t.equal(testInstance.results.fail, 0)

      t.end()
    })

    testInstance.plan(2)

    const today = Date.now()
    testInstance.quarantine(today, 'This should run', (t) => {
      t.ok(true)
      t.end()
    })

    testInstance.quarantine(today, 'This should also run', (t) => {
      t.equal(1, 1)
      t.end()
    })
  })

  t.test('should run test items nested under running quarantine item', (t) => {
    const testInstance = new tap.Test()
    extendTapTest(testInstance, true)

    t.tearDown(() => {
      testInstance.restore()
    })

    let ranInnerTest = false

    testInstance.on('end', () => {
      t.ok(ranInnerTest)

      t.ok(testInstance.results.ok)
      t.equal(testInstance.results.pass, 1)

      t.notOk(testInstance.results.bailout)
      t.equal(testInstance.results.skip, 0)
      t.equal(testInstance.results.todo, 0)
      t.equal(testInstance.results.fail, 0)

      t.end()
    })

    testInstance.plan(1)

    const today = Date.now()
    testInstance.quarantine(today, 'This should run', (t) => {
      t.plan(1)
      t.test('this should also run', (t) => {
        ranInnerTest = true

        t.equal(1, 1)
        t.end()
      })
    })
  })

  t.test('should fail and not run quarantine items older than expiration', (t) => {
    const testInstance = new tap.Test()
    extendTapTest(testInstance, { expirationInDays: 1}, true)

    t.tearDown(() => {
      testInstance.restore()
    })

    testInstance.on('end', () => {
      t.notOk(testInstance.results.ok)
      t.equal(testInstance.results.fail, 1)

      t.notOk(testInstance.results.bailout)
      t.equal(testInstance.results.pass, 0)
      t.equal(testInstance.results.skip, 0)
      t.equal(testInstance.results.todo, 0)

      t.end()
    })

    testInstance.plan(1)

    const yesterday = moment().subtract(1, 'days')
    testInstance.quarantine(yesterday, 'This should fail without running.', (t) => {
      throw new Error('THIS SHOULD NOT BLOW UP')
    })
  })

  t.test('should not expire when Infinity used for expiration days', (t) => {
    const testInstance = new tap.Test()
    extendTapTest(testInstance, { expirationInDays: Infinity }, true)

    t.tearDown(() => {
      testInstance.restore()
    })

    testInstance.on('end', () => {
      t.ok(testInstance.results.ok)
      t.equal(testInstance.results.pass, 1)

      t.notOk(testInstance.results.bailout)
      t.equal(testInstance.results.fail, 0)
      t.equal(testInstance.results.skip, 0)
      t.equal(testInstance.results.todo, 0)

      t.end()
    })

    testInstance.plan(1)

    testInstance.quarantine('19700101', 'This should should run', (t) => {
      t.ok(true)
      t.end()
    })
  })

  t.test('should always expire when negative Infinity used for expiration days', (t) => {
    const testInstance = new tap.Test()
    extendTapTest(testInstance, { expirationInDays: -Infinity }, true)

    t.tearDown(() => {
      testInstance.restore()
    })

    testInstance.on('end', () => {
      t.notOk(testInstance.results.ok)
      t.equal(testInstance.results.fail, 1)

      t.notOk(testInstance.results.bailout)
      t.equal(testInstance.results.pass, 0)
      t.equal(testInstance.results.skip, 0)
      t.equal(testInstance.results.todo, 0)

      t.end()
    })

    testInstance.plan(1)

    const tomorrow = moment().add(1, 'days')
    testInstance.quarantine(tomorrow, 'This should fail without running.', (t) => {
      throw new Error('THIS SHOULD NOT BLOW UP')
    })
  })

  t.test('should fail test, not crash, on invalid date', (t) => {
    const testInstance = new tap.Test()
    extendTapTest(testInstance, { expirationInDays: 1}, true)

    t.tearDown(() => {
      testInstance.restore()
    })

    testInstance.on('end', () => {
      t.notOk(testInstance.results.ok)
      t.equal(testInstance.results.fail, 1)

      t.notOk(testInstance.results.bailout)
      t.equal(testInstance.results.pass, 0)
      t.equal(testInstance.results.skip, 0)
      t.equal(testInstance.results.todo, 0)

      t.end()
    })

    testInstance.plan(1)

    testInstance.quarantine('abcde', 'This should fail without running.', (t) => {
      throw new Error('THIS SHOULD NOT BLOW UP')
    })
  })

  t.test('should successfully run promise based quarantine items', (t) => {
    const testInstance = new tap.Test()
    extendTapTest(testInstance, true)

    t.tearDown(() => {
      testInstance.restore()
    })

    testInstance.on('end', () => {
      t.ok(testInstance.results.ok)
      t.equal(testInstance.results.pass, 1)

      t.notOk(testInstance.results.bailout)
      t.equal(testInstance.results.skip, 0)
      t.equal(testInstance.results.todo, 0)
      t.equal(testInstance.results.fail, 0)

      t.end()
    })

    testInstance.autoend()

    const today = Date.now()
    testInstance.quarantine(today, 'This should run', async t => {
      const isTrue = await someAsyncFunc()

      t.ok(isTrue)
    })

    function someAsyncFunc() {
      return new Promise((resolve) => {
        setImmediate(() => {
          resolve(true)
        })
      })
    }
  })
})

test('should pick up env var when not passed', (t) => {
  testOverrideEnv(t, true)

  const testInstance = new tap.Test()
  extendTapTest(testInstance)

  t.equal(testInstance.isQuarantineRun, true)
  t.end()
})

test('env var should win when true and passed-in false', (t) => {
  testOverrideEnv(t, true)

  const testInstance = new tap.Test()
  extendTapTest(testInstance, false)

  t.equal(testInstance.isQuarantineRun, true)
  t.end()
})

test('env var should win when false and passed-in true', (t) => {
  testOverrideEnv(t, false)

  const testInstance = new tap.Test()
  extendTapTest(testInstance, true)

  t.equal(testInstance.isQuarantineRun, false)
  t.end()
})

function testOverrideEnv(t, quarantiniValue) {
  const orig = process.env.QUARANTINI
  process.env.QUARANTINI = quarantiniValue

  t.tearDown(() => {
    // setting values on env converts to string.
    // 'undefined' has a greatly different meaning than undefined.
    // https://nodejs.org/dist/latest-v6.x/docs/api/process.html#process_process_env
    if (orig == null) {
      delete process.env.QUARANTINI
    } else {
      process.env.QUARANTINI = orig
    }
  })
}