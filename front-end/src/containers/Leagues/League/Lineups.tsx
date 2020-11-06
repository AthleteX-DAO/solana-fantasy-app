import React, { FunctionComponent, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Table, CardDeck, Alert } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { League, Player, Position, Root, UserState } from '../../../sdk/state';
import { publicKey } from '../../../sdk/util/layout';
import { Layout } from '../../Layout';
import { MatchParams } from './Forwarder';

interface Player_ {
  externalId: number;
  position: Position_;
  choosenByTeamIndex: number;
}

type Position_ = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'D/ST';

export const Lineups: FunctionComponent<RouteComponentProps<MatchParams>> = (props) => {
  const leagueIndex = +props.match.params.index;

  const [root, setRoot] = useState<Root | null>(null);
  const refreshRoot = async (forceUpdate?: boolean) => {
    const _root = await window.getCachedRootInfo(forceUpdate);
    setRoot(_root);
  };
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshRoot(false).catch(console.error);
    }, 3000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const [league, setLeague] = useState<League | null>(null);
  useEffect(() => {
    if (root === null) return;

    const _league = root.leagues[leagueIndex];

    setLeague(_league);
  }, [root]);

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

      const choosenByTeamIndex = root.leagues[leagueIndex].userStates.findIndex((usr) => {
        return usr.userPlayers.includes(i + 1); // id and index (+ 1) thing
      });

      return {
        externalId: p.externalId,
        position,
        choosenByTeamIndex,
      };
    });
    setPlayers(_players);
  }, [root]);

  const [selfTeamIndex, setSelfTeamIndex] = useState<number | null>(null);
  useEffect(() => {
    if (league === null) return;

    const index = league.userStates.findIndex((usr) => {
      return !!window.wallet && window.wallet.publicKey === usr.pubKey.toBase58();
    });

    if (index !== -1) {
      setSelfTeamIndex(index);
    }
  }, [league]);

  const [playersResp, setPlayersResp] = useState<
    {
      PlayerID: number;
      Name: string;
      Position: string;
      AverageDraftPosition: number;
    }[]
  >();
  useEffect(() => {
    (async () => {
      const _playersResp = await window.getCachedPlayers();
      setPlayersResp(_playersResp);
    })().catch(console.error);
  }, []);

  const getNameByPlayerIndex = (playerIndex: number | undefined) => {
    return players !== null && playerIndex !== undefined && playersResp !== undefined
      ? playersResp.find((p) => p.PlayerID === players[playerIndex].externalId)?.Name ?? 'No Name'
      : 'Loading...';
  };

  const [teams, setTeams] = useState<UserState[] | null>(null);
  useEffect(() => {
    if (league === null) return;
    setTeams(league.userStates.filter((u) => u.isInitialized));
  }, [league]);

  const [newLineup, setNewLineup] = useState<number[] | null>(null);
  useEffect(() => {
    if (root === null || league === null || selfTeamIndex === null) return;
    if (newLineup === null) {
      const lineupsNextWeek = league.userStates[selfTeamIndex].lineups[root.currentWeek + 1];
      console.log('setting iniitla lineups', lineupsNextWeek);

      console.log({ lineupsNextWeek });
      setNewLineup(lineupsNextWeek);
    }
  }, [root, league, selfTeamIndex]);

  const isLineupChanged = (() => {
    if (root === null || league === null || selfTeamIndex === null) return null;
    const lineupInContract = [
      ...league.userStates[selfTeamIndex].lineups[root.currentWeek + 1],
    ].sort();
    const lineupUI = [...(newLineup ?? [])].sort();
    if (lineupUI.length !== lineupInContract.length) return false;
    for (let i = 0; i < lineupUI.length; i++) {
      if (lineupUI[i] !== lineupInContract[i]) return true;
    }
    return false;
  })();

  const [spinner, setSpinner] = useState<boolean>(false);
  const updateLineupTx = async () => {
    if (!window.wallet) {
      throw new Error('Wallet not loaded');
    }
    const sdk = await window.sfsSDK();

    if (root === null) {
      throw new Error('root is null');
    }
    if (newLineup === null) {
      throw new Error('newLineup is null');
    }
    if (selfTeamIndex === null) {
      throw new Error('selfTeamIndex is null');
    }
    const resp = await window.wallet.callback('Sign on Update Lineup transaction?', async (acc) => {
      console.log({ newLineup }, root.currentWeek + 1);

      await sdk.updateLineup(acc, leagueIndex, selfTeamIndex + 1, root.currentWeek + 2, newLineup);
    });
    console.log({ resp });
  };

  return (
    <Layout removeTopMargin heading="Lineups">
      <Container>
        <h4 className="align-left mb-4">
          Upcomming Week's Lineup Selection (Week{' '}
          {root !== null ? root.currentWeek + 1 : 'Loading...'})
        </h4>
        {newLineup === null ? (
          <p>Loading existing lineups set for the next week...</p>
        ) : (
          <Row className="pb-3">
            <Col>
              <Card>
                <Card.Body>
                  <strong>Bench List</strong>
                  {newLineup.length !== 0 ? (
                    <p className="small mb-0">Click on player to include</p>
                  ) : null}
                  <br />
                  {players
                    ?.map((p, i): [Player_, number] => [p, i])
                    .filter(
                      (playerEntry) =>
                        playerEntry[0].choosenByTeamIndex === selfTeamIndex &&
                        !newLineup.includes(playerEntry[1] + 1)
                    )
                    .map((playerEntry) => {
                      const [player, index] = playerEntry;
                      return (
                        <>
                          <span
                            className="cursor-pointer"
                            onClick={() => {
                              if (newLineup.length < 8) {
                                setNewLineup((prevNewLineup) => {
                                  const _newLineup = [...(prevNewLineup ?? [])];
                                  _newLineup.push(index + 1);
                                  return _newLineup;
                                });
                              } else {
                                window.alert('Max 8 players can be selected in lineup');
                              }
                            }}
                          >
                            {playersResp?.find((p) => p.PlayerID === player.externalId)?.Name} (
                            {player.position})
                          </span>
                          <br />
                        </>
                      );
                    })}
                </Card.Body>
              </Card>
            </Col>
            <Col xs={2}>
              <Card.Body>{'==>'}</Card.Body>
            </Col>
            <Col>
              <Card>
                <Card.Body>
                  <strong>Weekly Lineup (8 Players)</strong>
                  {newLineup.length !== 0 ? (
                    <p className="small mb-0">Click on player to remove</p>
                  ) : null}
                  <br />
                  {newLineup.map((playerId, index) => (
                    <span
                      className="cursor-pointer"
                      onClick={() => {
                        setNewLineup((prevNewLineup) => {
                          const _newLineup = (prevNewLineup ?? []).slice();
                          _newLineup.splice(index, 1);
                          return _newLineup;
                        });
                      }}
                    >
                      {players ? (
                        <>
                          {getNameByPlayerIndex(playerId - 1)} ({players[playerId - 1].position})
                        </>
                      ) : (
                        playerId
                      )}
                      <br />
                    </span>
                  ))}

                  {newLineup.length === 8 ? (
                    isLineupChanged ? (
                      <button
                        className="btn mt-4"
                        disabled={!isLineupChanged}
                        onClick={() => {
                          setSpinner(true);
                          updateLineupTx()
                            .then(() => {
                              setSpinner(false);
                              setTimeout(() => {
                                refreshRoot(true).catch(console.error);
                                alert('Tx sent!');
                              }, 1000);
                            })
                            .catch((err) => {
                              alert('Error:' + err?.message ?? err);
                              console.log(err);
                              setSpinner(false);
                            });
                        }}
                      >
                        Submit Lineup Selection
                      </button>
                    ) : (
                      <Alert variant="success" className="mb-0 mt-3">
                        This lineup is set in the contract for the upcoming week. To change, remove
                        a player and add another.
                      </Alert>
                    )
                  ) : null}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <h4 className="align-left my-4">Current Lineup (Week {root?.currentWeek})</h4>

        {root !== null && league !== null && root.currentWeek === league.startWeek ? (
          <p>
            This league started this week so you have these default lineups. You can choose for next
            week using above.
          </p>
        ) : null}
        <Row className="pb-3">
          <Col>
            <div className="team-card-scroll-deck">
              {teams?.map((team, index) => (
                <Card key={index}>
                  <Card.Body>
                    <strong>Team #{index}</strong>
                    <br />
                    {team.teamName}
                    <br />
                    <br />
                    <u>Lineups</u>
                    <br />
                    {root &&
                      team.lineups[root.currentWeek].map((playerId) => (
                        <>
                          {players ? (
                            <>
                              {getNameByPlayerIndex(playerId - 1)} ({players[playerId].position})
                            </>
                          ) : (
                            playerId
                          )}
                          <br />
                        </>
                      ))}
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};
