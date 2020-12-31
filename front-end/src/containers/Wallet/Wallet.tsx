import React, { FunctionComponent, useEffect, useState } from 'react';
import { Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { Layout } from '../Layout';

export const Wallet: FunctionComponent<{}> = (props) => {
  const [balance, setBalance] = useState<number | null>(null);

  const updateBalance = async () => {
    if (window.wallet) {
      const balance = await window.connection.getBalance(new PublicKey(window.wallet.publicKey));
      setBalance(balance);
    }
  };

  useEffect(() => {
    updateBalance().catch(console.log);
  }, []);

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
      try {
        const privateKey = window.wallet.privateKey;
        setPrivateKeyDisplay(privateKey);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const airDrop100 = async () => {
    if (window.wallet) {
      for (let tokenAmount = 100; tokenAmount > 0; tokenAmount--) {
        const pub = new PublicKey(window.wallet.publicKey);
        await window.connection.requestAirdrop(pub, 1 * 10 ** 9);
        await new Promise((res) => setTimeout(res, 300));
        await updateBalance();
      }
    }
  };

  const hidePrivateKey = () => {
    setPrivateKeyDisplay(null);
  };

  let [airdropSpinner, setAirdropSpinner] = useState<boolean>(false);

  return (
    <Layout heading="Wallet">
      <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card.Body>
          {window.wallet ? (
            <>
              <h4>
                Welcome to <b>Athelete.Equity</b> {window.firstName} {window.lastName}
              </h4>
              <br />
              <p>
                {privateKeyDisplay !== null ? (
                  <>
                    <span className="monospace">
                      <p>Your Private Walley Key:</p>
                      {privateKeyDisplay}
                    </span>{' '}
                    <br />
                    <button onClick={hidePrivateKey} className="btn my-2">
                      Hide
                    </button>
                  </>
                ) : (
                  <button onClick={showPrivateKey} className="btn my-2 center">
                    My Account Details
                  </button>
                )}
              </p>
              <p>
                Balance:{' '}
                {balance == null ? (
                  'Loading...'
                ) : balance <= 0 ? (
                  <>
                    <button
                      className="btn my-2"
                      disabled={airdropSpinner}
                      onClick={async () => {
                        setAirdropSpinner(true);
                        airDrop100();
                        setAirdropSpinner(false);
                      }}
                    >
                      Load my Wallet
                    </button>
                  </>
                ) : (
                  <div>
                    <span className="monospace">{balance / 10 ** 9}</span> tokens{' '}
                  </div>
                )}
              </p>
              <button onClick={processLogout} className="btn my-2">
                Logout
              </button>
            </>
          ) : (
            <>
              <Alert variant="danger">You haved logged out</Alert>
              <p>
                You can login by: <Link to="/wallet/import">Create Account</Link>
              </p>
            </>
          )}
        </Card.Body>
      </Card>
    </Layout>
  );
};
