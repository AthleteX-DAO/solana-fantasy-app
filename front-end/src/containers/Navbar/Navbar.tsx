import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export function Navbar() {
  return (
    <header id="header" className="fixed-top" style={{ backgroundColor: '#000' }}>
      <div className="container d-flex align-items-center">
        <h1 className="logo mr-auto">
          <Link to="/">SFS</Link>
        </h1>
        <nav className="nav-menu d-none d-lg-block">
          <ul>
            <NavElement to="/" label="Home" />
            <NavElement to="/create-a-league" label="Create a League" />
            <NavElement to="/join-a-league" label="Join a League" />
            <NavElement to="/wallet/import" label="Connect Wallet" />
          </ul>
        </nav>
      </div>
    </header>
  );
}

function NavElement(props: { to: string; label: string }) {
  return (
    <NavLink to={props.to} activeClassName="active" exact>
      <label>{props.label}</label>
    </NavLink>
  );
}
