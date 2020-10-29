import React, { FunctionComponent, useState } from 'react';
import { Card, Form, InputGroup } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { Layout } from '../../../Layout';
import { DraftSelection } from './DraftSelection';
import { JoinLeague } from './Join';

export interface MatchParams {
  index: string;
}

export const LeagueView: FunctionComponent<RouteComponentProps<MatchParams>> = (props) => {
  let [leagueIndexScreen, setLeagueIndexScreen] = useState<number>(0);

  const leagueIndex = +props.match.params.index;
  return (
    <Layout
      heading={(() => {
        switch (leagueIndexScreen) {
          case 0:
            return 'Join League';
          case 1:
            return 'Draft Selection';
          default:
            return 'League view';
        }
      })()}
    >
      {(() => {
        if (isNaN(leagueIndex)) {
          return <>League index is not a valid number</>;
        }

        // @TODO: query the contract and check what is state of the league for the user and decide
        //  which component to be shown here: Join, Draft Selection or the Lineup selection

        switch (leagueIndexScreen) {
          case 0:
            return (
              <JoinLeague leagueIndex={leagueIndex} setLeagueIndexScreen={setLeagueIndexScreen} />
            );
          case 1:
            return (
              <DraftSelection
                leagueIndex={leagueIndex}
                setLeagueIndexScreen={setLeagueIndexScreen}
              />
            );
          default:
            return <>There is no screen. This is a bug please report it.</>;
        }
      })()}
    </Layout>
  );
};
