import React, { FunctionComponent, useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { useHistory, RouteComponentProps } from 'react-router-dom';
import { League } from '../../sdk/state';
import { Layout } from '../Layout';

export const LeagueList: FunctionComponent<RouteComponentProps> = (props) => {
  const history = useHistory();

  const [leagues, setLeagues] = useState<League[] | null>();

  // @ts-ignore
  window.leagues = leagues;

  useEffect(() => {
    (async () => {
      let forceUpdate = false;
      if (window.URLSearchParams) {
        const sp = new URLSearchParams(props.location.search);
        forceUpdate = !!sp.get('forceRootUpdate');
      }
      const root = await window.getCachedRootInfo(forceUpdate || undefined);
      setLeagues(root.leagues.filter((league) => league.isInitialized));
    })().catch(console.log);
  }, []);
  return (
    <Layout heading="Leagues">
      {leagues ? (
        leagues.length !== 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Leage Index</th>
                <th>Leage Name</th>
                <th>Bid</th>
                <th>Users</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leagues.map((league, i) => (
                <tr>
                  <td>{i}</td>
                  <td>{league.name || 'No Name'}</td>
                  <td>{league.bid.toNumber() / 10 ** 9} SOL</td>
                  <td>
                    {league.userStateLength}/{league.usersLimit}
                  </td>
                  <td>
                    <button onClick={() => history.push(`/leagues/${i}`)} className="btn">
                      Join
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          'No leagues are there. You can create one by clicking on Create League in navbar.'
        )
      ) : (
        'Loading state from Solana...'
      )}
    </Layout>
  );
};
