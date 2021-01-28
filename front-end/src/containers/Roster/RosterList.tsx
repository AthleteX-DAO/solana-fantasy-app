import React, { FunctionComponent, useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { useHistory, RouteComponentProps } from 'react-router-dom';
import { League } from '../../sdk/state';
import { isUserAlreadyJoined } from '../../utils';
import { Layout } from '../Layout';

export const RosterList: FunctionComponent<RouteComponentProps> = (props) => {

    // Continously update roster list
    useEffect(() => {
        (async () =>{
            
        })();
    }, []);
}