import React, { FunctionComponent } from 'react';
import { Switch, Route } from 'react-router-dom';
import { CreateLeague } from './CreateLeague';
import { LeagueList } from './LeagueList';
import { LeagueRouter } from './League/Router';

export const LeaguesRouter: FunctionComponent<{}> = (props) => {
  return (
    <Switch>
      <Route path="/leagues" exact component={LeagueList} />
      <Route path="/leagues/create" exact component={CreateLeague} />
      <Route path="/leagues/:index" component={LeagueRouter} />
    </Switch>
  );
};
