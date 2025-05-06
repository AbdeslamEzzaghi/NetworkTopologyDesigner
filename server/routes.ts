import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { networkDiagramDataSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get('/api/diagrams', async (req, res) => {
    try {
      const diagrams = await storage.getAllNetworkDiagrams();
      res.json(diagrams);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get diagrams' });
    }
  });

  app.get('/api/diagrams/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const diagram = await storage.getNetworkDiagram(id);
      
      if (!diagram) {
        return res.status(404).json({ message: 'Diagram not found' });
      }
      
      res.json(diagram);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get diagram' });
    }
  });

  app.post('/api/diagrams', async (req, res) => {
    try {
      const parsedData = networkDiagramDataSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ message: 'Invalid diagram data', errors: parsedData.error.format() });
      }
      
      const name = req.body.name || 'Untitled Network Diagram';
      const { devices, connections, floorPlan } = parsedData.data;
      
      const newDiagram = await storage.createNetworkDiagram({
        userId: 1, // Default user ID since we don't have auth
        name,
        floorPlan,
        devices,
        connections,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      res.status(201).json(newDiagram);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create diagram' });
    }
  });

  app.put('/api/diagrams/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsedData = networkDiagramDataSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ message: 'Invalid diagram data', errors: parsedData.error.format() });
      }
      
      const name = req.body.name || 'Untitled Network Diagram';
      const { devices, connections, floorPlan } = parsedData.data;
      
      const updatedDiagram = await storage.updateNetworkDiagram(id, {
        name,
        floorPlan,
        devices,
        connections,
        updatedAt: new Date().toISOString()
      });
      
      if (!updatedDiagram) {
        return res.status(404).json({ message: 'Diagram not found' });
      }
      
      res.json(updatedDiagram);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update diagram' });
    }
  });

  app.delete('/api/diagrams/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNetworkDiagram(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Diagram not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete diagram' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
