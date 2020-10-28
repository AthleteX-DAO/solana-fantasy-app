import React, { FunctionComponent } from 'react';
import { Card, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Layout } from '../Layout';

export const Wallet: FunctionComponent<{}> = (props) => {
  return (
    <Layout heading="Wallet">
      <Card style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Card.Body>
          Address: <span className="monospace">0x1234</span>
        </Card.Body>
      </Card>
    </Layout>
  );
};
