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

program.option('-w, --watch', 'Watch directories', false);
program.parse(process.argv);
const package = JSON.parse(fs.readFileSync('package.json')).packaging

const gzip = createGzip({});
const brotli = createBrotliCompress({});

if (program.watch) {
  const handleFile = async (path, dest, keepPath) => {
    const filePath = resolve(dest, keepPath == false ? path.split('/').pop() : path)
    await fs.createFile(dest)
    fs.createReadStream(path).pipe(fs.createWriteStream(resolve(dest, filePath)));
  };
  package.watch.map(({
    dirs,
    ignore,
    dest,
    keepPath
  }) => {
    chokidar
      .watch(dirs, {
        ignored: new RegExp(ignore),
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

const watch = program.watch ? [] :
  package.watch.map(d => ({
    dir: `${d}/**/*`,
    dest: package.watch.dest,
  }));

watch.concat(package.copy).map((directory) => {
  const {
    dir,
    dest,
    keepPath,
    gz,
    br
  } = directory
  const matches = await glob(dir.dir);
  matches.map(async path => {
    const input = fs.createReadStream(path);
    const fileDir = resolve(dest, keepPath == false ? path.split('/').pop() : path);
    await fs.createFile(fileDir)
    input.pipe(fs.createWriteStream(fileDir));
    if (br == true) {
      const br = fs.createWriteStream(`${path}.br`);
      input.pipe(gzip).pipe(br);
    }
    if (gz == true) {
      const gz = fs.createWriteStream(`${path}.gz`);
      input.pipe(brotli).pipe(gz);
    }
  });
});