import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import logo from './logo.svg';
// import './App.css';
import './global.css';

import { Navbar } from './containers/Navbar/Navbar';
import { Footer } from './containers/Footer/Footer';
import { Home } from './containers/Home/Home';
import { WalletRouter } from './containers/Wallet/Router';
import { LeaguesRouter } from './containers/Leagues/Router';
import { MatchupsRouter } from './containers/Matchups/Router';
import { RosterRouter } from './containers/Roster/Router';
import { H2HRouter } from './containers/H2H/Router';
import { Admin } from './containers/Admin/Admin';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/wallet" component={WalletRouter} />
          <Route path="/leagues" component={LeaguesRouter} />
          <Route path="/matchups" component={MatchupsRouter} />
          <Route path="/admin" component={Admin} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
