import React, { FunctionComponent, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Table, CardDeck } from 'react-bootstrap';
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

export const Scoreboard: FunctionComponent<RouteComponentProps<MatchParams>> = (props) => {
  const leagueIndex = +props.match.params.index;

  const [selfTeamIndex, setSelfTeamIndex] = useState<number | null>(null);
  const [week, setWeek] = useState<number | null>(null);
  const [newLineup, setNewLineup] = useState<number[]>([]);

  const [teams, setTeams] = useState<Team[] | null>(null);
  const [players, setPlayers] = useState<Player[] | null>(null);

  useEffect(() => {
    setSelfTeamIndex(1);

    setWeek(6);

    setTeams([
      { name: 'HellYeah', selectionStatus: 'Done', lineups: [1, 2, 3, 4] },
      { name: 'BlueBull', selectionStatus: 'Current', lineups: [5, 6, 7, 8] },
      { name: 'Mango', selectionStatus: 'Waiting', lineups: [9, 10, 11, 12] },
      { name: 'MegaHard', selectionStatus: 'Waiting', lineups: [13, 14, 15, 16] },
    ]);

    setPlayers([
      { name: 'Ron Weisly1a', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: -1 },
      { name: 'Ron Weisly1b', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: 1 },
      { name: 'Ron Weisly1c', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: 1 },
      { name: 'Ron Weisly1d', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: -1 },
      { name: 'Ron Weisly1e', avgDraftPosition: 'abc', position: 'QB', choosenByTeam: 1 },
      { name: 'Emiway1a', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
      { name: 'Emiway1b', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
      { name: 'Emiway1c', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: 1 },
      { name: 'Emiway1d', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: -1 },
      { name: 'Emiway1e', avgDraftPosition: 'abc', position: 'RB', choosenByTeam: 1 },
      { name: 'SomePlayer1a', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
      { name: 'SomePlayer1b', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: 1 },
      { name: 'SomePlayer1c', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
      { name: 'SomePlayer1d', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: 1 },
      { name: 'SomePlayer1e', avgDraftPosition: 'abc', position: 'WR', choosenByTeam: -1 },
      { name: 'SomePlayer2a', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: 1 },
      { name: 'SomePlayer2b', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
      { name: 'SomePlayer2c', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
      { name: 'SomePlayer2d', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: -1 },
      { name: 'SomePlayer2e', avgDraftPosition: 'abc', position: 'TE', choosenByTeam: 1 },
      { name: 'SomePlayer3a', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
      { name: 'SomePlayer3b', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
      { name: 'SomePlayer3c', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
      { name: 'SomePlayer3d', avgDraftPosition: 'abc', position: 'K', choosenByTeam: 1 },
      { name: 'SomePlayer3e', avgDraftPosition: 'abc', position: 'K', choosenByTeam: -1 },
      { name: 'SomePlayer4a', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
      { name: 'SomePlayer4b', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
      { name: 'SomePlayer4c', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: 1 },
      { name: 'SomePlayer4d', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: -1 },
      { name: 'SomePlayer4e', avgDraftPosition: 'abc', position: 'D/ST', choosenByTeam: 1 },
    ]);
  }, []);

  return (
    <Layout removeTopMargin heading="Scoreboard">
      <Container>
        <h4 className="align-left mb-4">Total Scores</h4>
        <Row className="pb-3">
          <Col>
            <div className="team-card-scroll-deck">
              {teams?.map((team, index) => (
                <Card key={index}>
                  <Card.Body>
                    <strong>Team #{index}</strong>
                    <br />
                    {team.name}
                    <br />
                    <br />
                    <u>Total Score</u>
                    <br />
                    {300}
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Col>
        </Row>
        {week !== null
          ? Array.from(Array(week), (x, i) => i).map((w) => (
              <>
                <h4 className="align-left my-4">Week {week - w} Scoreboard</h4>
                <Row className="pb-3">
                  <Col>
                    <div className="team-card-scroll-deck">
                      {teams?.map((team, index) => (
                        <Card key={index}>
                          <Card.Body>
                            <strong>Team #{index}</strong>
                            <br />
                            {team.name}
                            <br />
                            <br />
                            <u>Score</u>
                            <br />
                            {300}
                            <br />
                            <br />
                            <u>Lineups</u>
                            <br />
                            {team.lineups.map((playerId) => (
                              <>
                                {players ? (
                                  <>
                                    {players[playerId].name} ({players[playerId].position})
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
    </Layout>
  );
};
