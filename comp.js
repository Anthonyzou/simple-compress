const fs = require('fs');
const {
  createGzip,
  createBrotliCompress
} = require('zlib');


module.exports = async file => {
  const gzip = createGzip({});
  const brotli = createBrotliCompress({});
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