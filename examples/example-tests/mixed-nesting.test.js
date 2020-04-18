'use strict'

const tap = require('tap')
const { extendTapTest } = require('../../index')

// Infinity means it will never expire. This allows later example dates
// to be represented as static strings, which is expected in real usage.
// It is NOT recommended to use Infinity in your own tests. Expiration
// is to encourage good grooming behaviors. :)
const NEVER_EXPIRE = Infinity

tap.test('Assert ok', (t) => {
  t.ok(true)
  t.end()
})

tap.test('Assert notOk', (t) => {
  t.notOk(false)
  t.end()
})

tap.test('A parent test', (t) => {
  t.autoend()

  t.test('a normal executing child test', (t) => {
    t.ok(true)
    t.end()
  })

  // Quarantine behavior only applies to items following this
  // for sub test 't'. This allows all tests to execute, in their normal
  // situation, for a quarantine run. Thiscan be useful in diagnosing
  // race conditions for tests that have been quarantined.
  extendTapTest(t, { expirationInDays: NEVER_EXPIRE })

  t.quarantine('20200503', 'Assert 1=1', (t) => {
    t.equal(1, 1)
    t.end()
  })

  t.quarantine('20200503', 'Assert 2=2', async t => {
    const value = await somethingAsync()
    t.equal(value, 2)

    async function somethingAsync() {
      return 2
    }
  })

  // Remove quarantine functionality for extended sub test
  t.restore()

  t.test('this will still execute as normal during quarantine run', (t) => {
    t.equal(1, 1)
    t.end()
  })
})


