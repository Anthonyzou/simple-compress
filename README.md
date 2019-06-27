<h2 align="center">Simple file copying delcarations</h2>

**👩🏻‍💻 Light **: Smaller than gulp

** Compression **: Can be configured for gzip or Brotli (_node 11+_)

** Watching **: Can be configured to watch directories

## Getting Started

Install node-file-copier using [`yarn`](https://yarnpkg.com/en/package/node-file-copier):

```bash
yarn add --dev node-file-copier
```

Configure your `package.json`

```
  "nfc": {
    "watch": [
      {
        "dirs": [
          "src/**",
          "test/**"
        ],
        "ignore": "!**/*.ts",
        "dest": "dist",
        "keepPath": true
      }
    ],
    "copy": [
      {
        "dirs": [
          "node_modules/muicss/dist/email/*.css"
        ],
        "gz": true,
        "br": true,
        "dest": "dist/src/services/templates",
        "keepPath": false
      }
    ]
  },
```

## License

node-file-copier is [MIT licensed](./LICENSE).
