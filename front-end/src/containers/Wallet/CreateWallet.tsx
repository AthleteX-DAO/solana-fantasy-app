import React, { FunctionComponent, useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Layout } from '../Layout';

export const CreateWallet: FunctionComponent<{}> = (props) => {
  // let [privateKeyInput, setPrivateKeyInput] = useState<string>('');

  return (
    <Layout heading="Create Wallet">
      <Card style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Card.Body>
          {/* <Form.Control
            className="align-items-center"
            onChange={(event) => setPrivateKeyInput(event.target.value)}
            value={privateKeyInput}
            type="text"
            placeholder="Enter your private key"
            autoComplete="off"
            // isInvalid={}
          /> */}

          <button className="btn mt-4">Create Wallet</button>

          <span className="small mt-3 mb-0 display-block">
            {/* <Link to="/wallet/import">But I already have a wallet.</Link> */}
          </span>
        </Card.Body>
      </Card>
    </Layout>
  );
};
