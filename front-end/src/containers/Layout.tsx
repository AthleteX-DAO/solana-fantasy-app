import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

export const Layout: FunctionComponent<{ heading: string }> = (props) => {
  const breadcrumb = window.location.pathname.split('/');
  if (breadcrumb[breadcrumb.length - 1] === '') {
    breadcrumb.pop();
  }
  return (
    <main id="main">
      <section id="breadcrumbs" className="breadcrumbs">
        <div className="container">
          <ol>
            {breadcrumb.map((name, index) => (
              <li key={index}>
                <Link
                  to={breadcrumb.slice(0, index + 1).join('/')}
                  className={breadcrumb.length - 1 === index ? 'active' : ''}
                >
                  {name ? name.replace(/-/g, ' ').toUpperCase() : 'HOME'}
                </Link>
              </li>
            ))}
          </ol>
          <h2>{props.heading ?? 'Heading'}</h2>
        </div>
      </section>

      <section className="inner-page">
        <div className="container">{props.children}</div>
      </section>
    </main>
  );
};
