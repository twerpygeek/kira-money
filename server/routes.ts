import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssetSchema, insertLiabilitySchema, settingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/assets", async (_req, res) => {
    try {
      const assets = await storage.getAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  app.get("/api/assets/:id", async (req, res) => {
    try {
      const asset = await storage.getAsset(req.params.id);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch asset" });
    }
  });

  app.post("/api/assets", async (req, res) => {
    try {
      const data = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(data);
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create asset" });
    }
  });

  app.patch("/api/assets/:id", async (req, res) => {
    try {
      const data = insertAssetSchema.partial().parse(req.body);
      const asset = await storage.updateAsset(req.params.id, data);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update asset" });
    }
  });

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAsset(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete asset" });
    }
  });

  app.get("/api/liabilities", async (_req, res) => {
    try {
      const liabilities = await storage.getLiabilities();
      res.json(liabilities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch liabilities" });
    }
  });

  app.get("/api/liabilities/:id", async (req, res) => {
    try {
      const liability = await storage.getLiability(req.params.id);
      if (!liability) {
        return res.status(404).json({ error: "Liability not found" });
      }
      res.json(liability);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch liability" });
    }
  });

  app.post("/api/liabilities", async (req, res) => {
    try {
      const data = insertLiabilitySchema.parse(req.body);
      const liability = await storage.createLiability(data);
      res.status(201).json(liability);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create liability" });
    }
  });

  app.patch("/api/liabilities/:id", async (req, res) => {
    try {
      const data = insertLiabilitySchema.partial().parse(req.body);
      const liability = await storage.updateLiability(req.params.id, data);
      if (!liability) {
        return res.status(404).json({ error: "Liability not found" });
      }
      res.json(liability);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update liability" });
    }
  });

  app.delete("/api/liabilities/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLiability(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Liability not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete liability" });
    }
  });

  app.get("/api/history", async (_req, res) => {
    try {
      const history = await storage.getHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const data = settingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(data);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  return httpServer;
}
