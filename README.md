<a href="https://github.com/zemse/solana-rust-contract/actions?query=workflow%3Atests"><img alt="tests ci" src="https://github.com/ProtoDao/solana-fantasy-app/workflows/tests/badge.svg"></a>
<a href="https://github.com/solana-labs/rust"><img alt="rustc" src="https://badgen.net/badge/rustc/v1.39.0/red"></a>
<a href="https://www.typescriptlang.org/"><img alt="typescript strict" src="https://badgen.net/badge/typescript/strict/blue?icon=typescript"></a>
<a href="https://github.com/prettier/prettier"><img alt="styled with prettier" src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg"></a>

# Solana Fantasy Sports

## How to Play?

### `Step 1: Create (or Import) a Wallet`

![](https://i.imgur.com/B8An1LP.png)

### `Step 2: Request $SOL Airdrop From Faucet`


![](https://i.imgur.com/K6ZtN5z.png)

### `Step 3: Create a League and set \$SOL entry cost`


![](https://i.imgur.com/GqKZv1d.png)

### `Step 4: Invite your friends to join the League`


![](https://i.imgur.com/zclYIlF.png)

### `Step 5: Draft your players (in a snake-style draft)`


![](https://i.imgur.com/nSssqoD.png)

### `Step 6: Select your weekly lineup of players`


![](https://i.imgur.com/3LqhGGg.png)

### `Step 7: Swap Players on the bench with other teams in the League`


![](https://i.imgur.com/9pxVzI6.png)

### `Step 8: As each week is completed, use the oracle to pass in the scores`

### `Step 9: Use the scoreboard to tabulate scores, and withdraw winnings once the season is over.`


![](https://i.imgur.com/G6JCE25.png)

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

# SDK functions

## Oracle functions

### 1. Initialize Root

Create and initialize a root state account

```js
function initializeRoot(
    // The connection to use
    connection: Connection,
    // Fee payer for transaction
    payer: Account,
    // Account that will control scores
    oracleAuthority: PublicKey,
    // An array of player external ids and their positions
    players: PlayerInit[],
    // A current week of season. 0 - week before season starts
    currentWeek: number,
    // Id of deployed SFS program
    programId: PublicKey
  ):
  // returns SFS object for the newly created root
  Promise<SFS>;
```

### 2. Update player scores

Update player scores for current week

```js
function updatePlayerScores(
    // An oracle's account
    owner: Account,
    // Array of players and their scores
    scores: { playerId: number; playerScore: number }[]
  ): Promise<void>;
```

### 3. Increment week

Increment current week number

```js
function incrementWeek(
    // An oracle's account
    owner: Account
  ): Promise<void>;
```

## User functions

### 1. Create League

Create a new league

```js
function createLeague(
    // User account to pay the fee, will be the first user joined
    owner: Account,
    // A name for the new league
    name: string,
    // A bid amount in lamports
    bid: number | u64,
    // Number of users in league
    usersLimit: number,
    // A name of current user's team
    teamName: string
  ):
  // returns Index of the created league
  Promise<number>;
```

### 2. Join League

Join an existing league

```js
function joinLeague(
    // User account that will join the league and pay the bid
    owner: Account,
    // Index of league to join
    leagueIndex: number,
    // A name of current user's team
    teamName: string
  ): Promise<void>;
```

### 3. Pick player

Pick a player to the user's team on user's turn of draft selection

```js
function pickPlayer(
    // Current user account
    owner: Account,
    // Index of joined league
    leagueIndex: number,
    // A 1-based id of current user in the league
    userId: number,
    // A 1-based id of player to pick
    playerId: number
  ): Promise<void>;
```

### 4. Update lineup

Update lineup for the next and further weeks

```js
function updateLineup(
    // Current user account
    owner: Account,
    // Index of joined league
    leagueIndex: number,
    // A 1-based id of current user in the league
    userId: number,
    // A next week number
    week: number,
    // List of players to be active in next week
    activePlayers: number[]
  ): Promise<void>;
```

### 5. Update lineup

Update lineup for the next and further weeks

```js
function updateLineup(
    // Current user account
    owner: Account,
    // Index of joined league
    leagueIndex: number,
    // A 1-based id of current user in the league
    userId: number,
    // A next week number
    week: number,
    // List of players to be active in next week
    activePlayers: number[]
  ): Promise<void>;
```

### 6. Propose swap

Propose a player swap
Only players not active in the current week can be swapped

```js
function proposeSwap(
    // Proposing user account
    owner: Account,
    // Index of joined league
    leagueIndex: number,
    // A 1-based id of proposing user in the league
    proposingUserId: number,
    // A 1-based id of accepting user in the league
    acceptingUserId: number,
    // A 1-based id of player proposing user gives
    givePlayerId: number,
    // A 1-based id of player accepting user gives
    wantPlayerId: number
  ): Promise<void>;
```

### 7. Accept swap

Accept a player swap proposal

```js
function acceptSwap(
    // Accepting user account
    owner: Account,
    // Index of joined league
    leagueIndex: number,
    // A 1-based id of user that own a wanted player
    acceptingUserId: number,
    // A 1-based id of accepting user in the league
    proposingUserId: number,
    // A 1-based id of player accepting user gives
    wantPlayerId: number,
    // A 1-based id of player proposing user gives
    givePlayerId: number,
  ): Promise<void>;
```

### 8. Reject swap

Reject a player swap proposal

```js
function rejectSwap(
    // Proposing or accepting user account
    owner: Account,
    // Index of joined league
    leagueIndex: number,
    // A 1-based id of user that own a wanted player
    acceptingUserId: number,
    // A 1-based id of accepting user in the league
    proposingUserId: number,
    // A 1-based id of player accepting user gives
    wantPlayerId: number,
    // A 1-based id of player proposing user gives
    givePlayerId: number,
  ): Promise<void>;
```

### 9. Claim reward

Withdraw the reward to the winners
Can be called only at the end of the season

```js
function claimReward(
    // Index of league
    leagueIndex: number,
    // Array of the winners
    winners: PublicKey[],
    // Account to pay the transaction fee
    sender: Account
  ): Promise<void>;
```

## Information functions

### 1. Get root info

Retrieve latest root state information

```js
function getRootInfo()
    // returns Root state
    : Promise<Root>;
```

### 2. Get week scores

Calculates scores for the certain user for the certain week

```js
function getWeekScores(
    // Root state
    root: Root,
    // Index of league
    leagueIndex: number,
    // A 1-based id of user in league
    userId: number,
    // Week to calculate the scores
    week: number
  )
  // score
  : number;
```

### 3. Get user scores

Calculates scores for each league user for all weeks

```js
function getUserScores(
    // Root state
    root: Root,
    // Index of league
    leagueIndex: number
  )
  // return array of users and their scores and states
  : Array<{
      userId: number;
      userState: UserState;
      score: number
    }>;
```

### 4. Get winners

Calculates scores for the certain user for the certain week

```js
function getWinners(
    // Root state
    root: Root,
    // Index of league
    leagueIndex: number
  )
  // return array of winners and their scores and states
  : Array<{
      userId: number;
      userState: UserState;
      score: number
    }>;
```
