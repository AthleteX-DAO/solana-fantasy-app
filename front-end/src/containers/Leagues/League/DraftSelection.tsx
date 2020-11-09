import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  FormControl,
  InputGroup,
  Alert,
  Dropdown,
  DropdownButton,
} from 'react-bootstrap';
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
  choosenByTeamIndex: number;
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

  const [root, setRoot] = useState<Root | null>(null);

  const refreshRoot = async (forceUpdate?: boolean) => {
    const _root = await window.getCachedRootInfo(forceUpdate);
    setRoot(_root);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshRoot(false).catch(console.error);
    }, 3000);
    refreshRoot(false).catch(console.error);
    return () => {
      clearInterval(intervalId);
    };
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

    const _players = root.players
      .filter((p) => p.isInitialized)
      .map((p, i) => {
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
      setSelfTeamIndex(index);
    }
  }, [root]);

  const getSelectCount = (_players: Player_[]) => {
    const choosenP = _players.filter((p) => p.choosenByTeamIndex === selfTeamIndex);
    const selectCount = {
      QB: 0,
      RB: 0,
      WR: 0,
      TE: 0,
      K: 0,
      'D/ST': 0,
    };
    for (const p of choosenP) {
      selectCount[p.position] += 1;
    }
    return selectCount;
  };

  const doesRosterLimitHold = (_players: Player_[], newPlayerPosition: Position_) => {
    const selectCount = getSelectCount(_players);
    selectCount[newPlayerPosition] += 1;
    for (const position of ['QB', 'RB', 'WR', 'TE', 'K', 'D/ST']) {
      // @ts-ignore
      if (selectCount[position] > MAX_SELECT_COUNT[position]) {
        return false;
      }
    }
    return true;
  };

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

  const [spinner, setSpinner] = useState<boolean>(false);
  const pickPlayerTx = async (playerId: number) => {
    if (!window.wallet) {
      throw new Error('Wallet not loaded');
    }
    const sdk = await window.sfsSDK();

    if (selfTeamIndex === null) {
      throw new Error('selfTeamIndex is null');
    }
    const resp = await window.wallet.callback('Sign on Pick Player transaction?', async (acc) => {
      await sdk.pickPlayer(acc, leagueIndex, selfTeamIndex + 1, playerId);
    });
    console.log({ resp });
  };

  const [searchStr, setSearchStr] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');

  return (
    <Layout removeTopMargin heading="Draft Selection">
      {!window.wallet ? (
        <Alert variant="danger">
          Wallet is not loaded. If you just refreshed the page, then your wallet was flushed from
          memory when you refreshed the page. When you import your wallet, you can choose to cache
          it locally to prevent this behaviour.
        </Alert>
      ) : (
        <Container>
          <Row className="pb-3">
            <Col>
              <Card>
                <Card.Body>
                  <br />
                  <strong>Round</strong>
                  <br />
                  {teams !== null && league !== null ? (
                    league.currentPick / teams.length < TEAM_PLAYERS_COUNT ? (
                      <>
                        {Math.floor(league.currentPick / teams.length) + 1}/{TEAM_PLAYERS_COUNT}{' '}
                      </>
                    ) : (
                      <>All {TEAM_PLAYERS_COUNT} rounds finished! You may proceed to lineups.</>
                    )
                  ) : (
                    <>Loading...</>
                  )}
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
              <Row>
                <Col xs={12} className="pb-3">
                  {/* <Card className="mb-3">
                    <Card.Body> */}
                  {pickOrder !== null && league !== null && selfTeamIndex !== null ? (
                    selfTeamIndex + 1 === pickOrder[league.currentPick] ? (
                      <Alert variant="success" className="mb-0">
                        It's your turn!!
                      </Alert>
                    ) : (
                      <Alert variant="warning" className="mb-0">{`It's ${
                        pickOrder[league.currentPick] !== undefined &&
                        teams !== null &&
                        teams[pickOrder[league.currentPick]] !== undefined
                          ? `Team ${teams[pickOrder[league.currentPick] - 1].teamName} (#${
                              pickOrder[league.currentPick]
                            })`
                          : pickOrder[league.currentPick] !== undefined
                          ? `Team #${pickOrder[league.currentPick]}`
                          : `nobody`
                      }'s turn.`}</Alert>
                    )
                  ) : (
                    'Finding whose turn it is...'
                  )}
                  {/* </Card.Body>
                  </Card> */}
                </Col>

                <Col xs={12}>
                  <Card>
                    <Card.Body>
                      <strong>Roster Limits</strong>
                      <br />
                      {Object.keys(MAX_SELECT_COUNT).map((key) => {
                        const _key = (key as unknown) as 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'D/ST';
                        return (
                          <>
                            {_key}: {players ? getSelectCount(players)[_key] : 'Loading..'}/
                            {MAX_SELECT_COUNT[_key]}
                            <br />
                          </>
                        );
                      })}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col xs={9}>
              <InputGroup className="mb-3">
                <DropdownButton
                  as={InputGroup.Prepend}
                  variant="outline-secondary"
                  title={`🔍${searchFilter ? ' ' + searchFilter : ''}`}
                  id="input-group-dropdown-1"
                >
                  <Dropdown.Header>Set filter</Dropdown.Header>
                  <Dropdown.Item onClick={setSearchFilter.bind(null, 'External ID')}>
                    External ID
                  </Dropdown.Item>
                  <Dropdown.Item onClick={setSearchFilter.bind(null, 'Name')}>Name</Dropdown.Item>
                  <Dropdown.Item onClick={setSearchFilter.bind(null, 'ADP')}>
                    Average Draft Position
                  </Dropdown.Item>
                  <Dropdown.Item onClick={setSearchFilter.bind(null, 'Position')}>
                    Position
                  </Dropdown.Item>
                  <Dropdown.Item onClick={setSearchFilter.bind(null, '')}>
                    Remove filter
                  </Dropdown.Item>
                </DropdownButton>
                <FormControl
                  placeholder="Search for players..."
                  aria-label="Search for players..."
                  aria-describedby="basic-addon1"
                  value={searchStr}
                  onChange={(e) => setSearchStr(e.target.value)}
                />
              </InputGroup>
              {players !== null ? (
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
                    {players
                      .map((p, i): [Player_, number] => [p, i])
                      .filter((playerEntry) => {
                        const player = playerEntry[0];
                        const p = playersResp?.find((p) => p.PlayerID === player.externalId);
                        const lcInclude = (a: string | number, b: string) =>
                          String(a).toLowerCase().includes(b.toLowerCase());
                        const inPosition = lcInclude(player.position, searchStr);
                        const inExternalId = lcInclude(player.externalId, searchStr);
                        const inName = p ? lcInclude(p.Name, searchStr) : false;
                        const inADP = p ? lcInclude(p.AverageDraftPosition, searchStr) : false;
                        return (
                          !searchStr ||
                          (searchFilter === ''
                            ? inPosition
                            : searchFilter === 'Position' && inPosition) ||
                          (searchFilter === ''
                            ? inExternalId
                            : searchFilter === 'External ID' && inExternalId) ||
                          (searchFilter === '' ? inName : searchFilter === 'Name' && inName) ||
                          (searchFilter === '' ? inADP : searchFilter === 'ADP' && inADP)
                        );
                      })
                      .map((playerEntry) => {
                        const player = playerEntry[0];
                        const index = playerEntry[1];
                        return (
                          <tr
                            key={index}
                            style={{
                              backgroundColor:
                                player.choosenByTeamIndex !== -1 ? '#0002' : undefined,
                            }}
                          >
                            <td>
                              <button
                                className="btn"
                                disabled={
                                  player.choosenByTeamIndex !== -1 ||
                                  (players && !doesRosterLimitHold(players, player.position))
                                }
                                onClick={() => {
                                  if (
                                    league !== null &&
                                    teams !== null &&
                                    league.currentPick / teams.length >= TEAM_PLAYERS_COUNT
                                  ) {
                                    alert('Draft Selection is over. You may proceed to lineups.');
                                    return;
                                  }

                                  if (players && !doesRosterLimitHold(players, player.position)) {
                                    alert(
                                      `You are breaking the roster limit criteria! You already own ${
                                        getSelectCount(players)[player.position]
                                      } ${player.position}s, and it is the max limit.`
                                    );
                                    return;
                                  }

                                  if (
                                    pickOrder !== null &&
                                    league !== null &&
                                    selfTeamIndex !== null
                                  ) {
                                    const currentPickerTeamId = pickOrder[league.currentPick];
                                    if (selfTeamIndex + 1 !== currentPickerTeamId) {
                                      alert(
                                        `Currently it's turn of Team #${currentPickerTeamId} while you are Team #${
                                          selfTeamIndex + 1
                                        }. So your transaction would fail.`
                                      );
                                    }
                                  }
                                  setSpinner(true);
                                  pickPlayerTx(index + 1)
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
                                {player.choosenByTeamIndex !== -1 ? (
                                  <>
                                    Taken by{' '}
                                    {player.choosenByTeamIndex === selfTeamIndex ? (
                                      'You'
                                    ) : (
                                      <>
                                        {teams !== null
                                          ? `${teams[player.choosenByTeamIndex].teamName} (#${
                                              player.choosenByTeamIndex + 1
                                            })`
                                          : `#${player.choosenByTeamIndex + 1}`}
                                      </>
                                    )}
                                  </>
                                ) : players && doesRosterLimitHold(players, player.position) ? (
                                  <>Select</>
                                ) : (
                                  <>Roster Full</>
                                )}
                              </button>
                            </td>
                            <td>{player.externalId}</td>
                            {(() => {
                              const p = playersResp?.find((p) => p.PlayerID === player.externalId);
                              if (p) {
                                return (
                                  <>
                                    <td>{p.Name}</td>
                                    <td>{p.AverageDraftPosition}</td>
                                  </>
                                );
                              } else {
                                return (
                                  <>
                                    <td>-</td>
                                    <td>-</td>
                                  </>
                                );
                              }
                            })()}
                            <td>{player.position}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </Table>
              ) : (
                'Loading players....'
              )}
            </Col>
          </Row>
        </Container>
      )}
    </Layout>
  );
};
