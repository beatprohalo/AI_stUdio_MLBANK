import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple test component
const TestApp: React.FC = () => {
  console.log('TestApp rendering...');
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>AI Music Studio - Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e0e0e0' }}>
        <h2>Debug Info:</h2>
        <p>React version: {React.version}</p>
        <p>Current time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

console.log('Loading test app...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Could not find root element");
  document.body.innerHTML = '<h1>Error: Could not find root element</h1>';
} else {
  console.log('Root element found, creating React root...');
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<TestApp />);
    console.log('Test app rendered successfully');
  } catch (error) {
    console.error('Error rendering test app:', error);
    document.body.innerHTML = `<h1>Error: ${error}</h1>`;
  }
}
