import React, { FunctionComponent } from 'react'
import { Switch, Route } from 'react-router-dom';
import { Roster } from './Roster';

export const RosterRouter: FunctionComponent<{}> = (props) => {

    return (
        <Switch>
            <Route path="/roster" component={Roster} />
        </Switch>
    );
}