import React from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <>
      <section id="hero" className="d-flex align-items-center">
        <div className="container position-relative">
          <h1>Welcome to Solana Fantasy Sports</h1>
          <h2>Create a league or join a league to start playing</h2>
          <Link
            to={!!window.wallet ? '/leagues/create' : '/wallet/import'}
            className="btn-get-started scrollto"
          >
            Get Started
          </Link>
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

                <div style={{ textAlign: 'left' }}>
                  <ul>
                    <li>
                      <i className="icofont-check-circled" /> Your keys stays on your system.
                    </li>
                    <li>
                      <i className="icofont-check-circled"></i> Open-sourced (
                      <a href="https://github.com/ProtoDao/solana-fantasy-app">view on GitHub</a>).
                    </li>
                  </ul>
                  This is a demonstration of a Fantasy application on Solana.
                  <br />
                  <u>Step 1:</u> Create (or Import) a Wallet
                  <br />
                  <u>Step 2:</u> Request $SOL Airdrop From Faucet
                  <br />
                  <u>Step 3:</u> Create a League and set $SOL entry cost
                  <br />
                  <u>Step 4:</u> Invite your friends to join the League
                  <br />
                  <u>Step 5:</u> Draft your players (in a snake-style draft)
                  <br />
                  <u>Step 6:</u> Select your weekly lineup of players
                  <br />
                  <u>Step 7:</u> Swap Players on the bench with other teams in the League
                  <br />
                  <u>Step 8:</u> As each week is completed, use the oracle to pass in the scores
                  When a week is completed you need to run the Increment Week script and Update
                  scores script. For this you will need to locally setup the project on your
                  machine. Have a look at pre-requisites.
                  <br />
                  <u>Step 9:</u> Use the scoreboard to tabulate scores, and withdraw winnings once
                  the season is over.
                  <br />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
