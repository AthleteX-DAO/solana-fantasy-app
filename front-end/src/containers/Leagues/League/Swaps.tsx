import React, { FunctionComponent, useEffect, useState, StyleHTMLAttributes } from 'react';
import { Container, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { Layout } from '../../Layout';
import { MatchParams } from './Forwarder';

interface Team {
  name: string;
  selectionStatus: 'Current' | 'Waiting' | 'Done';
  lineups: number[];
}

interface Player {
  name: string;
  avgDraftPosition: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'D/ST';
  choosenByTeam: number;
}

const MAX_SELECT_COUNT = {
  QB: 4,
  RB: 8,
  WR: 8,
  TE: 3,
  K: 3,
  'D/ST': 3,
};

export const Swaps: FunctionComponent<RouteComponentProps<MatchParams>> = (props) => {
  const leagueIndex = +props.match.params.index;

  const [selfTeamIndex, setSelfTeamIndex] = useState<number | null>(null);
  const [otherTeamIndex, setOtherTeamIndex] = useState<number>(0);

  const [teams, setTeams] = useState<Team[] | null>(null);
  const [players, setPlayers] = useState<Player[] | null>(null);

  const [givePlayer, setGivePlayer] = useState<number | null>(null);
  const [wantPlayer, setWantPlayer] = useState<number | null>(null);

  useEffect(() => {
    setSelfTeamIndex(1);

    setTeams([
      { name: 'HellYeah', selectionStatus: 'Done', lineups: [1, 2, 3, 4] },
      { name: 'BlueBull', selectionStatus: 'Current', lineups: [5, 6, 7, 8] },
      { name: 'Mango', selectionStatus: 'Waiting', lineups: [9, 10, 11, 12] },
      { name: 'MegaHard', selectionStatus: 'Waiting', lineups: [13, 14, 15, 16] },
    ]);

    setPlayers([
      { name: 'Ron Weisly1a', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: 0 },
      { name: 'Ron Weisly1b', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: 1 },
      { name: 'Ron Weisly1c', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: 1 },
      { name: 'Ron Weisly1d', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: 0 },
      { name: 'Ron Weisly1e', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: 1 },
      { name: 'Emiway1a', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: 0 },
      { name: 'Emiway1b', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: 0 },
      { name: 'Emiway1c', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: 1 },
      { name: 'Emiway1d', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: 2 },
      { name: 'Emiway1e', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: 1 },
      { name: 'SomePlayer1a', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: 2 },
      { name: 'SomePlayer1b', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: 1 },
      { name: 'SomePlayer1c', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: 2 },
      { name: 'SomePlayer1d', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: 1 },
      { name: 'SomePlayer1e', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: 2 },
      { name: 'SomePlayer2a', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: 1 },
      { name: 'SomePlayer2b', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: 3 },
      { name: 'SomePlayer2c', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: 2 },
      { name: 'SomePlayer2d', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: 3 },
      { name: 'SomePlayer2e', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: 1 },
      { name: 'SomePlayer3a', avgDraftPosition: 'abc', position: 'K', choosenByTeam: 3 },
      { name: 'SomePlayer3b', avgDraftPosition: 'abc', position: 'K', choosenByTeam: 3 },
      { name: 'SomePlayer3c', avgDraftPosition: 'abc', position: 'K', choosenByTeam: 2 },
      { name: 'SomePlayer3d', avgDraftPosition: 'abc', position: 'K', choosenByTeam: 1 },
      { name: 'SomePlayer3e', avgDraftPosition: 'abc', position: 'K', choosenByTeam: 0 },
      { name: 'SomePlayer4a', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: 0 },
      { name: 'SomePlayer4b', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: 2 },
      { name: 'SomePlayer4c', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: 1 },
      { name: 'SomePlayer4d', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: 3 },
      { name: 'SomePlayer4e', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: 1 },
    ]);
  }, []);

  const getPlayersOfTeamId = (teamId: number) => {
    return (
      players
        ?.map((p, i): [Player, number] => [p, i])
        .filter((playerEntry) => playerEntry[0].choosenByTeam === teamId) ?? []
    );
  };

  return (
    <Layout removeTopMargin heading="League">
      <Container>
        <h4 className="align-left mb-4">Swap a player</h4>
        <Row className="pb-3">
          <Col>
            <Card>
              <Card.Body>
                <strong>My Team (Players on the Bench)</strong>
                <br />
                {getPlayersOfTeamId(selfTeamIndex ?? 0).map((playerEntry) => {
                  const [player, index] = playerEntry;
                  return (
                    <>
                      <span
                        className="cursor-pointer"
                        style={{ backgroundColor: givePlayer === index ? '#3333' : undefined }}
                        onClick={setGivePlayer.bind(null, index)}
                      >
                        {player.name} ({player.position})
                      </span>
                      <br />
                    </>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>
          <Col xs={2}>
            <Card.Body>{'<==>'}</Card.Body>
          </Col>
          <Col>
            <Card>
              <Card.Body>
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {teams ? (
                      <>
                        Team#{otherTeamIndex} {teams[otherTeamIndex].name}
                      </>
                    ) : (
                      'Loading...'
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {teams
                      ?.map((t, i): [Team, number] => [t, i])
                      .filter((tEntry) => tEntry[1] !== selfTeamIndex)
                      .map((tEntry) => (
                        <Dropdown.Item
                          onClick={() => {
                            setOtherTeamIndex(tEntry[1]);
                            setWantPlayer(null);
                          }}
                        >
                          Team#{tEntry[1]} {tEntry[0].name}
                        </Dropdown.Item>
                      ))}
                  </Dropdown.Menu>
                </Dropdown>

                {getPlayersOfTeamId(otherTeamIndex).map((playerEntry) => {
                  const [player, index] = playerEntry;
                  return (
                    <>
                      <span
                        className="cursor-pointer"
                        style={{ backgroundColor: wantPlayer === index ? '#3333' : undefined }}
                        onClick={setWantPlayer.bind(null, index)}
                      >
                        {player.name} ({player.position})
                      </span>
                      <br />
                    </>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="pb-3 mt-4">
          <Col>
            {givePlayer !== null && players !== null ? (
              <p>
                Swapping {players[givePlayer].name} for{' '}
                {wantPlayer !== null ? players[wantPlayer].name : '...'}
              </p>
            ) : null}

            <button className="btn m-4" disabled={givePlayer === null || wantPlayer === null}>
              Request
            </button>
            <button className="btn m-4" disabled={givePlayer === null || wantPlayer === null}>
              Accept
            </button>
            <button className="btn m-4" disabled={givePlayer === null || wantPlayer === null}>
              Reject
            </button>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};
