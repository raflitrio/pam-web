import React from 'react';
import ReactDOM from 'react-dom/client';
import './pam-styles.css';
import App from './App';
import axios from 'axios';

axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
