import React, { FunctionComponent, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Table, CardDeck } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { League, Player, Position, Root, TEAM_PLAYERS_COUNT, UserState } from '../../../sdk/state';
import { Layout } from '../../Layout';
import { MatchParams } from './Forwarder';

// interface Team_ {
//   name: string;
//   selectionStatus: 'Current' | 'Waiting' | 'Done';
// }

type Position_ = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'D/ST';

interface Player_ {
  // name: string;
  // avgDraftPosition: string;
  externalId: number;
  position: Position_;
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

export const DraftSelection: FunctionComponent<RouteComponentProps<MatchParams>> = (props) => {
  const leagueIndex = +props.match.params.index;

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

  const [root, setRoot] = useState<Root | null>(null);
  useEffect(() => {
    (async () => {
      const _root = await window.getCachedRootInfo();
      setRoot(_root);
    })().catch(console.error);
  }, []);

  const [league, setLeague] = useState<League | null>(null);
  useEffect(() => {
    if (root === null) return;

    const _league = root.leagues[leagueIndex];
    // const _currentRound = Math.floor(league.currentPick / league.usersLimit) + 1;

    setLeague(_league);
  }, [root]);

  // let players: Player_[] | null = null;
  const [players, setPlayers] = useState<Player_[] | null>(null);
  useEffect(() => {
    if (root === null) return;

    const _players = root.players.map((p, i) => {
      let position: Position_;
      switch (p.position) {
        case Position.RB:
          position = 'RB';
          break;
        case Position.WR:
          position = 'WR';
          break;
        case Position.QB:
          position = 'QB';
          break;
        case Position.TE:
          position = 'TE';
          break;
        case Position.K:
          position = 'K';
          break;
        case Position.DEF:
          position = 'D/ST';
          break;
        default:
          throw new Error(`Position from API not recognized: ${p.position}`);
      }

      const choosenByTeam = root.leagues[leagueIndex].userStates.findIndex((usr) => {
        return usr.userPlayers.includes(i + 1); // id and index (+ 1) thing
      });

      return {
        externalId: p.externalId,
        position,
        choosenByTeam,
      };
    });
    setPlayers(_players);
  }, [root]);

  const [teams, setTeams] = useState<UserState[] | null>(null);
  useEffect(() => {
    if (root === null) return;

    const league = root.leagues[leagueIndex];

    setTeams(league.userStates.filter((u) => u.isInitialized));
  }, [root]);

  const [selfTeamIndex, setSelfTeamIndex] = useState<number | null>(null);
  useEffect(() => {
    if (root === null) return;

    const index = root.leagues[leagueIndex].userStates.findIndex((usr) => {
      return !!window.wallet && window.wallet.publicKey === usr.pubKey.toBase58();
    });
    if (index !== -1) {
      setSelfTeamIndex(selfTeamIndex);
    }
  }, [root]);

  const [pickOrder, setPickOrder] = useState<number[] | null>(null);
  useEffect(() => {
    (async () => {
      if (root === null) return;

      const league = root.leagues[leagueIndex];
      const reducedPickOrder = root.pickOrder.filter((x) => x <= league.usersLimit);
      const pickOrderForSmallerTeam = Array.from({
        length: TEAM_PLAYERS_COUNT * league.usersLimit,
      }).map((_, leagueCurrentPick) => {
        const round = Math.floor(leagueCurrentPick / league.usersLimit);
        let pickInRound = leagueCurrentPick % league.usersLimit;
        if (round % 2 == 0) {
          pickInRound = league.usersLimit - pickInRound - 1;
        }
        return reducedPickOrder[pickInRound];
      });
      setPickOrder(pickOrderForSmallerTeam);
    })().catch(console.error);
  }, [root]);

  // useEffect(() => {
  //   setSelfTeamIndex(1);

  //   setTeams([
  //     { name: 'HellYeah', selectionStatus: 'Done' },
  //     { name: 'BlueBull', selectionStatus: 'Current' },
  //     { name: 'Mango', selectionStatus: 'Waiting' },
  //     { name: 'MegaHard', selectionStatus: 'Waiting' },
  //   ]);

  //   setPlayers([
  //     { name: 'Ron Weisly1a', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: -1 },
  //     { name: 'Ron Weisly1b', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: -1 },
  //     { name: 'Ron Weisly1c', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: -1 },
  //     { name: 'Ron Weisly1d', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: -1 },
  //     { name: 'Ron Weisly1e', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: -1 },
  //     { name: 'Emiway1a', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
  //     { name: 'Emiway1b', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
  //     { name: 'Emiway1c', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
  //     { name: 'Emiway1d', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
  //     { name: 'Emiway1e', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
  //     { name: 'SomePlayer1a', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
  //     { name: 'SomePlayer1b', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
  //     { name: 'SomePlayer1c', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
  //     { name: 'SomePlayer1d', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
  //     { name: 'SomePlayer1e', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
  //     { name: 'SomePlayer2a', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
  //     { name: 'SomePlayer2b', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
  //     { name: 'SomePlayer2c', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
  //     { name: 'SomePlayer2d', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
  //     { name: 'SomePlayer2e', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
  //     { name: 'SomePlayer3a', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
  //     { name: 'SomePlayer3b', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
  //     { name: 'SomePlayer3c', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
  //     { name: 'SomePlayer3d', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
  //     { name: 'SomePlayer3e', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
  //     { name: 'SomePlayer4a', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
  //     { name: 'SomePlayer4b', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
  //     { name: 'SomePlayer4c', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
  //     { name: 'SomePlayer4d', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
  //     { name: 'SomePlayer4e', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
  //   ]);
  // }, []);

  return (
    <Layout removeTopMargin heading="Draft Selection">
      <Container>
        <Row className="pb-3">
          <Col>
            <Card>
              <Card.Body>
                <br />
                <strong>Round</strong>
                <br />
                {Math.floor((league?.currentPick ?? 0) / (league?.usersLimit ?? 1)) + 1}/
                {TEAM_PLAYERS_COUNT}
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
                    <strong>Team #{index + 1}</strong>
                    <br />
                    Team Name {team.teamName}
                    <br />
                    <br />
                    {pickOrder !== null && league !== null
                      ? (() => {
                          const nextPicks = pickOrder.slice(league.currentPick);
                          console.log({ nextPicks, pickOrder });

                          const n = nextPicks.findIndex((u) => u === index + 1);
                          switch (n) {
                            case 0:
                              return 'Currently picking...';
                            case -1:
                              return 'Done';
                            default:
                              return `Waiting for ${n} picks...`;
                          }
                        })()
                      : 'null'}
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
                  <th>External ID</th>
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
                        backgroundColor:
                          player.choosenByTeam === selfTeamIndex ? '#0002' : undefined,
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
                      <td>{player.externalId}</td>
                      <td>-</td>
                      <td>-</td>
                      <td>{player.position}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};
