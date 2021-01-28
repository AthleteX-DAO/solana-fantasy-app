import React, {FunctionComponent, useEffect, useState } from 'react';
import { Card, Alert } from 'react-bootstrap';
import { useHistory, RouteComponentProps } from 'react-router-dom';
import { Layout } from '../Layout';

export const Roster: FunctionComponent<RouteComponentProps> = (props) => {
    
    return (
        <Layout heading="Roster" className="align-baseline">
            {/* Two Cards -- One for Liquidity Pool, Second for Roster */}
            <Card style={{ maxWidth: '400px', margin: '0 auto' }}>
                <Card.Header>
                    My Roster
                </Card.Header>
                <Card.Body>
                    <button className="btn m-4" style={{margin: '50px 50px 50px 50px'}}>
                        Create a team
                    </button>
                </Card.Body>
            </Card>

            {/* Uniswap */}
            <Card style={{ maxWidth: '400px', margin: 'inline auto 100px 200px' }}>
                <Card.Header>
                    Uniswap
                </Card.Header>
                <Card.Body>
                    Uniswap TBA...
                </Card.Body>
            </Card>
        </Layout>   
    );
}