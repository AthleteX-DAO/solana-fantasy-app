import React, { FunctionComponent, useState } from 'react';
import { Card, Form, InputGroup } from 'react-bootstrap';

import { Layout } from '../../../Layout';

export const JoinLeague: FunctionComponent<{
  leagueIndex: number;
  setLeagueIndexScreen: Function;
}> = (props) => {
  const [teamNameInput, setTeamNameInput] = useState<string>('');
  const [feesInput, setFeesInput] = useState<string>('50');

  return (
    <Card style={{ maxWidth: '400px', margin: '0 auto' }}>
      <p className="mt-2 mb-0">Join the league {props.leagueIndex} by creating a team</p>
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

        <button onClick={() => props.setLeagueIndexScreen(1)} className="btn mt-4">
          Join by paying {feesInput} SOL
        </button>
      </Card.Body>
    </Card>
  );
};
