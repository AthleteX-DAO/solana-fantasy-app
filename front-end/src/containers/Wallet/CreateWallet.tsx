import React, { FunctionComponent, useState } from 'react';
import { Alert, Card, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Layout } from '../Layout';

import { CreateClojuredWallet } from '../../clojured-wallet';

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
      setDisplay({
        message: 'Wallet create successfully!',
        variant: 'success',
      });

      Object.entries(window.walletStatusChangeHooks).forEach((entries) => {
        try {
          entries[1]();
        } catch {}
      });
    } catch (error) {
      setDisplay({
        message: `Error: ${error.message}`,
        variant: 'danger',
      });
    }
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
            Create Wallet
          </button>

          {display?.variant === 'success' ? (
            <span className="small mt-3 mb-0 display-block">
              <Link to="/wallet">Go to my wallet</Link>
            </span>
          ) : null}
        </Card.Body>
      </Card>
    </Layout>
  );
};
