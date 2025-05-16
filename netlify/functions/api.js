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