import React, { FunctionComponent, useEffect, useState } from 'react';
import { Card, Alert } from 'react-bootstrap';
import { PublicKey } from '@solana/web3.js';
import { Layout } from '../Layout';
import MetaMaskOnboarding from '@metamask/onboarding';

export const Wallet: FunctionComponent<{}> = (props) => {
  const [buttonText, setButtonText] = React.useState(ONBOARD_TEXT);
  const [MOTD, setMOTD] = React.useState("Welcome Coach");


  // React.useEffect(() => {
  //   function handleNewAccounts(newAccounts) {
  //     setAccounts(newAccounts);
  //   }
  //   if (MetaMaskOnboarding.isMetaMaskInstalled()) {
  //     window.ethereum
  //       .request({ method: 'eth_requestAccounts' })
  //       .then(handleNewAccounts);
  //     window.ethereum.on('accountsChanged', handleNewAccounts);
  //     return () => {
  //       window.ethereum.off('accountsChanged', handleNewAccounts);
  //     };
  //   }
  // }, []);

  // const onClick = () => {
  //   console.log(`button is pressed~`);
  //   if (MetaMaskOnboarding.isMetaMaskInstalled()) {
  //     window.ethereum
  //       .request({ method: 'eth_requestAccounts' })
  //       .then((newAccounts) => setAccounts(newAccounts));
  //   } else {
  //     onboarding.current.startOnboarding();
  //   }
  // };

  const updateMOTD = () => {
    let phrases: string[] = [
      "RIP the GOAT - Kobe Bryant",
      "Well, at least you're not Belichick",
    ];
    console.log(`${phrases[Math.round(Math.random())]}`)
    setMOTD(phrases[Math.round(Math.random())])
  }

  const MetaMaskOnboarding = () => {
    onboarding.current == undefined ?
    onboarding.current = new MetaMaskOnboarding() 
    : onboarding.current = undefined;
  }

  return (
    <Layout heading="Wallet">
      <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Card.Header onClick={updateMOTD}>
            {MOTD} 
          </Card.Header>
        <Card.Body>
          Connect to Metamask
          <button disabled={isDisabled} onClick={onClick}>{buttonText}</button>
        </Card.Body>
      </Card>
    </Layout>
  );
};
