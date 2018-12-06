const { compress } = require('wasm-brotli');
const fs = require('fs-extra');
const zlib = require('zlib');

const longComputation = async file => {
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
};

process.on('message', async message => {
  await longComputation(message);
  process.send(message);
});
