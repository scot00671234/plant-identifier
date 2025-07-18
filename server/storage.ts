import { plantIdentifications, userUsage, type PlantIdentification, type InsertPlantIdentification, type UserUsage, type InsertUserUsage } from "@shared/schema";

export interface IStorage {
  // Plant identification methods
  createPlantIdentification(identification: InsertPlantIdentification): Promise<PlantIdentification>;
  getPlantIdentificationsByUser(userId: string, limit?: number): Promise<PlantIdentification[]>;
  
  // User usage methods
  getUserUsage(userId: string): Promise<UserUsage | undefined>;
  createUserUsage(usage: InsertUserUsage): Promise<UserUsage>;
  updateUserUsage(userId: string, updates: Partial<UserUsage>): Promise<UserUsage>;
  incrementDailyUsage(userId: string): Promise<UserUsage>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<UserUsage>;
  updateUserStripeInfo(userId: string, stripeInfo: { customerId: string; subscriptionId: string }): Promise<UserUsage>;
}

export class MemStorage implements IStorage {
  private plantIdentifications: Map<number, PlantIdentification>;
  private userUsages: Map<string, UserUsage>;
  private currentPlantId: number;
  private currentUsageId: number;

  constructor() {
    this.plantIdentifications = new Map();
    this.userUsages = new Map();
    this.currentPlantId = 1;
    this.currentUsageId = 1;
  }

  async createPlantIdentification(identification: InsertPlantIdentification): Promise<PlantIdentification> {
    const id = this.currentPlantId++;
    const plant: PlantIdentification = {
      ...identification,
      id,
      createdAt: new Date(),
      type: identification.type || null,
      origin: identification.origin || null,
      description: identification.description || null,
      commonName: identification.commonName || null,
      family: identification.family || null,
    };
    this.plantIdentifications.set(id, plant);
    return plant;
  }

  async getPlantIdentificationsByUser(userId: string, limit = 10): Promise<PlantIdentification[]> {
    return Array.from(this.plantIdentifications.values())
      .filter((plant) => plant.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getUserUsage(userId: string): Promise<UserUsage | undefined> {
    return this.userUsages.get(userId);
  }

  async createUserUsage(usage: InsertUserUsage): Promise<UserUsage> {
    const id = this.currentUsageId++;
    const userUsage: UserUsage = { 
      ...usage, 
      id,
      dailyCount: usage.dailyCount || 0,
      isPremium: usage.isPremium || false,
      trialStartDate: usage.trialStartDate || null,
      trialExpired: usage.trialExpired || false,
      stripeCustomerId: usage.stripeCustomerId || null,
      stripeSubscriptionId: usage.stripeSubscriptionId || null,
    };
    this.userUsages.set(usage.userId, userUsage);
    return userUsage;
  }

  async updateUserUsage(userId: string, updates: Partial<UserUsage>): Promise<UserUsage> {
    const existing = this.userUsages.get(userId);
    if (!existing) {
      throw new Error("User usage not found");
    }
    const updated = { ...existing, ...updates };
    this.userUsages.set(userId, updated);
    return updated;
  }

  async incrementDailyUsage(userId: string): Promise<UserUsage> {
    const today = new Date().toISOString().split('T')[0];
    let usage = await this.getUserUsage(userId);
    
    if (!usage) {
      // Start trial for new user
      usage = await this.startTrial(userId);
      usage = await this.updateUserUsage(userId, { dailyCount: 1 });
    } else if (usage.lastResetDate !== today) {
      // Reset daily count for new day
      usage = await this.updateUserUsage(userId, {
        dailyCount: 1,
        lastResetDate: today,
      });
    } else {
      // Increment count for same day
      usage = await this.updateUserUsage(userId, {
        dailyCount: usage.dailyCount + 1,
      });
    }
    
    return usage;
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<UserUsage> {
    return this.updateUserUsage(userId, { stripeCustomerId: customerId });
  }

  async updateUserStripeInfo(userId: string, stripeInfo: { customerId: string; subscriptionId: string }): Promise<UserUsage> {
    return this.updateUserUsage(userId, { 
      stripeCustomerId: stripeInfo.customerId, 
      stripeSubscriptionId: stripeInfo.subscriptionId 
    });
  }

  // Check if user is in trial period (5 days)
  isInTrialPeriod(usage: UserUsage): boolean {
    if (!usage.trialStartDate || usage.trialExpired) return false;
    
    const trialStart = new Date(usage.trialStartDate);
    const now = new Date();
    const diffTime = now.getTime() - trialStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 5;
  }

  // Start trial for new user
  async startTrial(userId: string): Promise<UserUsage> {
    const today = new Date().toISOString().split('T')[0];
    return this.createUserUsage({
      userId,
      dailyCount: 0,
      lastResetDate: today,
      isPremium: false,
      trialStartDate: today,
      trialExpired: false,
    });
  }
}

export const storage = new MemStorage();
