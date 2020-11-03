import React, { FunctionComponent, useEffect, useState } from 'react';
import { Card, Form, InputGroup } from 'react-bootstrap';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { MatchParams } from './Forwarder';
import { Layout } from '../../Layout';

export const JoinLeague: FunctionComponent<RouteComponentProps<MatchParams>> = (props) => {
  const leagueIndex = +props.match.params.index;
  const history = useHistory();

  const [spinner, setSpinner] = useState<boolean>(false);
  const [teamNameInput, setTeamNameInput] = useState<string>('');
  const [feesInput, setFeesInput] = useState<string>('50');
  const [leagueName, setLeagueName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const root = await window.getCachedRootInfo();
      setFeesInput(String(root.leagues[leagueIndex].bid.toNumber() / 10 ** 9));
      setLeagueName(root.leagues[leagueIndex].name);
    })().catch(console.error);
  }, []);

  const joinLeague = async () => {
    if (!window.wallet) {
      throw new Error('Wallet not loaded');
    }
    const sdk = await window.sfsSDK();

    const resp = await window.wallet.callback('Sign on Create League transaction?', async (acc) => {
      await sdk.joinLeague(acc, leagueIndex);
    });
    console.log({ resp });
  };

  return (
    <Layout removeTopMargin heading="Join League">
      <Card style={{ maxWidth: '400px', margin: '0 auto' }}>
        <p className="mt-2 mb-0">
          Join the{' '}
          <strong>{leagueName ? <>{leagueName} league</> : <>leage {leagueIndex}</>}</strong> by
          creating a team
        </p>
        <Card.Body>
          <Form.Control
            disabled={spinner}
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
              disabled={spinner}
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

          <button
            disabled={spinner}
            onClick={() => {
              setSpinner(true);
              joinLeague()
                .then(() => {
                  setSpinner(false);
                  history.push(`/leagues/${leagueIndex}/draft-selection`);
                })
                .catch((err) => {
                  alert('Error:' + err?.message ?? err);
                  console.log(err);
                  setSpinner(false);
                });
            }}
            className="btn mt-4"
          >
            {spinner ? 'Joining...' : <>Join by paying {feesInput} SOL</>}
          </button>
        </Card.Body>
      </Card>
    </Layout>
  );
};
