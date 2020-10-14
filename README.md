<a href="https://github.com/zemse/solana-rust-contract/actions?query=workflow%3Atests"><img alt="tests ci" src="https://github.com/ProtoDao/solana-fantasy-app/workflows/tests/badge.svg"></a>
<a href="https://github.com/solana-labs/rust"><img alt="rustc" src="https://badgen.net/badge/rustc/v1.39.0/red"></a>
<a href="https://www.typescriptlang.org/"><img alt="typescript strict" src="https://badgen.net/badge/typescript/strict/blue?icon=typescript"></a>
<a href="https://github.com/prettier/prettier"><img alt="styled with prettier" src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg"></a>

# Solana Fantasy Contracts

> TODO: add info

## Pre-requisites

```
$ node --version
$ yarn --version
$ docker -v
$ wget --version
$ rustup --version
$ rustc --version
$ cargo --version
```

You can [view](https://github.com/solana-labs/example-helloworld/blob/master/README-installation-notes.md) installation notes.

## Available Scripts

### `yarn build`

Builds all programs in contracts directory and copies their `.so` file to the build dir.

### `yarn test`

Builds if not yet, starts a local solana node and runs tests

### `yarn style:fix`

Runs prettier and fixes any style issues
