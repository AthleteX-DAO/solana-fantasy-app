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

## Fantasy Oracle

These contain scripts that used to setup and manage the Solana Fantasy Sports smart contract on the Solana blockchain.

The module at `fantasy-oracle/scripts/commons.ts` contains the owner private key to be used, url of devnet and addresses involved for the smart contract. This module is imported in following scripts:

### 1. Deploy script

```sh
ts-node fantasy-oracle/scripts/deploy-contract.ts
```

This script simply deploys compiled solana smart contract to the devnet. After that it also initializes the state of the contract by adding the players. The addresses of deployed contract and root account in base58 would be printed to the console and this needs to be updated in the `commons.ts` file for other scripts to point at the right contract.

### 2. Increment week

```sh
ts-node fantasy-oracle/scripts/increment-week.ts
```

This script is used to increment the week in the smart contract.

### 3. Update player scores

```sh
ts-node fantasy-oracle/scripts/update-player-scores.ts
```

Whenever a week ends, after using the previous increment week script, this script is used to update the scores of the players to the smart contract for the previous week.
