import React, { FunctionComponent, useState } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { Layout } from '../../../Layout';

export const DraftSelection: FunctionComponent<{
  leagueIndex: number;
  setLeagueIndexScreen: Function;
}> = () => {
  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <Card>
            <Card.Body>Hey</Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>Hey</Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>Hey</Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>Hey</Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <Card>
            <Card.Body>Hey</Card.Body>
          </Card>
        </Col>
        <Col xs={9}>
          <Card>
            <Card.Body>
              Heyhey<br></br>hey
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
