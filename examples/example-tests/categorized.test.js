'use strict'

const tap = require('tap')
const { extendTapTest } = require('../../index')

// Infinity means it will never expire. This allows later example dates
// to be represented as static strings, which is expected in real usage.
// It is NOT recommended to use Infinity in your own tests. Expiration
// is to encourage good grooming behaviors. :)
const NEVER_EXPIRE = Infinity

tap.test('My normal tests', (t) => {
  extendTapTest(t, { expirationInDays: NEVER_EXPIRE })

  t.autoend()

  t.test('Assert ok', (t) => {
    t.ok(true)
    t.end()
  })

  t.test('Assert notOk', (t) => {
    t.notOk(false)
    t.end()
  })

  t.test('A parent test', (t) => {
    t.autoend()

    t.test('a child test', (t) => {
      t.ok(true)
      t.end()
    })
  })
})

tap.test('My quarantined tests', (t) => {
  extendTapTest(t, { expirationInDays: NEVER_EXPIRE })

  let setVal = null

  t.beforeEach((done) => {
    setVal = true
    done()
  })

  t.afterEach((done) => {
    setVal = null
    done()
  })

  t.autoend()

  t.quarantine('20200503', 'Assert 1=1', (t) => {
    t.equal(1, 1)
    t.ok(setVal)
    t.end()
  })

  t.quarantine('20200503', 'Assert 2=2', async t => {
    const value = await somethingAsync()
    t.equal(value, 2)
    t.ok(setVal)

    async function somethingAsync() {
      return 2
    }
  })
})
