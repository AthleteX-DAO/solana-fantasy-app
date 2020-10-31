import React, { FunctionComponent, useEffect, useState } from 'react';
import { Card, Form, InputGroup } from 'react-bootstrap';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Layout } from '../../Layout';
import { DraftSelection } from './DraftSelection';
import { JoinLeague } from './Join';

export interface MatchParams {
  index: string;
}

export const Forwarder: FunctionComponent<RouteComponentProps<MatchParams>> = (props) => {
  const leagueIndex = +props.match.params.index;
  const history = useHistory();
  useEffect(() => {
    setTimeout(() => {
      history.push(`/leagues/${leagueIndex}/join`);
      window.leagueTabHook();
    }, 1500);
  }, []);
  return (
    <Layout removeTopMargin heading="League">
      Please wait...
    </Layout>
  );
};
