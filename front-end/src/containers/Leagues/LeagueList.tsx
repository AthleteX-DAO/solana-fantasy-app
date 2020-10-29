import React, { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Layout } from '../Layout';

export const LeagueList: FunctionComponent<{}> = (props) => {
  const history = useHistory();

  return (
    <Layout heading="Leagues">
      <Table>
        <thead>
          <tr>
            <th>Leage Index</th>
            <th>Leage Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0</td>
            <td>League 1</td>
            <td>
              <button onClick={() => history.push(`/leagues/${0}`)} className="btn">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </Table>
    </Layout>
  );
};
