import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

import { Navbar } from './containers/Navbar/Navbar';
import { Footer } from './containers/Footer/Footer';
import { Home } from './containers/Home/Home';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Switch>
          <Route path="/" exact component={Home} />
        </Switch>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
