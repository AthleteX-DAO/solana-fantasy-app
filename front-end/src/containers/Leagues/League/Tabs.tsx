import React, { FunctionComponent } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, RouteComponentProps, useHistory, withRouter } from 'react-router-dom';
import { MatchParams } from './Forwarder';

export const Tabs = withRouter<
  RouteComponentProps<MatchParams>,
  FunctionComponent<RouteComponentProps<MatchParams>>
>((props) => {
  const history = useHistory();
  return (
    <Nav
      fill
      variant="tabs"
      defaultActiveKey={props.location.pathname.split('/').slice(-1)[0]}
      onSelect={(key) => {
        history.push(`/leagues/${props.match.params.index}/${key}`);
      }}
    >
      <Nav.Item>
        <Nav.Link eventKey="join">Join League</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="draft-selection">Draft Selection</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="lineups">Lineups</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="swaps">Swaps</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="scoreboard">Scoreboard</Nav.Link>
      </Nav.Item>
    </Nav>
  );
});
