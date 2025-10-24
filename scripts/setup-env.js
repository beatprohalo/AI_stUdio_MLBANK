// Setup environment for development
// This script helps resolve env.mjs issues

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple .env file if it doesn't exist
const envPath = path.join(__dirname, '..', '.env');
const envContent = `# Environment variables for AI Music Studio
NODE_ENV=development
VITE_APP_TITLE=AI Music Studio
VITE_APP_VERSION=1.0.0
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('Created .env file');
}

console.log('Environment setup complete');
