import React from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <>
      <section id="hero" className="d-flex align-items-center">
        <div className="container position-relative">
          <h1>Athlete.Equity</h1>
          <h2>Beat the dollar with daily fantasy sports</h2>
          <Link
            to={!!window.wallet ? '/leagues/create' : '/wallet/import'}
            className="btn-get-started scrollto"
          >
            Let's Do This
          </Link>
        </div>
      </section>
      {/* <!-- End Hero --> */}

      <main id="main"></main>
    </>
  );
}
