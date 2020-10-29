import React, { FunctionComponent } from 'react';
import { Switch, Route } from 'react-router-dom';
import { LeagueList } from './LeagueList';

export const LeaguesRouter: FunctionComponent<{}> = (props) => {
  return (
    <Switch>
      <Route path="/leagues" exact component={LeagueList} />
    </Switch>
  );
};
