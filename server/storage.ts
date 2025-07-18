import { plantIdentifications, userUsage, type PlantIdentification, type InsertPlantIdentification, type UserUsage, type InsertUserUsage } from "@shared/schema";

export interface IStorage {
  // Plant identification methods
  createPlantIdentification(identification: InsertPlantIdentification): Promise<PlantIdentification>;
  getPlantIdentificationsByUser(userId: string, limit?: number): Promise<PlantIdentification[]>;
  
  // User usage methods
  getUserUsage(userId: string): Promise<UserUsage | undefined>;
  createUserUsage(usage: InsertUserUsage): Promise<UserUsage>;
  updateUserUsage(userId: string, updates: Partial<UserUsage>): Promise<UserUsage>;
  incrementTotalUsage(userId: string): Promise<UserUsage>;
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
      totalCount: usage.totalCount || 0,
      isPremium: usage.isPremium || false,
      remainingFree: usage.remainingFree || 3,
      premiumMonthlyCount: usage.premiumMonthlyCount || 0,
      premiumResetDate: usage.premiumResetDate || null,
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

  async incrementTotalUsage(userId: string): Promise<UserUsage> {
    let usage = await this.getUserUsage(userId);
    
    if (!usage) {
      // Create new user record
      usage = await this.createUserUsage({
        userId,
        totalCount: 1,
        isPremium: false,
      });
    } else {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Reset premium monthly count if it's a new month
      let premiumMonthlyCount = usage.premiumMonthlyCount || 0;
      if (usage.premiumResetDate !== currentMonthKey) {
        premiumMonthlyCount = 0;
      }

      // Increment total count and handle premium limits
      usage = await this.updateUserUsage(userId, {
        totalCount: usage.totalCount + 1,
        remainingFree: usage.isPremium ? usage.remainingFree : Math.max(0, (usage.remainingFree || 3) - 1),
        premiumMonthlyCount: usage.isPremium ? premiumMonthlyCount + 1 : premiumMonthlyCount,
        premiumResetDate: usage.isPremium ? currentMonthKey : usage.premiumResetDate
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

  // Check if user has reached 3 total uses (free users) or monthly limit (premium users)
  hasReachedLimit(usage: UserUsage): boolean {
    if (!usage.isPremium) {
      return usage.totalCount >= 3;
    }
    // Premium users get 100 identifications per month
    return (usage.premiumMonthlyCount || 0) >= 100;
  }
}

export const storage = new MemStorage();
