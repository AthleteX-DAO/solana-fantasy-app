import React, { FunctionComponent, useState } from 'react';
import { Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Layout } from '../Layout';

export const Wallet: FunctionComponent<{}> = (props) => {
  const [, forceRerender] = useState({});
  const [privateKeyDisplay, setPrivateKeyDisplay] = useState<string | null>(null);

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

  const showPrivateKey = () => {
    if (window.wallet) {
      const privateKey = window.wallet.privateKey;
      setPrivateKeyDisplay(privateKey);
    }
  };

  const hidePrivateKey = () => {
    setPrivateKeyDisplay(null);
  };

  return (
    <Layout heading="Wallet">
      <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card.Body>
          {window.wallet ? (
            <>
              <p>
                Public Key: <span className="monospace">{window.wallet?.publicKey}</span>
              </p>
              <p>
                Private Key:{' '}
                {privateKeyDisplay !== null ? (
                  <>
                    <span className="monospace">{privateKeyDisplay}</span>
                    <button onClick={hidePrivateKey} className="btn my-2">
                      Hide
                    </button>
                  </>
                ) : (
                  <button onClick={showPrivateKey} className="btn my-2">
                    Show
                  </button>
                )}
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
