import React, { FunctionComponent } from 'react';
import { Switch, Route } from 'react-router-dom';
import { LeagueView } from './LeagueView/LeagueView';

export const LeagueRouter: FunctionComponent = (props) => {
  return (
    <Switch>
      <Route path="/leagues/:index" exact component={LeagueView} />
    </Switch>
  );
};
