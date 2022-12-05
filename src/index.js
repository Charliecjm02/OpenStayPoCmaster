import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter } from "react-router-dom";
import { NotificationProvider } from 'web3uikit';
import { UserProvider } from './contexts/userContext';
import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider } from '@web3-react/core';

export default function getLibrary(provider) {
  const library = new Web3Provider(provider, 'any');
  library.pollingInterval = 15000;
  return library;
}

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <NotificationProvider >
        <HashRouter>
          <UserProvider>
            <App />
          </UserProvider>
        </HashRouter>
      </NotificationProvider>
    </Web3ReactProvider>
  </React.StrictMode >,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
