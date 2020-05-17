# quarantini

Introduces test quarantine functionality to isolate non-deterministic tests.

Why would you want to do this? Read the [background](#Background).

Otherwise, jump to: [Getting Started](#Getting-Started).

---

![Quarantini CI](https://github.com/michaelgoin/quarantini/workflows/Quarantini%20CI/badge.svg)

---

## Background

Non-deterministic tests (often referred to as "test flickers") get in the way of reliably delivering software. They slow down builds, delay deploys and increase toil. They also instill a false sense of security. Legitimate issues, such as race conditions, may be introduced but hidden behind the pre-existing behavior and dismissed.

In an ideal world, these tests would be resolved immediately. Best case, the cause would be determined and the test fixed. Second best, if the test did not add enough value to be fixed immediately, the test would be deleted. The long term maintenance and risk cost is too great. The test has already shown it does not have enough value. Don't waste your life re-running these over and over.

So why a quarantine? Because the real world is often less than ideal. The stance above may be a bit too aggressive for all or some members of a team. Teams may not have the autonomy, momentarily or permanently, to resolve these issues in the moment. More often, optimism may be winning out with a true belief of "we'll get to it."

The test quarantine gets these tests out of the way. It allows the removal of these tests from CI gating that impacts the day to day. Tests are still allowed to run, separately, to observe results or serve as any final check needed for a team's comfort zone. They remain as a reminder of maintenance needing to be completed. By flagging as "quarantined", it makes clear these tests are not to be fully trusted. An expiration serves to keep us honest in how we deal with these tests. A final indicator to fix now or admit the value trade-off does not weigh in favor of maintaining a particular test.

I do not know where I heard of a test quarantine first, but it may have been this article by Martin Fowler I read years ago: https://martinfowler.com/articles/nonDeterminism.html. A recommended read for more perspective on non-deterministic tests and test quarantines, as well covering challenges in creating reliable tests.

**quarantini** introduces basic test quarantine functionality, to get the quarantine benefits, without having to completely create your own solution. It tries not to do too much, allowing teams to setup quarantine to their comfort level, while still maintaining a level of accountability in resolving the non-determinism of quarantined tests.

## Getting Started

```
npm i quarantini
```

### tap

```js
const tap = require('tap')
const { extendTapTest } = require('quarantini')

extendTapTest(tap)

tap.test('Assert ok', (t) => {
  t.ok(true)
  t.end()
})

tap.quarantine('20200503', 'Assert 1=1', (t) => {
  t.equal(1, 1)
  t.end()
})
```

```json
{
  "scripts": {
    "test": "tap",
    "quarantine-test": "tap --test-env=QUARANTINI=1"
  }
}
```

#### Extending tap

To add quarantine functionality, the exported `extendTapTest` will be used to extend and modify the APIs on a tap `Test` instance. This works both on the default export and on sub tests.

```js
// extending base tap export
const tap = require('tap')
const { extendTapTest } = require('quarantini')

extendTapTest(tap)
```

```js
// extending a child test instance
const tap = require('tap')
const { extendTapTest } = require('quarantini')

tap.test('Parent test', (t) => {
  extendTapTest(t)
})
```

In certain cases, you may wish to get very targeted with what is subject to quarantine run rules. If this extended functionality needs to be removed prior to the end of a test instance, `Test.restore` can be invoked.

```js
const tap = require('tap')
const { extendTapTest } = require('quarantini')

tap.test('Parent test', (t) => {
  extendTapTest(t)

  // t.quarantine() tests...

  t.restore() // restores test instance back to original state

  // t.test() tests...
})
```

#### Non Quarantine VS Quarantine Run

Once extended, there are two potential run modes for tests to execute in.

Non-quarantine runs (default) will run tests (`t.test`) normally but will not execute quarantined tests (`t.quarantine`). Quarantined tests are instead flagged as TODO, indicating they need to be dealt with in their quarantined state. This run mode is intended for standard CI usage and prevents quarantined non-deterministic tests from breaking your standard CI jobs. This state is the default and requires no additional setup.

Quarantine runs will not run tests (`t.test`) but will attempt to run quarantined tests, per the quarantine rules (see expiration). Standard tests are flagged as "skipped".  This run mode is intended for isolating quarantine tests in a separate CI job to still observe, and more importantly fix, behavior. This state can be enabled via environment variable (recommended for CI) or manually via argument passed to `extendTapTest`.

#### Setting Quarantine Run

Setting up via environment variable is recommended for most situations. Once tests have been flagged as quarantined, running the standard test job with `QUARANTINI=1` will then trigger the quarantine functionality. `true` is also an acceptable value.

The tap CLI has args for setting environment variables per run. Adding `--test-env=QUARANTINI=1` to how your tap tests are invoked via the CLI will enable this functionality without needing additional tweaks to your environment.

```json
// example package.json scripts
{
  "scripts": {
    "test": "tap",
    "quarantine-test": "tap --test-env=QUARANTINI=1"
  }
}
```

To enable manually via code, set the `isQuarantineRun` argument when calling `extendTapTest`. This can be passed as the second argument or third argument when additional options have been provided.

```js
extendTapTest(testInstance, true)
// OR
extendTapTest(testInstance, {}, true)
```

#### Quarantining Tests

Tests can be flagged as quarantined by invoking `Test.quarantine(startDate, name, extra, cb)`.

This signature is identical to a standard tap test except it adds a new first parameter of `startDate`.

So a test declared as:

```js
t.test('1 = 1', (t) => {
  t.equal(1, 1)
  t.end()
})
```

becomes...

```js
t.quarantine('20200515', '1 = 1', (t) => {
  t.equal(1, 1)
  t.end()
})
```

`startDate` is intended to be the date the test was flagged as "quarantined." The date is checked to determine if a quarantined test has expired and needs to be immediately fixed (or removed).

It is recommended to pass in `startDate` as a static string. Expiration is an important part of being accountable for resolving issues with quarantined tests. That being said, the date supports any format supported by `moment` which processes the date.

#### Expiration

For a quarantine run, the `startDate` defined on a quarantined test (`Test.quarantine`) will be checked against the current date. If more time has passed than the expiration allows, the test will be force failed. At this point, you should either fix the test or remove the test. Do not fall into temptation to move the `startDate`.

By default, quarantined tests will expire in 30 days.

This default is meant to be very lenient for transitioning to a quarantine model. A more aggressive configuration, of 1-2 weeks for example, will more strongly encourage keeping these tests from getting out of hand.

The expiration threshold may be modified by passing a new value via options to `extendTapTest`.

```js
extendTapTest(testInstance, { expirationInDays: 14 })
```

#### Examples

A few common examples have been included in the `/examples` folder of the repository. An example `package.json` has been included to observe potential setup and exercise the tests via script, in addition to manually. I encourage experimenting with these, including viewing output by running via `node` instead of the tap CLI.

For a description of each example, see below.

##### mixed-nesting

For diagnosing and resolving race-conditions, test run pollution, etc. issues, it may be useful to run quarantine tests in the same context they ran prior to quarantine. In these situations, the best approach will likely be to add and remove quarantine functionality around the quarantined tests. This will isolate them from standard runs but still run all normal tests during a quarantine run.

##### top-level

Extending the default tap export, behaviors apply all `tap.test` and `tap.quarantine` calls.

##### categorized

By extending a sub test, any parent-test setup, etc. can apply standard tests or quarantined tests.

## Contributing

Contributions are welcome! Please read the [Code of Conduct](CODE_OF_CONDUCT.md) and the [Contributing Guide](CONTRIBUTING.md).

## License

[MIT](LICENSE)