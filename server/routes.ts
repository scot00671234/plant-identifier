import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlantIdentificationSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";
import OpenAI from "openai";

const identifyPlantSchema = z.object({
  imageBase64: z.string(),
  userId: z.string(),
});

// Initialize Stripe (conditionally)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
  });
}

// Initialize OpenAI (conditionally)
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Save plant identification result (TensorFlow.js does the actual classification)
  app.post("/api/save-identification", async (req, res) => {
    try {
      const { imageBase64, userId, scientificName, commonName, confidence, family, description, origin, type } = req.body;
      
      // Check usage limits 
      let usage = await storage.getUserUsage(userId);
      
      if (!usage) {
        // Create new user record
        usage = await storage.createUserUsage({
          userId,
          totalCount: 0,
          isPremium: false,
        });
      }
      
      // Check if user has reached their limits
      if (storage.hasReachedLimit(usage)) {
        const message = usage.isPremium 
          ? "You've reached your monthly limit of 100 plant identifications. Your limit will reset next month."
          : "You have used all 3 free plant identifications. Upgrade to premium for 100 monthly identifications.";
        return res.status(429).json({ 
          error: usage.isPremium ? "Monthly limit reached" : "Free limit reached", 
          message 
        });
      }

      // Plant data comes from TensorFlow.js client-side classification
      const plantData = {
        scientificName,
        commonName,
        confidence,
        family,
        description,
        origin,
        type
      };

      // Save identification result
      const identification = await storage.createPlantIdentification({
        userId,
        imageUrl: `data:image/jpeg;base64,${imageBase64}`,
        scientificName: plantData.scientificName,
        commonName: plantData.commonName,
        confidence: plantData.confidence,
        family: plantData.family,
        description: plantData.description,
        origin: plantData.origin,
        type: plantData.type,
      });

      // Increment usage count
      const updatedUsage = await storage.incrementTotalUsage(userId);

      res.json({
        identification,
        usage: {
          totalCount: updatedUsage.totalCount,
          isPremium: updatedUsage.isPremium,
          remainingFree: updatedUsage.isPremium ? null : Math.max(0, 3 - updatedUsage.totalCount),
          premiumMonthlyCount: updatedUsage.isPremium ? updatedUsage.premiumMonthlyCount : null,
          premiumMonthlyLimit: updatedUsage.isPremium ? 100 : null,
        },
      });
    } catch (error) {
      console.error("Plant identification save error:", error);
      res.status(500).json({ 
        error: "Failed to save identification", 
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
          totalCount: 0,
          isPremium: false,
          remainingFree: 3,
        });
      }
      
      res.json({
        totalCount: usage.totalCount,
        isPremium: usage.isPremium,
        remainingFree: usage.isPremium ? null : Math.max(0, 3 - usage.totalCount),
        premiumMonthlyCount: usage.isPremium ? usage.premiumMonthlyCount : null,
        premiumMonthlyLimit: usage.isPremium ? 100 : null,
      });
    } catch (error) {
      console.error("Usage fetch error:", error);
      res.status(500).json({ error: "Failed to fetch usage" });
    }
  });

  // Stripe subscription endpoints
  app.post("/api/create-subscription", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables." });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      let usage = await storage.getUserUsage(userId);
      
      // Check if user already has a subscription
      if (usage?.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(usage.stripeSubscriptionId);
        
        if (subscription.status === 'active') {
          return res.json({
            subscriptionId: subscription.id,
            status: subscription.status,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
          });
        }
      }

      // Create or retrieve customer
      let customerId = usage?.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          metadata: { userId },
        });
        customerId = customer.id;
        
        if (usage) {
          await storage.updateStripeCustomerId(userId, customerId);
        } else {
          // Create new user usage record with customer ID
          usage = await storage.createUserUsage({
            userId,
            totalCount: 0,
            isPremium: false,
            stripeCustomerId: customerId,
          });
        }
      }

      // Create product first
      const product = await stripe.products.create({
        name: 'PlantID Premium',
        description: 'Unlimited plant identifications',
      });

      // Create price for the product
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: 499, // $4.99 per month
        recurring: {
          interval: 'month',
        },
        product: product.id,
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: price.id,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with subscription info
      if (usage) {
        await storage.updateUserStripeInfo(userId, {
          customerId,
          subscriptionId: subscription.id,
        });
      } else {
        // Create new user usage record with subscription info
        await storage.createUserUsage({
          userId,
          totalCount: 0,
          isPremium: false,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
        });
      }

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Subscription creation error:", error);
      res.status(500).json({ 
        error: "Failed to create subscription",
        message: error.message 
      });
    }
  });

  // Handle successful subscription
  app.post("/api/subscription-success", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!stripe) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      // Get user's subscription ID from storage
      const usage = await storage.getUserUsage(userId);
      
      if (!usage?.stripeSubscriptionId) {
        return res.status(400).json({ error: "No subscription found for user" });
      }

      // Verify subscription is active
      const subscription = await stripe.subscriptions.retrieve(usage.stripeSubscriptionId);
      
      if (subscription.status === 'active') {
        // Update user to premium
        await storage.updateUserUsage(userId, { isPremium: true });
        
        res.json({ 
          success: true,
          message: "Successfully upgraded to premium!" 
        });
      } else {
        res.status(400).json({ 
          error: "Subscription not active",
          status: subscription.status 
        });
      }
    } catch (error: any) {
      console.error("Subscription success error:", error);
      res.status(500).json({ 
        error: "Failed to process subscription",
        message: error.message 
      });
    }
  });

  // Cancel subscription endpoint
  app.post("/api/cancel-subscription", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!stripe) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      // Get user's subscription ID from storage
      const usage = await storage.getUserUsage(userId);
      
      if (!usage?.stripeSubscriptionId) {
        return res.status(400).json({ error: "No subscription found for user" });
      }

      // Cancel the subscription at period end
      const canceledSubscription = await stripe.subscriptions.update(
        usage.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      // Update user status to indicate cancellation pending
      await storage.updateUserUsage(userId, { 
        isPremium: false,
        stripeSubscriptionId: null
      });

      res.json({ 
        success: true,
        message: "Subscription will be canceled at the end of your billing period",
        cancelAt: canceledSubscription.cancel_at
      });
    } catch (error: any) {
      console.error("Subscription cancellation error:", error);
      res.status(500).json({ 
        error: "Failed to cancel subscription",
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
