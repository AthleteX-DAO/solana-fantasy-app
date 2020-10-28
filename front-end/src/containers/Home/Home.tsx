import React from 'react';

export function Home() {
  return (
    <>
      {/* <!-- ======= Hero Section ======= --> */}
      <section id="hero" className="d-flex align-items-center">
        <div
          className="container position-relative"
          // data-aos="fade-up"
          // data-aos-delay="500"
        >
          <h1>Welcome to Day</h1>
          <h2>We are team of talanted designers making websites with Bootstrap</h2>
          <a href="#about" className="btn-get-started scrollto">
            Get Started
          </a>
        </div>
      </section>
      {/* <!-- End Hero --> */}

      <main id="main">
        {/* <!-- ======= About Section ======= --> */}
        <section id="about" className="about">
          <div className="container">
            <div className="row">
              <div
                className="col-lg-6 order-1 order-lg-2"
                // data-aos="fade-left"
              >
                <img src="assets/img/about.jpg" className="img-fluid" alt="" />
              </div>
              <div
                className="col-lg-6 pt-4 pt-lg-0 order-2 order-lg-1 content"
                // data-aos="fade-right"
              >
                <h3>Voluptatem dignissimos provident quasi corporis voluptates sit assumenda.</h3>
                <p className="font-italic">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua.
                </p>
                <ul>
                  <li>
                    <i className="icofont-check-circled"></i> Ullamco laboris nisi ut aliquip ex ea
                    commodo consequat.
                  </li>
                  <li>
                    <i className="icofont-check-circled"></i> Duis aute irure dolor in reprehenderit
                    in voluptate velit.
                  </li>
                  <li>
                    <i className="icofont-check-circled"></i> Ullamco laboris nisi ut aliquip ex ea
                    commodo consequat. Duis aute irure dolor in reprehenderit in voluptate trideta
                    storacalaperda mastiro dolore eu fugiat nulla pariatur.
                  </li>
                </ul>
                <p>
                  Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                  reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* <!-- End About Section --> */}
      </main>
    </>
  );
}
