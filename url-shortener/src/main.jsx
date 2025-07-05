import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import loggingMiddleware from './LoggingMiddleware.js';

// Initialize logging
loggingMiddleware.info('Application starting');

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <App />
  </StrictMode>
); 