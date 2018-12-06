#!/usr/bin/env node

const path = require('path');
const os = require('os');
const glob = require('glob');
const commander = require('commander');
const mime = require('mime-types');

const { fork } = require('child_process');

commander.option('-f, --folder [folder]').parse(process.argv);

const forks = [];
const cpus = os.cpus().length;
for (var i = 0; i < cpus; i++) {
  forks.push(fork(path.resolve(__dirname, 'comp.js')));
}

const acceptedTypes = [
  'text/html',
  'text/css',
  'image/svg+xml',
  'application/javascript',
  'application/json',
];
glob(`${commander.folder}/**/*`, async (err, files) => {
  let inProgress = 0;
  let done = 0;
  files
    .filter(file => acceptedTypes.includes(mime.lookup(file)))
    .map(file => {
      inProgress++;
      forks[inProgress % forks.length].send(file);
    });

  forks.map(fork => {
    fork.on('message', () => {
      done++;
      if (done == inProgress) {
        process.exit();
      }
    });
  });
});
