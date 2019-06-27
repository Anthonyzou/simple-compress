#!/usr/bin/env node

const chokidar = require('chokidar');
const program = require('commander');
const glob = require('globby');
const {
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
const package = JSON.parse(fs.readFileSync('package.json')).cppConfig
if (!package) {
  return console.log('No configuration')
}
const gzip = createGzip(package.gzConfig || {});
let brotli
if (createBrotliCompress) {
  brotli = createBrotliCompress(package.brConfig || {});
} else if (JSON.stringify(package).includes('"br"')) {
  console.warn('WARN: Brotli is only enabled in node 11.7+')
}

const handleFile = async (path, dest, keepPath, br, gz, ignoreWatchDir) => {
  let modifiedPath = path.split('/')
  if (ignoreWatchDir == true) {
    modifiedPath.shift()
    modifiedPath = modifiedPath.join('/')
  }
  if (keepPath == false) {
    modifiedPath = modifiedPath.pop()
  }
  const filePath = resolve(dest, modifiedPath)
  await fs.createFile(filePath)
  const read = fs.createReadStream(path)
  read.pipe(fs.createWriteStream(resolve(dest, filePath)));
  if (br == true && brotli) {
    const br = fs.createWriteStream(`${path}.br`);
    read.pipe(brotli).pipe(br);
  }
  if (gz == true) {
    const gz = fs.createWriteStream(`${path}.gz`);
    read.pipe(gzip).pipe(gz);
  }
};

if (program.watch) {
  package.watch.map(({
    dirs,
    ignore,
    dest,
    keepPath,
    ignoreWatchDir
  }) => {
    chokidar
      .watch(dirs, {
        ...ignore && {
          ignored: globToRegexp(ignore),
        },
        persistent: true,
      })
      .on('add', path => handleFile(path, dest, keepPath, ignoreWatchDir))
      .on('change', path => handleFile(path, dest, keepPath, ignoreWatchDir))
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
    br,
    ignoreWatchDir
  } = directory
  if (ignore) {
    dirs.push(ignore)
  }

  const matches = await glob(dirs);

  matches.map(async path => {
    handleFile(path, dest, keepPath, br, gz, ignoreWatchDir)
  });
});