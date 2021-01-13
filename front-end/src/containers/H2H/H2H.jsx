import { Button, ButtonGroup, Card, Table, Row, Col } from 'react-bootstrap';
import React from 'react';

import '../../assets/css/H2H.css';

/*
  Take fights[] as prop where each fight is {fighter1: String, fighter2: String}
*/
export class H2H extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = {
      status: 'waiting', //waiting/inProgress/complete
      bets: 'unlocked', //unlocked/locked
      picks: [], //Array of the users picks
      p2_picks: [],
      results: [],
      p1Points: 0,
      p2Points: 0,
    };
  }

  componentDidMount() {
    let i;
    if (this.state.picks) {
      i = 0;
      let initPicks = [];
      for (i; i < this.props.fights.length; i++) {
        initPicks.push('not chosen');
      }
      this.setState({ picks: initPicks });
    }

    /*
            For Demo Purposes Only
        */
    let p2Picks;
    let r;
    for (i = 0; i < this.props.fights.length; i++) {
      p2Picks = this.state.p2_picks;
      r = this.state.results;
      p2Picks[i] = this.props.fights[i].f2;
      r[i] = i % 2 ? this.props.fights[i].f1 : this.props.fights[i].f2;
    }
    this.setState({ p2_picks: p2Picks, results: r });
  }

  handleChange(option, index) {
    let pixar = this.state.picks;
    pixar[index] = option;
    this.setState({ picks: pixar });
  }

  calculateScore() {
    let i;
    let fights = this.props.fights;
    let p1 = 0;
    let p2 = 0;
    for (i = 0; i < fights.length; i++) {
      if (this.state.p2_picks[i] === this.state.results[i]) {
        p2 += fights.length - i;
      }
      if (this.state.picks[i] === this.state.results[i]) {
        p1 += fights.length - i;
      }
    }
    if (p1 !== this.state.p1Points || p2 !== this.state.p2Points) {
      this.setState({ p1Points: p1, p2Points: p2 });
    }
  }

  demoChangeState = () => {
    let status = this.state.status;
    if (status === 'waiting') {
      status = 'inProgress';
    } else if (status === 'inProgress') {
      status = 'complete';
    } else if (status === 'complete') {
      status = 'waiting';
    }
    this.setState({ status });
  };

  render() {
    let fights = this.props.fights;
    if (fights && Array.isArray(fights) && fights.length > 0) {
      return (
        <Card>
          <Card.Header>
            <Row>
              <Col className="col">
                <h2>User1</h2>
                <span>Points: {this.state.p1Points}</span>
              </Col>
              <Col className="col">
                <h3 style={{ marginBottom: '1rem' }}>Total Bet: $$$</h3>
                <div>
                  <Button
                    color="success"
                    id="4"
                    size="sm"
                    tag="label"
                    onClick={this.demoChangeState}
                  >
                    <span>State: {this.state.status}</span>
                  </Button>
                </div>
              </Col>
              <Col className="col">
                <h2>User2</h2>
                <span>Points: {this.state.p2Points}</span>
              </Col>
            </Row>
            <hr style={{ borderTop: '2px solid gray' }}></hr>
          </Card.Header>
          <Card.Body>
            <table>
              <thead>
                <tr>
                  <td>Player 1 Picks</td>
                  <td></td>
                  <td>Outcome</td>
                  <td></td>
                  <td>Player 2 Picks</td>
                </tr>
              </thead>
              <tbody>
                {fights.map((fight, i) => {
                  let status = this.state.status;
                  if (status === 'waiting') {
                    return (
                      <tr key={i}>
                        <td></td>
                        <td></td>
                        <td>...</td>
                        <td style={{ color: 'red' }}></td>
                        <td style={{ fontStyle: 'italic' }}>Hidden</td>
                      </tr>
                    );
                  } else if (status === 'inProgress') {
                    return (
                      <tr key={i}>
                        <td>{this.state.picks[i]}</td>
                        <td style={{ color: 'green' }}></td>
                        <td>
                          {/*For Demo purposes*/ i === fights.length - 1 ? 'In progress' : '...'}
                        </td>
                        <td style={{ color: 'red' }}></td>
                        <td>{this.state.p2_picks[i]}</td>
                      </tr>
                    );
                  } else if (status === 'complete') {
                    this.calculateScore();
                    return (
                      <tr key={i}>
                        <td>{this.state.picks[i]}</td>
                        <td style={{ color: 'green' }}>
                          {this.state.picks[i] === this.state.results[i]
                            ? `+${fights.length - i}`
                            : ''}
                        </td>
                        <td>{/*For Demo purposes*/ this.state.results[i]}</td>
                        <td style={{ color: 'red' }}>
                          {this.state.p2_picks[i] === this.state.results[i]
                            ? `+${fights.length - i}`
                            : ''}
                        </td>
                        <td>{this.state.p2_picks[i]}</td>
                      </tr>
                    );
                  } else {
                    return <></>;
                  }
                })}
              </tbody>
            </table>
          </Card.Body>
          {this.state.status === 'complete' ? (
            this.state.p1Points > this.state.p2Points ? (
              <Card.Footer
                style={{ backgroundColor: 'green', height: '5rem', position: 'relative' }}
              >
                <h1 style={{ textAlign: 'center', margin: '0' }}>Player 1 Wins!!</h1>
              </Card.Footer>
            ) : this.state.p1Points < this.state.p2Points ? (
              <Card.Footer style={{ backgroundColor: 'red', height: '5rem', position: 'relative' }}>
                <h1 style={{ textAlign: 'center', margin: '0' }}>Player 2 Wins!!</h1>
              </Card.Footer>
            ) : (
              <Card.Footer>
                <h1 style={{ textAlign: 'center', margin: '0' }}>Tie!</h1>
              </Card.Footer>
            )
          ) : (
            <></>
          )}
        </Card>
      );
    } else {
      return (
        <Card>
          <span>Error with fight prop</span>
        </Card>
      );
    }
  }
}
