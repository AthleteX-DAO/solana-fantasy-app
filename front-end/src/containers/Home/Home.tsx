import React from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <>
      <section id="hero" className="d-flex align-items-center">
        <div className="container position-relative">
          <h1>Athlete.Equity</h1>
          <h2>Invest in the player performance of athletes</h2>
              <div className="bx-align-right">
              <Link
                to={!!window.wallet ? '/leagues/create' : '/wallet/import'}
                className="btn-get-started scrollto"
              >
                Create my Account
              </Link>
              </div>
          </div>

      </section>
      {/* <!-- End Hero --> */}

      <section id="hero" className="d-flex align-itmes-center news-cycle">
        
      </section>
      <section id="hero">

      </section>
      <main id="main"></main>
    </>
  );
}
