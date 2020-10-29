import React, { FunctionComponent, useState } from 'react';
import { Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Layout } from '../Layout';

export const Wallet: FunctionComponent<{}> = (props) => {
  const [, forceRerender] = useState({});

  const walletChangeHook = () => {
    forceRerender({});
  };

  if (!window.walletStatusChangeHooks) {
    window.walletStatusChangeHooks = { navbar: () => {}, walletPage: walletChangeHook };
  } else {
    window.walletStatusChangeHooks.walletPage = walletChangeHook;
  }

  const processLogout = () => {
    delete window.wallet;
    Object.entries(window.walletStatusChangeHooks).forEach((entries) => {
      try {
        entries[1]();
      } catch {}
    });
  };

  return (
    <Layout heading="Wallet">
      <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card.Body>
          {window.wallet ? (
            <>
              <p>
                Address: <span className="monospace">{window.wallet?.publicKey}</span>
              </p>
              <button onClick={processLogout} className="btn my-2">
                Logout
              </button>
            </>
          ) : (
            <>
              <Alert variant="danger">Wallet is not loaded</Alert>
              <p>
                You can load your wallet from <Link to="/wallet/import">Import Wallet</Link>
              </p>
            </>
          )}
        </Card.Body>
      </Card>
    </Layout>
  );
};
