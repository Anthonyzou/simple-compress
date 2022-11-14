#!/usr/bin/env node

import chokidar from "chokidar";
import { program } from "commander";

import { resolve } from "path";
import { globby } from "globby";
import { createGzip, createBrotliCompress } from "zlib";
import fs from "fs-extra";

program.option("-w, --watch", "Watch directories", false);
program.parse(process.argv);
const p = JSON.parse(fs.readFileSync("package.json")).cppConfig;

if (!p) {
  console.log("No configuration");
  process.exit(1);
}

let warn = () => {
  console.warn("WARN: Brotli is only enabled in node 11.7+");
  warn = () => {};
};

const handleFile = async (path, dest, keepPath, br, gz, ignoreWatchDir) => {
  let modifiedPath = path.split("/");
  if (ignoreWatchDir == true) {
    modifiedPath.shift();
    modifiedPath = modifiedPath.join("/");
  } else if (keepPath == false) {
    modifiedPath = modifiedPath.pop();
  } else {
    modifiedPath = modifiedPath.join("/");
  }

  const filePath = resolve(dest, modifiedPath);
  await fs.createFile(filePath);
  const read = fs.createReadStream(path);
  if (dest !== "." && dest !== "./") {
    read.pipe(fs.createWriteStream(resolve(dest, filePath)));
  }
  if (br == true) {
    if (createBrotliCompress) {
      const brotli = createBrotliCompress(p.brConfig || {});
      const br = fs.createWriteStream(`${modifiedPath}.br`);
      read.pipe(brotli).pipe(br);
    } else {
      warn();
    }
  }
  if (gz == true) {
    const gzip = createGzip(p.gzConfig || {});
    const gz = fs.createWriteStream(`${modifiedPath}.gz`);
    read.pipe(gzip).pipe(gz);
  }
};

if (program.watch && p.watch) {
  p.watch.map(({ dirs, ignore, dest, keepPath, ignoreWatchDir }) => {
    chokidar
      .watch(dirs, {
        dot: true,
        ...(ignore && {
          ignored: ignore.substr(1),
        }),
        persistent: true,
      })
      .on("add", (path) => {
        handleFile(path, dest, keepPath, false, false, ignoreWatchDir);
      })
      .on("change", (path) => {
        handleFile(path, dest, keepPath, false, false, ignoreWatchDir);
      })
      .on("unlink", async (path) => {
        await fs.remove(`${__dirname}/dist/${path}`);
      })
      .on("error", async (error) => {
        console.error("Error happened", error);
      });
  });
}

const watch = (p.copy || []).concat(program.watch ? [] : p.watch || []);
watch.concat(watch).map(async (directory) => {
  const { dirs, dest, keepPath, ignore, gz, br, ignoreWatchDir } = directory;
  if (ignore) {
    dirs.push(ignore);
  }

  const matches = await globby(dirs, {
    dot: true,
  });

  matches.map(async (path) => {
    handleFile(path, dest, keepPath, br, gz, ignoreWatchDir);
  });
});
