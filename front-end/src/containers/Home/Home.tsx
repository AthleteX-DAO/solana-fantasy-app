import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Footer } from '../Footer/Footer';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <>
      <section id="hero" className="d-flex align-items-center">
        <div
          className="container position-absolute"
          style={{ alignContent: 'center', marginLeft: '35%' }}
        >
          <h1 className="bold text-center" style={{ display: 'inline-block' }}>
            Athlete.Equity
          </h1>
          <h2>Invest in the player performance of athletes</h2>
          <Link to="/leagues/create" style={{ marginRight: '50px' }}>
            <button className="btn m-0">Join an existing League</button>
          </Link>

          <Link to="/wallet" style={{ marginLeft: '50px' }}>
            <button className="btn m-0">Create an Account</button>
          </Link>
        </div>
      </section>
      {/* <!-- End Hero --> */}

      {/* Section: Upcoming News & Productivity */}
      {/* <section id="hero" className="d-flex align-items-center news-cycle">
        <Card style={{ maxWidth: 'max-content', marginLeft: '200px' }}>
          <Card.Header className="bold">Currently Available Leagues</Card.Header>
          <Card.Body>
            <img></img> <h4>NFL</h4>
            <img></img> <h4>NBA</h4>
            <h6>Keep an eye out for more to come!</h6>
          </Card.Body>
        </Card>
      </section> */}
    </>
  );
}
