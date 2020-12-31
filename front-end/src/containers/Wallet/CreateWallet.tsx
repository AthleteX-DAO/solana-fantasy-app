import React, { FunctionComponent, useState } from 'react';
import { Alert, Card } from 'react-bootstrap';
import { Link, Redirect } from 'react-router-dom';
import { Layout } from '../Layout';
import { hexlify } from '@ethersproject/bytes';
import { CreateClojuredWallet } from '../../clojured-wallet';
import { AccountModal } from './AccountModal';

export const CreateWallet: FunctionComponent<{}> = (props) => {
  let [display, setDisplay] = useState<{ message: string; variant: string } | null>(null);

  const createWallet = () => {
    try {
      setDisplay({
        message: 'Please wait creating wallet...',
        variant: 'warning',
      });
      const wallet = CreateClojuredWallet();
      window.wallet = wallet;
      window.firstName = 'Sam';
      window.lastName = 'Foster';
      // try {
      //   window.wallet.callback(
      //     'Wallet Created! Do you want to locally cache your wallet?',
      //     (acc) => {
      //       try {
      //         localStorage.setItem('sfs-secret', hexlify(acc.secretKey));
      //       } catch {}
      //     }
      //   );
      // } catch {}
      setDisplay({
        message: 'Account create successfully!',
        variant: 'success',
      });

      Object.entries(window.walletStatusChangeHooks).forEach((entries) => {
        try {
          entries[1]();
        } catch {}
      });

      <Redirect to="" />;
    } catch (error) {
      setDisplay({
        message: `Error: ${error.message}`,
        variant: 'danger',
      });
    }
  };

  const loadModal = () => {
    // <AccountModal show={} />
  };

  return (
    <Layout heading="Create Wallet">
      <Card style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Card.Body>
          {display !== null ? (
            <Alert className="my-2" variant={display.variant}>
              {display.message}
            </Alert>
          ) : null}

          <button onClick={createWallet} className="btn mt-4">
            Create Account
          </button>

          {display?.variant === 'success' ? (
            <span className="small mt-3 mb-0 display-block">
              <Link to="/wallet">Go to my wallet to see private key</Link>
            </span>
          ) : null}
        </Card.Body>
      </Card>
    </Layout>
  );
};
