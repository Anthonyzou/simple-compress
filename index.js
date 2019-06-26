#!/usr/bin/env node

const path = require('path');
const os = require('os');
const glob = require('glob');
const commander = require('commander');
const mime = require('mime-types');

const {
  fork
} = require('child_process');

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
  const forks = [];
  const cpus = os.cpus().length;
  for (var i = 0; i < cpus; i++) {
    forks.push(fork(path.resolve(__dirname, 'comp.js')));
  }

  let inProgress = 0;
  let done = 0;
  files
    .filter(file => acceptedTypes.includes(mime.lookup(file)))
    .map(file => {
      inProgress++;
      forks[inProgress % forks.length].send(file);
    });
  console.timeEnd('files');
  forks.map(fork => {
    fork.on('message', () => {
      done++;
      if (done == inProgress) {
        console.timeEnd('app');
        process.exit();
      }
    });
  });
});