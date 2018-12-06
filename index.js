#!/usr/bin/env node

const { compress } = require('wasm-brotli');
const fs = require('fs-extra');
const zlib = require('zlib');
const glob = require('glob');
const commander = require('commander');
const mime = require('mime-types');

commander.option('-f, --folder [folder]').parse(process.argv);

const acceptedTypes = [
  'text/html',
  'text/css',
  'image/svg+xml',
  'application/javascript',
  'application/json',
];
glob(`${commander.folder}/**/*`, async (err, files) => {
  const results = files
    .filter(file => {
      const a = acceptedTypes.includes(mime.lookup(file));
      console.log(file, mime.lookup(file));
      return a;
    })
    .map(async file => {
      const content = await fs.readFile(file);
      const [br, gz] = await Promise.all([
        compress(content),
        new Promise((res, reject) => {
          zlib.gzip(content.toString(), (err, buf) => {
            res(buf);
          });
        }),
      ]);
      return Promise.all([
        fs.writeFile(file + '.br', br),
        fs.writeFile(file + '.gz', gz),
      ]);
    });
  await Promise.all(results);
});
