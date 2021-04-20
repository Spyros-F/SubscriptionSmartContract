import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {Web3ReactProvider} from '@web3-react/core'
import {setProvider} from './services/provider'
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={setProvider}>
      <App />
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root')
);