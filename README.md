<h2 align="center">Simple file copying delcarations</h2>

** Light **: Smaller than gulp

** Compression **: Can be configured for gzip or Brotli _(node 11+)_

** Watching **: Can be configured to watch directories

## Getting Started

Install node-file-copier using [`yarn`](https://yarnpkg.com/en/package/node-file-copier):

```bash
yarn add --dev node-file-copier
```

## Usage

Configure your `package.json`

```json
{
  "nfc": {
    "watch": [
      {
        "dirs": ["src/**", "test/**"],
        "ignore": "!**/*.ts",
        "dest": "dist",
        "keepPath": true
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

node-file-copier is [MIT licensed](./LICENSE).
