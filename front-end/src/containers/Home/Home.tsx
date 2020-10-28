import React from 'react';

export function Home() {
  return (
    <>
      <section id="hero" className="d-flex align-items-center">
        <div className="container position-relative">
          <h1>Welcome to Solana Fantasy Sports</h1>
          <h2>Create a league or join a league to start playing</h2>
          <a href="#about" className="btn-get-started scrollto">
            Get Started
          </a>
        </div>
      </section>
      {/* <!-- End Hero --> */}

      <main id="main">
        <section id="about" className="about">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 order-1 order-lg-2">
                <img src="assets/img/about.jpg" className="img-fluid" alt="" />
              </div>
              <div className="col-lg-6 pt-4 pt-lg-0 order-2 order-lg-1 content">
                <h3>About the dApp</h3>
                <p className="font-italic">
                  This application is built on the Solana, the super fast blockchain.
                </p>
                <ul>
                  <li>
                    <i className="icofont-check-circled" /> Your keys stays on your system.
                  </li>
                  <li>
                    <i className="icofont-check-circled"></i> Open-sourced
                  </li>
                </ul>
                <p>This is a demonstration of a Fantasy application on Solana.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
