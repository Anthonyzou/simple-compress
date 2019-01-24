const fs = require('fs-extra');
const zlib = require('zlib');

const longComputation = async file => {
  const content = await fs.readFile(file);
  const [br, gz] = await Promise.all([
    new Promise((res, reject) => {
      zlib.brotliCompress(content, (err, buf) => {
        res(buf);
      });
    }),
    new Promise((res, reject) => {
      zlib.gzip(content, (err, buf) => {
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
