import React from 'react';
import ReactDOM from 'react-dom/client';
import DorkHunter from './app';
import './index.css'; // optionnel, si tu veux des styles globaux

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DorkHunter />
  </React.StrictMode>
);
