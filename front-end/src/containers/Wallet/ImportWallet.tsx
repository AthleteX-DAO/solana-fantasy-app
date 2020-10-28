import React, { FunctionComponent, useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Layout } from '../Layout';

export const ImportWallet: FunctionComponent<{}> = (props) => {
  let [privateKeyInput, setPrivateKeyInput] = useState<string>('');

  return (
    <Layout heading="Import Wallet">
      <Card style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Card.Body>
          <Form.Control
            className="align-items-center"
            onChange={(event) => setPrivateKeyInput(event.target.value)}
            value={privateKeyInput}
            type="text"
            placeholder="Enter your wallet's private key"
            autoComplete="off"
            // isInvalid={}
          />

          <button className="btn mt-4">Import Wallet</button>

          <p className="small mt-3 mb-0">
            <Link to="/wallet/create">But I don't have a wallet.</Link>
          </p>
        </Card.Body>
      </Card>
    </Layout>
  );
};
