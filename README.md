<h2 align="center">Copy Plus</h2>

** Light **: Smaller than gulp

** Compression **: Can be configured for gzip or Brotli _(node 11+)_

** Watching **: Can be configured to watch directories

## Getting Started

Install copy-plus using [`yarn`](https://yarnpkg.com/en/package/copy-plus):

```bash
yarn add --dev copy-plus
```

## Usage

Configure your `package.json`

```json
{
  "cppConfig": {
    "watch": [
      {
        "dirs": ["src/**", "test/**"],
        "ignore": "!**/*.ts",
        "dest": "dist",
        "keepPath": true,
        "ignoreWatchDir": true
      }
    ],
    "copy": [
      {
        "dirs": ["node_modules/muicss/dist/email/*.css"],
        "gz": true,
        "br": true,
        "dest": "dist/src/services/templates",
        "keepPath": false
      }
    ]
  }
}
```

- `keepPath`: Ignores source directory structure when false
  - when true: dist/src/services/templates => dist/src/services/templates/node_modules/muicss/dist/email/\*.css
  - when false: dist/src/services/templates => dist/src/services/templates/<FILE>.css
- `gz`: Prodce a DEST.gz file
  - ignored in watch configurations
- `br`: Prodce a DEST.br file - only available on node 11.7+
  - ignored in watch configurations
- `dirs`: Glob patterns to watch directories to
- `dest`: directory to place items in
- `ignoreWatchDir`: Don't use the root directory in output file structure
  - `dir:["src/**"]` => `a/b/c.txt` and would not give `src/a/b/c.txt`

## Command line

# Run

```
nfc
```

# Help menu

```
Usage: index [options]

Options:
  -w, --watch  Watch items in the watch configuration
  -h, --help   output usage information
```

# Behavior

- By default items in your `watch` config will be copied at least once.
- Items in your `copy` will only be copied once per run.
- Items are only watched when using `nfc -w`

## License

copy-plus is [MIT licensed](./LICENSE).
