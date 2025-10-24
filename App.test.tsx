import React from 'react';
import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test('renders App component and checks initial state', () => {
  const { container } = render(<App />);
  const apiKeyInput = container.querySelector('#api-key-input');
  expect(apiKeyInput).toBeDefined();
});
