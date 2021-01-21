import React, { FunctionComponent } from 'react';
import { Switch, Route } from 'react-router-dom';
// H2H Import

export const H2HRouter: FunctionComponent<{}> = (props) => {
  return (
    <Switch>
      <Route path="/h2h" exact />
    </Switch>
  );
};
