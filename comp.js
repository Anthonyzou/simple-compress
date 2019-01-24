const fs = require('fs');
const { createGzip, createBrotliCompress } = require('zlib');

const gzip = createGzip({});
const brotli = createBrotliCompress({});

const compression = async file => {
  const input = fs.createReadStream(file);
  const br = fs.createWriteStream(`${file}.br`);
  const gz = fs.createWriteStream(`${file}.gz`);

  input.pipe(gzip).pipe(gz);
  input.pipe(brotli).pipe(br);

  return Promise.all([
    new Promise(res => {
      gz.on('close', res);
    }),
    new Promise(res => {
      br.on('close', res);
    }),
  ]);
};

process.on('message', async message => {
  try {
    await compression(message);
  } catch (e) {
    console.log(e);
  }
  process.send(message);
});
