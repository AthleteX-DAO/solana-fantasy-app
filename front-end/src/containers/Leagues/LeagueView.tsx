import React, { FunctionComponent, useState } from 'react';
import { Card, Form, InputGroup } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { Layout } from '../Layout';

interface MatchParams {
  index: string;
}

export const LeagueView: FunctionComponent<RouteComponentProps<MatchParams>> = (props) => {
  const [teamNameInput, setTeamNameInput] = useState<string>('');
  const [feesInput, setFeesInput] = useState<string>('50');

  return (
    <Layout heading="Create a Team">
      <p>This is a League with index {props.match.params.index}</p>
      <Card style={{ maxWidth: '400px', margin: '0 auto' }}>
        <p className="mt-2 mb-0">Join the league by creating a team</p>
        <Card.Body>
          <Form.Control
            className="align-items-center"
            onChange={(event) => setTeamNameInput(event.target.value)}
            value={teamNameInput}
            type="text"
            placeholder="Enter Team Name"
            autoComplete="off"
            // isInvalid={}
          />

          <InputGroup className="my-4">
            <Form.Control
              className="align-items-center"
              onChange={(event) => setFeesInput(event.target.value)}
              value={feesInput}
              type="text"
              placeholder="Enter fees"
              autoComplete="off"
              isInvalid={isNaN(+feesInput)}
            />
            <InputGroup.Append>
              <InputGroup.Text id="basic-addon2">SOL</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>

          <button className="btn mt-4">Join by paying {feesInput} SOL</button>
        </Card.Body>
      </Card>
    </Layout>
  );
};
