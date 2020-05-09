'use strict'

const fs = require('fs')
const moment = require('moment')
const packageInfo = require('../package.json')

const nextVersionTemplate = '## [vNext] (TBD)'

// TODO: There's likely a much better way to do this.
fs.readFile('CHANGELOG.md', 'utf8', function (err, data) {
  if (err) {
    throw err
  }

  const todayFormatted = moment().format('YYYY-MM-DD')
  const version = `v${packageInfo.version}`
  const newChangelogHeader = `## [${version}](../../tree/${version}) (${todayFormatted})`

  console.log('Updating vNext header to: ', newChangelogHeader)

  const modified = data.replace(
    nextVersionTemplate,
    newChangelogHeader
  )

  fs.writeFile('CHANGELOG.md', modified, 'utf8', function (err) {
    if (err) {
      throw err
    }
  })
})
