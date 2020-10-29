import React, { FunctionComponent, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Table, CardDeck } from 'react-bootstrap';
import { Layout } from '../../../Layout';

interface Team {
  name: string;
  selectionStatus: 'Current' | 'Waiting' | 'Done';
}

interface Players {
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

export const DraftSelection: FunctionComponent<{
  leagueIndex: number;
  setLeagueIndexScreen: Function;
}> = () => {
  const [selfTeamIndex, setSelfTeamIndex] = useState<number | null>(null);

  const [teams, setTeams] = useState<Team[] | null>(null);
  const [players, setPlayers] = useState<Players[] | null>(null);

  const [selectCount, setSelectCount] = useState<{
    QB: number;
    RB: number;
    WR: number;
    TE: number;
    K: number;
    'D/ST': number;
  }>({
    QB: 0,
    RB: 0,
    WR: 0,
    TE: 0,
    K: 0,
    'D/ST': 0,
  });

  useEffect(() => {
    setSelfTeamIndex(1);

    setTeams([
      { name: 'HellYeah', selectionStatus: 'Done' },
      { name: 'BlueBull', selectionStatus: 'Current' },
      { name: 'Mango', selectionStatus: 'Waiting' },
      { name: 'MegaHard', selectionStatus: 'Waiting' },
    ]);

    setPlayers([
      { name: 'Ron Weisly1a', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: -1 },
      { name: 'Ron Weisly1b', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: -1 },
      { name: 'Ron Weisly1c', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: -1 },
      { name: 'Ron Weisly1d', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: -1 },
      { name: 'Ron Weisly1e', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: -1 },
      { name: 'Emiway1a', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
      { name: 'Emiway1b', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
      { name: 'Emiway1c', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
      { name: 'Emiway1d', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
      { name: 'Emiway1e', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
      { name: 'SomePlayer1a', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
      { name: 'SomePlayer1b', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
      { name: 'SomePlayer1c', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
      { name: 'SomePlayer1d', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
      { name: 'SomePlayer1e', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
      { name: 'SomePlayer2a', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
      { name: 'SomePlayer2b', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
      { name: 'SomePlayer2c', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
      { name: 'SomePlayer2d', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
      { name: 'SomePlayer2e', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
      { name: 'SomePlayer3a', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
      { name: 'SomePlayer3b', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
      { name: 'SomePlayer3c', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
      { name: 'SomePlayer3d', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
      { name: 'SomePlayer3e', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
      { name: 'SomePlayer4a', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
      { name: 'SomePlayer4b', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
      { name: 'SomePlayer4c', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
      { name: 'SomePlayer4d', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
      { name: 'SomePlayer4e', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
    ]);
  }, []);

  return (
    <Container>
      <Row className="pb-3">
        <Col>
          <Card>
            <Card.Body>
              <br />
              <strong>Round</strong>
              <br />
              1/16
              <br />
              <br />
            </Card.Body>
          </Card>
        </Col>
        <Col xs={9}>
          <div className="team-card-scroll-deck">
            {teams?.map((team, index) => (
              <Card key={index}>
                <Card.Body>
                  <strong>Team #{index}</strong>
                  <br />
                  Team Name {team.name}
                  <br />
                  <br />
                  {team.selectionStatus}
                </Card.Body>
              </Card>
            ))}
          </div>
        </Col>
      </Row>
      <Row className="pt-3">
        <Col>
          <Card>
            <Card.Body>
              <strong>Roster Limits</strong>
              <br />
              {Object.keys(MAX_SELECT_COUNT).map((key) => {
                const _key = (key as unknown) as 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'D/ST';
                return (
                  <>
                    {_key}: {selectCount[_key]}/{MAX_SELECT_COUNT[_key]}
                    <br />
                  </>
                );
              })}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={9}>
          <Table responsive>
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Average Draft Position</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              {players?.map((player, index) => {
                return (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: player.choosenByTeam === selfTeamIndex ? '#0002' : undefined,
                    }}
                  >
                    <td>
                      <span
                        className="cursor-pointer"
                        onClick={() => {
                          switch (player.choosenByTeam) {
                            case -1:
                              if (
                                selectCount[player.position] >= MAX_SELECT_COUNT[player.position]
                              ) {
                                window.alert('Roster limit is being exceeded');
                                return;
                              }
                              setSelectCount((oldValue) => {
                                const newValue = { ...oldValue };
                                newValue[player.position] += 1;
                                return newValue;
                              });
                              setPlayers((oldValue) => {
                                if (oldValue !== null && selfTeamIndex !== null) {
                                  const newValue = [...oldValue];
                                  newValue[index] = { ...newValue[index] };
                                  newValue[index].choosenByTeam = selfTeamIndex;
                                  return newValue;
                                } else {
                                  return oldValue;
                                }
                              });
                              break;
                            case selfTeamIndex:
                              setSelectCount((oldValue) => {
                                const newValue = { ...oldValue };
                                newValue[player.position] -= 1;
                                return newValue;
                              });
                              setPlayers((oldValue) => {
                                if (oldValue !== null && selfTeamIndex !== null) {
                                  const newValue = [...oldValue];
                                  newValue[index] = { ...newValue[index] };
                                  newValue[index].choosenByTeam = -1;
                                  return newValue;
                                } else {
                                  return oldValue;
                                }
                              });
                              break;
                            default:
                              window.alert('The player is already selected');
                              break;
                          }
                        }}
                      >
                        {(() => {
                          switch (player.choosenByTeam) {
                            case -1:
                              return <>(+)</>;
                            case selfTeamIndex:
                              return <>(-)</>;
                            default:
                              return <>( )</>;
                          }
                        })()}
                      </span>
                    </td>
                    <td>{player.name}</td>
                    <td>{player.avgDraftPosition}</td>
                    <td>{player.position}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};
