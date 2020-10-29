import React, { FunctionComponent } from 'react';
import { Switch, Route } from 'react-router-dom';

import { Wallet } from './Wallet';
import { CreateWallet } from './CreateWallet';
import { ImportWallet } from './ImportWallet';

export const WalletRouter: FunctionComponent<{}> = (props) => {
  return (
    <Switch>
      <Route path="/wallet" exact component={Wallet} />
      <Route path="/wallet/import" exact component={ImportWallet} />
      <Route path="/wallet/create" exact component={CreateWallet} />
    </Switch>
  );
};
