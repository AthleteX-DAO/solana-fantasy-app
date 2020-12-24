import React from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <>
      <section id="hero" className="d-flex align-items-center">
        <div className="container position-relative">
          <h1>Athlete.Equity</h1>
          <h2>Turn Sunday nights into payday</h2>
          <Link
            to={!!window.wallet ? '/leagues/create' : '/wallet/import'}
            className="btn-get-started scrollto"
          >
            I'm feeling lucky
          </Link>
        </div>
      </section>
      {/* <!-- End Hero --> */}

      <main id="main">
      </main>
    </>
  );
}
