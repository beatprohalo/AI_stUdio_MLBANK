import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/index.css';

console.log('Starting AI Music Studio...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Could not find root element to mount to");
  throw new Error("Could not find root element to mount to");
}

console.log('Root element found:', rootElement);

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('React root created');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
}