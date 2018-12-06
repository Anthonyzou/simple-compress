const { compress } = require('wasm-brotli');
const fs = require('fs-extra');
const zlib = require('zlib');
const glob = require('glob');
const commander = require('commander');

commander.option('-f, --folder [folder]').parse(process.argv);

glob(`./${commander.folder}/**/@(js|css|html)`, async (err, files) => {
  const results = files.map(async file => {
    console.log(file);
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
