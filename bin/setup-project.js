#!/usr/bin/env node
const { resolve } = require('path')
const { sync } = require('glob')
const { mkdirSync, writeFileSync, readFileSync } = require('fs')
const { spawn } = require('child_process')
const { grey, green, red } = require('colors/safe')

const isUpdate = process.argv.find((arg) => arg === '--update')

function installDependencies(modules, options) {
  return new Promise((resolve, reject) => {
    console.log()
    console.log(
      grey(
        `    intalling ${
          options && options.dev ? 'devDependencies' : 'dependencies'
        }: `
      )
    )
    console.log()
    modules.forEach((module) => console.log(green('        ' + module)))
    console.log()
    const run = spawn(
      'npm',
      [
        'install',
        options && options.dev ? '-D' : '-s',
        options && options.exact && '-E',
      ]
        .filter(Boolean)
        .concat(modules || []),
      { stdio: 'inherit' }
    )
    run.on('exit', (code) =>
      code
        ? reject(new Error(`Installation exits with code ${code}`))
        : resolve(0)
    )
  })
}

function executable(file) {
  return new Promise((resolve, reject) => {
    const run = spawn('chmod', ['+x', file], { stdio: 'inherit' })

    run.on('exit', (code) =>
      code ? reject(new Error(`Error changing executables`)) : resolve(0)
    )
  })
}

Promise.resolve()
  .then(() =>
    installDependencies([
      'dotenv',
      'gatsby@4',
      'gatsby-plugin-image@2',
      'gatsby-plugin-sharp@4',
      'gatsby-transformer-sharp@4',
      'gatsby-plugin-manifest@4',
      'gatsby-plugin-offline@5',
      'gatsby-plugin-react-helmet@5',
      'gatsby-plugin-typescript@4',
      'gatsby-plugin-sri@1',
      'gatsby-plugin-postcss@5',
      'postcss@8',
      'core-js@3',
      '@gatsbyjs/reach-router@1',
      '@reach/router@1',
      'postcss-assets@6',
      'postcss-svg@3',
      'autoprefixer@10',
      'gatsby-source-filesystem@4',
      'node-pg-migrate@6',
      'react-helmet@6',
      'pg@8',
    ])
  )

  // .then(() =>
  //   installDependencies([
  //     'eth-crypto@1.6.0',
  //   ], { exact: true })
  // )

  .then(() =>
    installDependencies(
      [
        'prettier',
        'concurrently',
        'nodemon',
        'ts-node',
        '@types/validator',
        '@types/node',
        '@types/isomorphic-fetch',
        '@types/express',
      ],
      { dev: true }
    )
  )

  .then(() =>
    installDependencies(['devcert@1.1.0'], { dev: true, exact: true })
  )

  .then(() => {
    const projectPkg = require(resolve(process.cwd(), 'package.json'))
    // projectPkg.statics = STATIC_FILES
    projectPkg.scripts = Object.assign(projectPkg.scripts || {}, {
      build: 'gatsby build && tsc -p .',
      develop: 'gatsby develop --https -H 0.0.0.0',
      format: "prettier --write './src/**/*.{ts,tsx,js,jsx,json,md,css}'",
      start:
        "concurrently -c blue,green -n SERVER,FRONT 'npm run serve' 'npm run develop'",
      serve:
        "DOTENV_CONFIG_PATH=.env.development nodemon --watch src/entities --watch src/server.ts -e ts,json --exec 'ts-node -r dotenv/config' src/server",
      clean: 'gatsby clean',
      migrate:
        'DOTENV_CONFIG_PATH=.env.development ts-node -r dotenv/config ./node_modules/node-pg-migrate/bin/node-pg-migrate -j ts -m src/migrations -d CONNECTION_STRING',
      production:
        './node_modules/node-pg-migrate/bin/node-pg-migrate -m lib/migrations -d CONNECTION_STRING up && NODE_ENV=production node lib/server.js',
      test: 'echo "Write tests! -> https://gatsby.dev/unit-testing" && exit 1',
    })
    writeFileSync(
      resolve(process.cwd(), 'package.json'),
      JSON.stringify(projectPkg, null, 2)
    )
  })
  .then(() => {
    if (isUpdate) {
      return
    }

    const templates = __dirname + '/templates'
    const files = sync('**/*', {
      cwd: templates,
      root: templates,
      absolute: false,
      dot: true,
      mark: true,
    })

    files.forEach((file) => {
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
  })
  .then(() => executable('entrypoint.sh'))
  .then(() => {
    console.log('\n', green(`Done! Have a nice day!`, '\n'))
    process.exit(0)
  })
  .catch((err) => {
    console.log()
    console.error(red(`    ${err.message}`))
    console.error(
      grey(
        err.stack
          .split('\n')
          .map((line) => '    ' + line)
          .join('\n')
      )
    )
    console.log()
    process.exit(1)
  })
