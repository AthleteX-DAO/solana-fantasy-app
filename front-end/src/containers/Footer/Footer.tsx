import React from 'react';

export function Footer() {
  return (
    <>
      {/* <!-- ======= Footer ======= --> */}
      <footer id="footer">
        <div className="footer-top">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 col-md-6">
                <div className="footer-info">
                  <h3>About Athlete.Equity</h3>
                  <p>
                    We're a collective of entrepreneurs, tech nerds, and hardcore sports fans that
                    want to build the next big thing in fantasy sports. <br />
                    Rock, Flag and Eagle, amirite?
                    <br /> |
                    <br /> | <br />
                    Follow us on social media
                    <br /> | <br />
                    | <br />
                  </p>
                  {/* <p className="mt-2">
                    Program:{' '}
                    <span style={{ fontFamily: 'monospace' }}>
                      {window.sfsProgramId.toBase58()}
                    </span>
                    <br />
                    Root:{' '}
                    <span style={{ fontFamily: 'monospace' }}>{window.sfsRoot.toBase58()}</span>
                    <br />
                    Devnet, Solana Blockchain
                    <br />
                    <br />
                    <strong>Phone:</strong> +1 5589 55488 55
                    <br />
                    <strong>Email:</strong> info@example.com
                    <br />
                  </p> */}
                  <div className="social-links mt-3">
                    <a href="#" className="twitter">
                      <i className="bx bxl-twitter"></i>
                    </a>
                    <a href="#" className="facebook">
                      <i className="bx bxl-facebook"></i>
                    </a>
                    <a href="#" className="instagram">
                      <i className="bx bxl-instagram"></i>
                    </a>
                    {/* <a href="#" className="google-plus">
                      <i className="bx bxl-skype"></i>
                    </a> */}
                    {/* <a href="#" className="linkedin">
                      <i className="bx bxl-linkedin"></i>
                    </a> */}
                  </div>
                </div>
              </div>

              <div className="col-lg-6 col-md-6 footer-info">
                <h4></h4>
              </div>

              {/* <div className="col-lg-2 col-md-6 footer-links">
                <h4>Our Services</h4>
                <ul>
                  <li>
                    <i className="bx bx-chevron-right"></i> <a href="#">Web Design</a>
                  </li>
                  <li>
                    <i className="bx bx-chevron-right"></i> <a href="#">Web Development</a>
                  </li>
                  <li>
                    <i className="bx bx-chevron-right"></i> <a href="#">Product Management</a>
                  </li>
                  <li>
                    <i className="bx bx-chevron-right"></i> <a href="#">Marketing</a>
                  </li>
                  <li>
                    <i className="bx bx-chevron-right"></i> <a href="#">Graphic Design</a>
                  </li>
                </ul>
              </div> */}

              {/* <div className="col-lg-4 col-md-6 footer-newsletter">
                <h4>Our Newsletter</h4>
                <p>Tamen quem nulla quae legam multos aute sint culpa legam noster magna</p>
                <form action="" method="post">
                  <input type="email" name="email" />
                  <input type="submit" value="Subscribe" />
                </form>
              </div> */}
            </div>
          </div>
        </div>

        <div className="container">
          <div className="copyright">{/* Space for AE Copyright */}</div>
        </div>
      </footer>
      {/* <!-- End Footer --></p> */}
    </>
  );
}
