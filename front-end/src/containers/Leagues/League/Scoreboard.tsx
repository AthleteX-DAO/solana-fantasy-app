import React, { FunctionComponent, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Table, CardDeck } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { SFS } from '../../../sdk/sfs';
import { League, Position, Root } from '../../../sdk/state';
import { Layout } from '../../Layout';
import { MatchParams } from './Forwarder';

type Position_ = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'D/ST';

interface Player_ {
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

export const Scoreboard: FunctionComponent<RouteComponentProps<MatchParams>> = (props) => {
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

    setLeague(_league);
  }, [root]);

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

  return (
    <Layout removeTopMargin heading="Scoreboard">
      {!root ? (
        <Container>
          <h4 className="mb-4">Loading...</h4>
        </Container>
      ) : (
        <Container>
          <h4 className="align-left mb-4">Total Scores</h4>
          <Row className="pb-3">
            <Col>
              <div className="team-card-scroll-deck">
                {league?.userStates?.slice(0, league.userStateCount).map((userState, index) => (
                  <Card key={index}>
                    <Card.Body>
                      <strong>Team #{index}</strong>
                      <br />
                      {userState.teamName}
                      <br />
                      <br />
                      <u>Total Score</u>
                      <br />
                      {SFS.getUserScores(root, leagueIndex)[index].score}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Col>
          </Row>
          {league?.startWeek
            ? Array.from({ length: root.currentWeek - league?.startWeek })
                .map((_, i) => league.startWeek + i)
                .reverse()
                .map((week) => (
                  <>
                    <h4 className="align-left my-4">Week {week} Scoreboard</h4>
                    <Row className="pb-3">
                      <Col>
                        <div className="team-card-scroll-deck">
                          {league?.userStates
                            ?.slice(0, league.userStateCount)
                            .map((userState, userIndex) => (
                              <Card key={userIndex}>
                                <Card.Body>
                                  <strong>Team #{userIndex}</strong>
                                  <br />
                                  {userState.teamName}
                                  <br />
                                  <br />
                                  <u>Score</u>
                                  <br />
                                  {SFS.getWeekScores(root, leagueIndex, userIndex + 1, week)}
                                  <br />
                                  <br />
                                  <u>Lineups</u>
                                  <br />
                                  {userState.lineups[week - 1].map((playerId) => (
                                    <>
                                      {players ? (
                                        <>
                                          {getNameByPlayerIndex(playerId - 1)} (
                                          {players[playerId - 1].position})
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
                  </>
                ))
            : null}
        </Container>
      )}
    </Layout>
  );
};
