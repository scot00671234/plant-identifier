import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlantIdentificationSchema } from "@shared/schema";
import { z } from "zod";

const identifyPlantSchema = z.object({
  imageBase64: z.string(),
  userId: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Plant identification endpoint
  app.post("/api/identify-plant", async (req, res) => {
    try {
      const { imageBase64, userId } = identifyPlantSchema.parse(req.body);
      
      // Check usage limits
      const usage = await storage.getUserUsage(userId);
      const today = new Date().toISOString().split('T')[0];
      
      if (usage && !usage.isPremium && usage.lastResetDate === today && usage.dailyCount >= 3) {
        return res.status(429).json({ 
          error: "Daily limit reached", 
          message: "You have reached your daily limit of 3 free identifications. Upgrade to premium for unlimited access." 
        });
      }

      // Call Plant.id API
      const plantIdApiKey = process.env.PLANT_ID_API_KEY || process.env.VITE_PLANT_ID_API_KEY || "your-api-key-here";
      
      const response = await fetch('https://api.plant.id/v3/identification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': plantIdApiKey,
        },
        body: JSON.stringify({
          images: [imageBase64],
          similar_images: true,
          plant_details: ['common_names', 'url', 'description', 'taxonomy'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Plant.id API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.result?.classification?.suggestions?.length) {
        return res.status(400).json({ 
          error: "No plant identified", 
          message: "Could not identify a plant in this image. Please try with a clearer photo of a plant." 
        });
      }

      const suggestion = result.result.classification.suggestions[0];
      const confidence = Math.round(suggestion.probability * 100);

      // Save identification result
      const identification = await storage.createPlantIdentification({
        userId,
        imageUrl: `data:image/jpeg;base64,${imageBase64}`,
        scientificName: suggestion.name,
        commonName: suggestion.details?.common_names?.[0] || suggestion.name,
        confidence,
        family: suggestion.details?.taxonomy?.family,
        description: suggestion.details?.description?.value || "No description available",
        origin: suggestion.details?.taxonomy?.kingdom || "Unknown",
        type: suggestion.details?.taxonomy?.class || "Plant",
      });

      // Increment usage count
      const updatedUsage = await storage.incrementDailyUsage(userId);

      res.json({
        identification,
        usage: {
          dailyCount: updatedUsage.dailyCount,
          isPremium: updatedUsage.isPremium,
          remainingFree: updatedUsage.isPremium ? null : Math.max(0, 3 - updatedUsage.dailyCount),
        },
      });
    } catch (error) {
      console.error("Plant identification error:", error);
      res.status(500).json({ 
        error: "Identification failed", 
        message: error instanceof Error ? error.message : "An unexpected error occurred" 
      });
    }
  });

  // Get user's plant identification history
  app.get("/api/history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const identifications = await storage.getPlantIdentificationsByUser(userId, 10);
      res.json(identifications);
    } catch (error) {
      console.error("History fetch error:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Get user usage stats
  app.get("/api/usage/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const usage = await storage.getUserUsage(userId);
      
      if (!usage) {
        // Return default usage for new user
        return res.json({
          dailyCount: 0,
          isPremium: false,
          remainingFree: 3,
        });
      }

      const today = new Date().toISOString().split('T')[0];
      const dailyCount = usage.lastResetDate === today ? usage.dailyCount : 0;
      
      res.json({
        dailyCount,
        isPremium: usage.isPremium,
        remainingFree: usage.isPremium ? null : Math.max(0, 3 - dailyCount),
      });
    } catch (error) {
      console.error("Usage fetch error:", error);
      res.status(500).json({ error: "Failed to fetch usage" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
