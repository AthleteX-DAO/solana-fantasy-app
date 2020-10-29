import React, { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Layout } from '../Layout';

export function CreateLeague() {
  const history = useHistory();

  const [leagueNameInput, setLeagueNameInput] = useState<string>('');
  const [leagueSizeInput, setLeagueSizeInput] = useState<string>('');
  const [leagueEntryCostInput, setLeagueEntryCostInput] = useState<string>('');

  return (
    <Layout heading="Create a League">
      <Card style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Card.Body>
          <Form.Control
            className="align-items-center"
            onChange={(event) => setLeagueNameInput(event.target.value)}
            value={leagueNameInput}
            type="text"
            placeholder="Enter League Name"
            autoComplete="off"
            // isInvalid={}
          />

          <Form.Control
            className="align-items-center my-4"
            onChange={(event) => setLeagueSizeInput(event.target.value)}
            value={leagueSizeInput}
            type="text"
            placeholder="Enter League Size"
            autoComplete="off"
            // isInvalid={}
          />

          <Form.Control
            className="align-items-center"
            onChange={(event) => setLeagueEntryCostInput(event.target.value)}
            value={leagueEntryCostInput}
            type="text"
            placeholder="Enter League Entry Cost"
            autoComplete="off"
            // isInvalid={}
          />

          {/* <Button>Submit</Button> */}
          <button className="btn mt-4" onClick={() => history.push(`/leagues`)}>
            Create
          </button>
        </Card.Body>
      </Card>
    </Layout>
  );
}
