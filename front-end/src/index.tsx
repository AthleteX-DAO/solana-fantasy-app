import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './global';
import './clojured-wallet';
import { Connection, PublicKey } from '@solana/web3.js';
import { SFS } from './sdk/sfs';
import { CreateClojuredWallet } from './clojured-wallet';
import { Buffer } from 'buffer';

window.Buffer = Buffer;
window.sfsProgramId = new PublicKey('yX8ip4PTAZs261A7s5ZaZjzMYbPjEeRjWYArDA7sZjf');
window.sfsRoot = new PublicKey('6P4JL1Hc9d1pKnWHeV99Bq3BZRSLudCKM9fi1cCnp3sj');
window.connection = new Connection('https://devnet.solana.com', 'recent');
const bankPromise = PublicKey.findProgramAddress([Buffer.from([0])], window.sfsProgramId);
window.sfsSDK = async () =>
  new SFS(window.connection, window.sfsRoot, window.sfsProgramId, (await bankPromise)[0]);

if (process.env.NODE_ENV !== 'production') {
  window.wallet = CreateClojuredWallet(
    '0xebda988ca9dfd8f5094ffc87c5fdf13e72413af1a92bc73d67133ce5f37cf4af3c09fd5042247925005dd7dd5f2d10d0a826d907e38336e4984b34588a9af74b'
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
