import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

export const Layout: FunctionComponent<{ heading: string; removeTopMargin?: boolean }> = (
  props
) => {
  const breadcrumb = window.location.pathname.split('/');
  if (breadcrumb[breadcrumb.length - 1] === '') {
    breadcrumb.pop();
  }
  return (
    <main id="main">
      <section id="breadcrumbs" className={`breadcrumbs${props.removeTopMargin ? ' mt-0' : ''}`}>
        <div className="container">
          <h2>{props.heading ?? 'Heading'}</h2>
        </div>
      </section>

      <section className="inner-page">
        <div className="container">{props.children}</div>
      </section>
    </main>
  );
};
