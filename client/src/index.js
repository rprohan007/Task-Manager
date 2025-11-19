import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // We removed <React.StrictMode> to ensure Drag-and-Drop works smoothly
  <ThemeProvider>
    <App />
  </ThemeProvider>
);