#!/bin/bash

# Prepare Network Designer project for Netlify deployment
echo "Preparing Network Designer for Netlify deployment..."

# Check if serverless-http is installed
if ! npm list serverless-http > /dev/null 2>&1; then
  echo "Installing serverless-http..."
  npm install serverless-http --save
fi

# Check if the netlify/functions directory exists
if [ ! -d "netlify/functions" ]; then
  echo "Creating netlify/functions directory..."
  mkdir -p netlify/functions
fi

# Make sure netlify.toml exists and has correct content
if [ ! -f "netlify.toml" ] || ! grep -q "functions = \"netlify/functions\"" netlify.toml; then
  echo "Creating/updating netlify.toml..."
  cat > netlify.toml << EOL
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[dev]
  command = "npm run dev"
  port = 5000

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOL
fi

# Create the API serverless function if it doesn't exist
if [ ! -f "netlify/functions/api.js" ]; then
  echo "Creating API serverless function..."
  cat > netlify/functions/api.js << EOL
const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const { storage } = require('../../server/storage');

// Initialize express app
const app = express();
app.use(bodyParser.json());

// API Routes
app.get('/api/diagrams', async (req, res) => {
  try {
    const diagrams = await storage.getAllNetworkDiagrams();
    res.json(diagrams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diagrams' });
  }
});

app.get('/api/diagrams/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const diagram = await storage.getNetworkDiagram(id);
    
    if (!diagram) {
      return res.status(404).json({ error: 'Diagram not found' });
    }
    
    res.json(diagram);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diagram' });
  }
});

app.post('/api/diagrams', async (req, res) => {
  try {
    const newDiagram = await storage.createNetworkDiagram(req.body);
    res.status(201).json(newDiagram);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create diagram' });
  }
});

app.put('/api/diagrams/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedDiagram = await storage.updateNetworkDiagram(id, req.body);
    
    if (!updatedDiagram) {
      return res.status(404).json({ error: 'Diagram not found' });
    }
    
    res.json(updatedDiagram);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update diagram' });
  }
});

app.delete('/api/diagrams/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteNetworkDiagram(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Diagram not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete diagram' });
  }
});

// Not found handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export the serverless handler
module.exports.handler = serverless(app);
EOL
fi

# Build the project
echo "Building the project..."
npm run build

echo "Project is now ready for Netlify deployment!"
echo "To deploy, run: netlify deploy"