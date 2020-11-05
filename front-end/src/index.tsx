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
import { Root } from './sdk/state';

window.Buffer = Buffer;
window.sfsProgramId = new PublicKey('FGW83vLemzkrtYvWgq5m1jcfHZEEa33UkRzAGkavmydg');
window.sfsRoot = new PublicKey('FkMYzn154qxDBgCsGAgxh2iA58tZtef57FMHXg1S8RB5');
window.connection = new Connection('https://devnet.solana.com', 'recent');
const bankPromise = PublicKey.findProgramAddress([Buffer.from([0])], window.sfsProgramId);
window.sfsSDK = async () =>
  new SFS(window.connection, window.sfsRoot, window.sfsProgramId, (await bankPromise)[0]);

let root_cache: { root: Root; expiry: number } | null = null;
let root_new_fetching_promise: Promise<Root> | null = null;
window.getCachedRootInfo = async (forceUpdate?: boolean): Promise<Root> => {
  const sfs = await window.sfsSDK();
  if (root_cache === null || forceUpdate || Date.now() > root_cache.expiry) {
    if (root_new_fetching_promise === null) {
      root_new_fetching_promise = sfs.getRootInfo().then((root) => {
        root_cache = { root, expiry: Date.now() + 10000 };
        root_new_fetching_promise = null;
        return root;
      });
    }

    if (root_cache === null || forceUpdate) {
      const prom = await root_new_fetching_promise;
      // @ts-ignore When root_new_fetching_promise is resolved, it sets root_cache
      return root_cache.root;
    }
  }

  return root_cache.root;
};

if (process.env.NODE_ENV !== 'production') {
  window.wallet = CreateClojuredWallet(
    '0xebda988ca9dfd8f5094ffc87c5fdf13e72413af1a92bc73d67133ce5f37cf4af3c09fd5042247925005dd7dd5f2d10d0a826d907e38336e4984b34588a9af74b'
  );
}
window.getCachedRootInfo();

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
