#!/usr/bin/env node

const os = require('os');
const glob = require('glob');
const commander = require('commander');
const mime = require('mime-types');
const pMap = require("p-map");
const comp = require('./comp')

commander.option('-f, --folder [folder]').parse(process.argv);

const acceptedTypes = [
  'text/html',
  'text/css',
  'image/svg+xml',
  'application/javascript',
  'application/json',
];
console.time('app');
console.time('files');

glob(`${commander.folder}/**/*`, async (err, files) => {
  if (files.length == 0) {
    return
  }

  const f = files
    .filter(file => acceptedTypes.includes(mime.lookup(file)))
  console.timeEnd('files');
  await pMap(f, comp, {
    concurrency: Math.min(files.length, os.cpus().length)
  })
  console.timeEnd('app');

});