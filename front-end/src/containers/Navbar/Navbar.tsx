import React from 'react';

export function Navbar() {
  return (
    <>
      {/* <!-- ======= Top Bar ======= --> */}
      <div id="topbar" className="d-none d-lg-flex align-items-center fixed-top ">
        <div className="container d-flex">
          <div className="contact-info mr-auto">
            <i className="icofont-envelope"></i>{' '}
            <a href="mailto:contact@example.com">contact@example.com</a>
            <i className="icofont-phone"></i> +1 5589 55488 55
          </div>
          <div className="social-links">
            <a href="#" className="twitter">
              <i className="icofont-twitter"></i>
            </a>
            <a href="#" className="facebook">
              <i className="icofont-facebook"></i>
            </a>
            <a href="#" className="instagram">
              <i className="icofont-instagram"></i>
            </a>
            <a href="#" className="skype">
              <i className="icofont-skype"></i>
            </a>
            <a href="#" className="linkedin">
              <i className="icofont-linkedin"></i>
            </a>
          </div>
        </div>
      </div>

      {/* // <!-- ======= Header ======= --> */}
      <header id="header" className="fixed-top ">
        <div className="container d-flex align-items-center">
          <h1 className="logo mr-auto">
            <a href="index.html">Day</a>
          </h1>
          {/* <!-- Uncomment below if you prefer to use an image logo --> */}
          {/* <!-- <a href="index.html" className="logo mr-auto"><img src="assets/img/logo.png" alt="" className="img-fluid"></a>--> */}

          <nav className="nav-menu d-none d-lg-block">
            <ul>
              <li className="active">
                <a href="index.html">Home</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#portfolio">Portfolio</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li>
                <a href="#team">Team</a>
              </li>
              <li className="drop-down">
                <a href="">Drop Down</a>
                <ul>
                  <li>
                    <a href="#">Drop Down 1</a>
                  </li>
                  <li className="drop-down">
                    <a href="#">Deep Drop Down</a>
                    <ul>
                      <li>
                        <a href="#">Deep Drop Down 1</a>
                      </li>
                      <li>
                        <a href="#">Deep Drop Down 2</a>
                      </li>
                      <li>
                        <a href="#">Deep Drop Down 3</a>
                      </li>
                      <li>
                        <a href="#">Deep Drop Down 4</a>
                      </li>
                      <li>
                        <a href="#">Deep Drop Down 5</a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#">Drop Down 2</a>
                  </li>
                  <li>
                    <a href="#">Drop Down 3</a>
                  </li>
                  <li>
                    <a href="#">Drop Down 4</a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </nav>
          {/* <!-- .nav-menu --> */}
        </div>
      </header>
      {/* <!-- End Header --></header> */}
    </>
  );
}
