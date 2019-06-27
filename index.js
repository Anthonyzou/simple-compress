#!/usr/bin/env node

const chokidar = require('chokidar');
const program = require('commander');
var glob = require('globby');
var {
  resolve
} = require('path');
const {
  createGzip,
  createBrotliCompress
} = require('zlib');
const fs = require('fs-extra');
const globToRegexp = require("glob-to-regexp")

program.option('-w, --watch', 'Watch directories', false);
program.parse(process.argv);
const package = JSON.parse(fs.readFileSync('package.json')).packaging

const gzip = createGzip(package.gzConfig || {});
const brotli = createBrotliCompress(package.brConfig || {});

const handleFile = async (path, dest, keepPath, br, gz) => {
  const filePath = resolve(dest, keepPath == false ? path.split('/').pop() : path)
  await fs.createFile(filePath)
  const read = fs.createReadStream(path)
  read.pipe(fs.createWriteStream(resolve(dest, filePath)));
  if (br == true) {
    const br = fs.createWriteStream(`${path}.br`);
    read.pipe(gzip).pipe(br);
  }
  if (gz == true) {
    const gz = fs.createWriteStream(`${path}.gz`);
    read.pipe(brotli).pipe(gz);
  }
};

if (program.watch) {
  package.watch.map(({
    dirs,
    ignore,
    dest,
    keepPath
  }) => {
    chokidar
      .watch(dirs, {
        ...ignore && {
          ignored: globToRegexp(ignore),
        },
        persistent: true,
      })
      .on('add', path => handleFile(path, dest, keepPath))
      .on('change', path => handleFile(path, dest, keepPath))
      .on('unlink', async path => {
        await fs.remove(`${__dirname}/dist/${path}`);
      })
      .on('error', async error => {
        console.error('Error happened', error);
      });
  });
}

const watch = program.watch ? [] : package.watch;
package.copy.concat(watch).map(async (directory) => {
  const {
    dirs,
    dest,
    keepPath,
    ignore,
    gz,
    br
  } = directory
  if (ignore) {
    dirs.push(ignore)
  }

  const matches = await glob(dirs);

  matches.map(async path => {
    handleFile(path, dest, keepPath, br, gz)
  });
});