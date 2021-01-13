import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <>
      <section id="hero" className="d-flex align-items-center"></section>
      {/* <!-- End Hero --> */}

      <section id="hero" className="d-flex align-itmes-center news-cycle">

      </section>
      <section id="hero">
        <Card className="" style={{maxWidth: '400px', margin: '0 auto'}}>
          <Card.Header>
            <h3>
              The Latest from NFL 
            </h3>
          </Card.Header>

          <Card.Body>

          </Card.Body>
        </Card>
      </section>
      <main id="main"></main>
    </>
  );
}
