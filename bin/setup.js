#!/usr/bin/env node
const { resolve } = require('path')
const { sync } = require('glob')
const { mkdirSync, writeFileSync, readFileSync } = require('fs')
const { spawnSync } = require('child_process')
const { grey, green } = require('colors/safe')

spawnSync('npm', [
  'install',
  '-s',
  'dotenv',
  'express',
  'web3x',
  'dcl-crypto',
  'decentraland-crypto',
  'node-pg-migrate',
  'isomorphic-fetch',
  'nodemon',
  'pg',
  'ajv',
  'body-parser',
  'gatsby',
  'gatsby-image',
  'gatsby-plugin-intl',
  'gatsby-plugin-manifest',
  'gatsby-plugin-offline',
  'gatsby-plugin-react-helmet',
  'gatsby-plugin-sass',
  'gatsby-plugin-sharp',
  'gatsby-plugin-typescript',
  'gatsby-source-filesystem',
  'gatsby-transformer-sharp',
  'validator',
])

spawnSync('npm', [
  'install ',
  '-D',
  'prettier',
  'concurrently',
  'ts-node',
  '@types/validator',
  '@types/node',
  '@types/isomorphic-fetch',
  '@types/express',
])

const pkg = require(resolve(process.cwd(), 'package.json'))
pkg.scripts = Object.assign(pkg.scripts || {}, {
  build: 'gatsby build && tsc -p .',
  develop: 'gatsby develop -H 0.0.0.0',
  format: 'prettier --write "**/*.{js,jsx,json,md}"',
  start:
    "concurrently -c blue,green -n SERVER,FRONT 'npm run serve' 'npm run develop'",
  serve:
    "DOTENV_CONFIG_PATH=.env.development nodemon --watch src/entities --watch src/server.ts -e ts,json --exec 'ts-node -r dotenv/config.js' src/server",
  clean: 'gatsby clean',
  migrate:
    'DOTENV_CONFIG_PATH=.env.development ts-node -r dotenv/config.js ./node_modules/node-pg-migrate/bin/node-pg-migrate -j ts -d CONNECTION_STRING',
  production: 'NODE_ENV=production node lib/server.js',
  test: 'echo "Write tests! -> https://gatsby.dev/unit-testing" && exit 1',
})
writeFileSync(
  resolve(process.cwd(), 'package.json'),
  JSON.stringify(pkg, null, 2)
)

const templates = __dirname + '/templates'
const files = sync('**/*', {
  cwd: templates,
  root: templates,
  absolute: false,
  dot: true,
  mark: true,
})

files.forEach(file => {
  const isDir = file.endsWith('/')
  const target = isDir ? file.slice(0, -1) : file
  console.log(grey('creating'), green(target))

  if (isDir) {
    mkdirSync(resolve(process.cwd(), target))
  } else {
    writeFileSync(
      resolve(process.cwd(), target),
      readFileSync(resolve(templates, target))
    )
  }
})
