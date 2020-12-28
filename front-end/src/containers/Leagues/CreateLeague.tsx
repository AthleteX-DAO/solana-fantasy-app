import React, { useState } from 'react';
import { Button, Card, Form, Dropdown } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Layout } from '../Layout';

export function CreateLeague() {
  const history = useHistory();

  const nflDefault = [2,2,1,1,1,1,0,0,0,0,0]; //2rb 2wr 1qb 1te 1k 1def 0nba
  const nbaDefault = [0,0,0,0,0,0,1,1,1,1,1]; //0nfl 1 each nba position

  const [spinner, setSpinner] = useState<boolean>(false);
  const [leagueNameInput, setLeagueNameInput] = useState<string>('');
  const [leagueEntryCostInput, setLeagueEntryCostInput] = useState<string>('');
  const [leagueSizeInput, setLeagueSizeInput] = useState<string>('');
  const [teamNameInput, setTeamNameInput] = useState<string>('');
  const [leagueType, setLeagueType] = useState<string>('NFL Classic');
  const [positionOptions, setPositionOptions] = useState<number[]>(nflDefault);
  const [advancedMenu, setAdvancedMenu] = useState<boolean>(false);

  const createLeague = async () => {
    if (!window.wallet) {
      throw new Error('Wallet is not loaded');
    }
    const sdk = await window.sfsSDK();

    const bid = +leagueEntryCostInput;
    if (isNaN(bid)) {
      throw new Error('Bid value is NaN');
    }
    const leagueSize = +leagueSizeInput;
    if (isNaN(leagueSize)) {
      throw new Error('leagueSize value is NaN');
    }

    const resp = await window.wallet.callback('Sign on Create League transaction?', (acc) => {
      return sdk.createLeague(acc, leagueNameInput, bid * 10 ** 9, leagueSize, teamNameInput,positionOptions);
    });

    console.log({ resp });
  };

  return (
    <Layout heading="Create a League">
      <Card style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Card.Body>
          <Form.Control
            disabled={spinner}
            className="align-items-center"
            onChange={(event) => setLeagueNameInput(event.target.value)}
            value={leagueNameInput}
            type="text"
            placeholder="Enter League Name"
            autoComplete="off"
            // isInvalid={}
          />

          <Form.Control
            disabled={spinner}
            className="align-items-center my-4"
            onChange={(event) => setLeagueSizeInput(event.target.value)}
            value={leagueSizeInput}
            type="text"
            placeholder="Enter League Size"
            autoComplete="off"
            // isInvalid={}
          />

          <Form.Control
            disabled={spinner}
            className="align-items-center my-4"
            onChange={(event) => setLeagueEntryCostInput(event.target.value)}
            value={leagueEntryCostInput}
            type="text"
            placeholder="Enter League Entry Cost"
            autoComplete="off"
            // isInvalid={}
          />

          <Form.Control
            disabled={spinner}
            className="align-items-center"
            onChange={(event) => setTeamNameInput(event.target.value)}
            value={teamNameInput}
            type="text"
            placeholder="Enter your team name"
            autoComplete="off"
            // isInvalid={}
          />

          <Dropdown className="my-4">
            League Type:
            <Dropdown.Toggle>
              {leagueType}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {setLeagueType("NFL Classic"); setPositionOptions(nflDefault);}}>NFL Classic</Dropdown.Item>
              <Dropdown.Item  onClick={() => {setLeagueType("NBA Classic"); setPositionOptions(nbaDefault);}}>NBA Classic</Dropdown.Item>
              <Dropdown.Item onClick={() => {setLeagueType("Custom"); setAdvancedMenu(true)}}>Custom</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {advancedMenu? 
          <div>
            <span style={{display:"block",textDecorationLine: 'underline'}} onClick={() => setAdvancedMenu(false)}>Hide</span>
            <span style={{display:"block"}}>Enter the number of each position that will be started in a lineup</span>
            <span style={{display:"block"}}>If a position is set to 0, players in that position will not be able to be drafted</span>
            QB:<Form.Control 
              style={{display:"inline",width:"13%",marginRight:"2.8rem",marginTop:"0.75rem"}}
              onChange={(e) => setPositionOptions([...positionOptions.slice(0,2),parseInt(e.target.value,10)||0,...positionOptions.slice(3)])}
              value={positionOptions[2]}
              type="text"
              />
            WR:<Form.Control 
              style={{display:"inline",width:"13%",marginRight:"2.8rem",marginTop:"0.75rem"}}
              onChange={(e) => setPositionOptions([...positionOptions.slice(0,1),parseInt(e.target.value,10)||0,...positionOptions.slice(2)])}
              value={positionOptions[1]}
              />
            RB:<Form.Control 
              style={{display:"inline",width:"13%",marginRight:"2.8rem",marginTop:"0.75rem"}}
              onChange={(e) => setPositionOptions([parseInt(e.target.value,10)||0,...positionOptions.slice(1)])}
              value={positionOptions[0]}
              />
            TE:<Form.Control 
              style={{display:"inline",width:"13%",marginRight:"2.8rem",marginTop:"0.75rem"}}
              onChange={(e) => setPositionOptions([...positionOptions.slice(0,3),parseInt(e.target.value,10)||0,...positionOptions.slice(4)])}
              value={positionOptions[3]}
              />
            K:<Form.Control 
              style={{display:"inline",width:"13%",marginRight:"2.8rem",marginTop:"0.75rem"}}
              onChange={(e) => setPositionOptions([...positionOptions.slice(0,4),parseInt(e.target.value,10)||0,...positionOptions.slice(5)])}
              value={positionOptions[4]}
              />
            DEF:<Form.Control 
              style={{display:"inline",width:"13%",marginRight:"2.8rem",marginTop:"0.75rem"}}
              onChange={(e) => setPositionOptions([...positionOptions.slice(0,5),parseInt(e.target.value,10)||0,...positionOptions.slice(6)])}
              value={positionOptions[5]}
              />
            PG:<Form.Control 
              style={{display:"inline",width:"13%",marginRight:"2.8rem",marginTop:"0.75rem"}}
              onChange={(e) => setPositionOptions([...positionOptions.slice(0,6),parseInt(e.target.value,10)||0,...positionOptions.slice(7)])}
              value={positionOptions[6]}
              />
            SG:<Form.Control 
              style={{display:"inline",width:"13%",marginRight:"2.8rem",marginTop:"0.75rem"}}
              onChange={(e) => setPositionOptions([...positionOptions.slice(0,7),parseInt(e.target.value,10)||0,...positionOptions.slice(8)])}
              value={positionOptions[7]}
              />
            SF:<Form.Control 
              style={{display:"inline",width:"13%",marginRight:"2.8rem",marginTop:"0.75rem"}}
              onChange={(e) => setPositionOptions([...positionOptions.slice(0,8),parseInt(e.target.value,10)||0,...positionOptions.slice(9)])}
              value={positionOptions[8]}
              />
            PF:<Form.Control 
              style={{display:"inline",width:"13%",marginRight:"2.8rem",marginTop:"0.75rem"}}
              onChange={(e) => setPositionOptions([...positionOptions.slice(0,9),parseInt(e.target.value,10)||0,...positionOptions.slice(10)])}
              value={positionOptions[9]}
              />
            C:<Form.Control 
              style={{display:"inline",width:"13%",marginRight:"2.8rem",marginTop:"0.75rem"}}
              onChange={(e) => setPositionOptions([...positionOptions.slice(0,10),parseInt(e.target.value,10)||0])}
              value={positionOptions[10]}
              />
          </div>
          :<span style={{display:"block",textDecorationLine: 'underline'}} onClick={() => setAdvancedMenu(true)}>Show advanced Options</span>}
          {/* <Button>Submit</Button> */}
          <button
            className="btn mt-4"
            disabled={spinner}
            onClick={() => {
              setSpinner(true);
              createLeague()
                .then(() => {
                  setSpinner(false);
                  history.push(`/leagues?forceRootUpdate=true`);
                })
                .catch((err) => {
                  alert('Error:' + err?.message ?? err);
                  console.log(err);
                  setSpinner(false);
                });
            }}
          >
            {!spinner
              ? `Create League and Join${
                  leagueEntryCostInput ? ` by paying ${leagueEntryCostInput} SOL` : ''
                }`
              : 'Creating...'}
          </button>
        </Card.Body>
      </Card>
    </Layout>
  );
}
