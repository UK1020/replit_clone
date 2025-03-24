import { 
  users, restaurants, categories, menuItems, orders, orderItems,
  loyaltyActivities, rewards, userRewards, challenges, userChallenges
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, or, desc, asc, ilike } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import type { 
  User, InsertUser, Restaurant, InsertRestaurant,
  Category, InsertCategory, MenuItem, InsertMenuItem,
  Order, InsertOrder, OrderItem, InsertOrderItem,
  LoyaltyActivity, InsertLoyaltyActivity, Reward, InsertReward,
  UserReward, InsertUserReward, Challenge, InsertChallenge,
  UserChallenge, InsertUserChallenge
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

// Define storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllDeliveryPartners(): Promise<User[]>;
  
  // Restaurant methods
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getRestaurantsByOwner(ownerId: number): Promise<Restaurant[]>;
  getRestaurantsByCategory(categoryId: number): Promise<Restaurant[]>;
  getAllRestaurants(): Promise<Restaurant[]>;
  searchRestaurants(query: string): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Menu Item methods
  getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<void>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByRestaurant(restaurantId: number): Promise<Order[]>;
  getOrdersByDeliveryPartner(deliveryPartnerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder, orderItems: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: Order['status'], deliveryPartnerId?: number): Promise<Order | undefined>;
  
  // Order Item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  // Loyalty Points methods
  addLoyaltyPoints(userId: number, action: InsertLoyaltyActivity['action'], points: number, description?: string, orderId?: number): Promise<LoyaltyActivity>;
  getLoyaltyActivitiesByUser(userId: number): Promise<LoyaltyActivity[]>;
  getUserLoyaltyPoints(userId: number): Promise<number>;
  updateUserRewardTier(userId: number, tier: User['rewardTier']): Promise<User | undefined>;
  
  // Rewards methods
  getAllRewards(): Promise<Reward[]>;
  getRewardsByTier(tier: Reward['minimumTier']): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: number, reward: Partial<InsertReward>): Promise<Reward | undefined>;
  
  // User Rewards methods
  getUserRewards(userId: number): Promise<UserReward[]>;
  redeemReward(userId: number, rewardId: number): Promise<UserReward | undefined>;
  verifyRewardCode(code: string): Promise<UserReward | undefined>;
  
  // Challenges methods
  getActiveUserChallenges(userId: number): Promise<{challenge: Challenge, progress: UserChallenge}[]>;
  updateUserChallengeProgress(userId: number, challengeId: number): Promise<UserChallenge | undefined>;
  getAvailableChallenges(userTier: User['rewardTier']): Promise<Challenge[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// Implement DatabaseStorage
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getAllDeliveryPartners(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'delivery_partner'));
  }
  
  // Restaurant methods
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }
  
  async getRestaurantsByOwner(ownerId: number): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.ownerId, ownerId));
  }
  
  async getRestaurantsByCategory(categoryId: number): Promise<Restaurant[]> {
    return await db.select()
      .from(restaurants)
      .where(
        and(
          eq(restaurants.isOpen, true),
          or(
            eq(restaurants.primaryCategoryId, categoryId),
            like(restaurants.categories, `%${categoryId}%`)
          )
        )
      );
  }
  
  async getAllRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.isOpen, true));
  }
  
  async searchRestaurants(query: string): Promise<Restaurant[]> {
    // Using ilike for case-insensitive search
    return await db.select().from(restaurants).where(
      and(
        eq(restaurants.isOpen, true),
        or(
          ilike(restaurants.name, `%${query}%`),
          ilike(restaurants.cuisineTypes, `%${query}%`)
        )
      )
    );
  }
  
  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db.insert(restaurants).values(restaurant).returning();
    return newRestaurant;
  }
  
  async updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
    const [updatedRestaurant] = await db.update(restaurants)
      .set(restaurant)
      .where(eq(restaurants.id, id))
      .returning();
    return updatedRestaurant;
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  
  // Menu Item methods
  async getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
  }
  
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem;
  }
  
  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const [newMenuItem] = await db.insert(menuItems).values(menuItem).returning();
    return newMenuItem;
  }
  
  async updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const [updatedMenuItem] = await db.update(menuItems)
      .set(menuItem)
      .where(eq(menuItems.id, id))
      .returning();
    return updatedMenuItem;
  }
  
  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }
  
  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }
  
  async getOrdersByRestaurant(restaurantId: number): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.restaurantId, restaurantId))
      .orderBy(desc(orders.createdAt));
  }
  
  async getOrdersByDeliveryPartner(deliveryPartnerId: number): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.deliveryPartnerId, deliveryPartnerId))
      .orderBy(desc(orders.createdAt));
  }
  
  async createOrder(order: InsertOrder, orderItems: InsertOrderItem[]): Promise<Order> {
    // Start a transaction to ensure both order and items are created together
    const [newOrder] = await db.transaction(async (tx) => {
      const [order1] = await tx.insert(orders).values(order).returning();
      
      // Insert order items with the new order ID
      const orderItemsWithOrderId = orderItems.map(item => ({
        ...item,
        orderId: order1.id
      }));
      
      await tx.insert(orderItems).values(orderItemsWithOrderId);
      
      return [order1];
    });
    
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: Order['status'], deliveryPartnerId?: number): Promise<Order | undefined> {
    const updateData: Partial<Order> = { status };
    
    if (deliveryPartnerId) {
      updateData.deliveryPartnerId = deliveryPartnerId;
    }
    
    const [updatedOrder] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    
    return updatedOrder;
  }
  
  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  
  // Loyalty Points methods
  async addLoyaltyPoints(
    userId: number, 
    action: InsertLoyaltyActivity['action'], 
    points: number,
    description?: string,
    orderId?: number
  ): Promise<LoyaltyActivity> {
    // Start a transaction to update both loyalty activity and user points
    const [activity] = await db.transaction(async (tx) => {
      // Add loyalty activity record
      const [newActivity] = await tx.insert(loyaltyActivities)
        .values({
          userId,
          action,
          points,
          description,
          orderId
        })
        .returning();
      
      // Update user's loyalty points
      const user = await this.getUser(userId);
      if (user) {
        const newPoints = (user.loyaltyPoints || 0) + points;
        
        // Determine new tier based on points
        let newTier = user.rewardTier || 'bronze';
        if (newPoints >= 5000) {
          newTier = 'platinum';
        } else if (newPoints >= 2000) {
          newTier = 'gold';
        } else if (newPoints >= 500) {
          newTier = 'silver';
        }
        
        // Update user
        await tx.update(users)
          .set({
            loyaltyPoints: newPoints,
            rewardTier: newTier,
            lastOrderDate: action === 'place_order' ? new Date() : user.lastOrderDate
          })
          .where(eq(users.id, userId));
      }
      
      return [newActivity];
    });
    
    return activity;
  }
  
  async getLoyaltyActivitiesByUser(userId: number): Promise<LoyaltyActivity[]> {
    return await db.select()
      .from(loyaltyActivities)
      .where(eq(loyaltyActivities.userId, userId))
      .orderBy(desc(loyaltyActivities.createdAt));
  }
  
  async getUserLoyaltyPoints(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    return user?.loyaltyPoints || 0;
  }
  
  async updateUserRewardTier(userId: number, tier: User['rewardTier']): Promise<User | undefined> {
    return await this.updateUser(userId, { rewardTier: tier });
  }
  
  // Rewards methods
  async getAllRewards(): Promise<Reward[]> {
    return await db.select()
      .from(rewards)
      .where(eq(rewards.isActive, true));
  }
  
  async getRewardsByTier(tier: Reward['minimumTier']): Promise<Reward[]> {
    // Get rewards available to this tier (equal or lower tier requirements)
    const tierValues = {
      bronze: 1,
      silver: 2,
      gold: 3,
      platinum: 4
    };
    
    const userTierValue = tierValues[tier];
    
    return await db.select()
      .from(rewards)
      .where(
        and(
          eq(rewards.isActive, true),
          or(
            eq(rewards.minimumTier, 'bronze'),
            eq(rewards.minimumTier, 'silver').and(userTierValue >= 2),
            eq(rewards.minimumTier, 'gold').and(userTierValue >= 3),
            eq(rewards.minimumTier, 'platinum').and(userTierValue >= 4)
          )
        )
      );
  }
  
  async createReward(reward: InsertReward): Promise<Reward> {
    const [newReward] = await db.insert(rewards).values(reward).returning();
    return newReward;
  }
  
  async updateReward(id: number, reward: Partial<InsertReward>): Promise<Reward | undefined> {
    const [updatedReward] = await db.update(rewards)
      .set(reward)
      .where(eq(rewards.id, id))
      .returning();
    
    return updatedReward;
  }
  
  // User Rewards methods
  async getUserRewards(userId: number): Promise<UserReward[]> {
    return await db.select()
      .from(userRewards)
      .where(eq(userRewards.userId, userId));
  }
  
  async redeemReward(userId: number, rewardId: number): Promise<UserReward | undefined> {
    // Start a transaction
    const [userReward] = await db.transaction(async (tx) => {
      // Get user and reward
      const user = await this.getUser(userId);
      const reward = await tx.query.rewards.findFirst({
        where: eq(rewards.id, rewardId)
      });
      
      if (!user || !reward) {
        return [];
      }
      
      // Check if user has enough points
      if (user.loyaltyPoints < reward.pointsCost) {
        return [];
      }
      
      // Generate reward code
      const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };
      
      // Calculate expiration date
      const expiresAt = reward.validFor 
        ? new Date(Date.now() + reward.validFor * 24 * 60 * 60 * 1000)
        : null;
      
      // Create user reward
      const [newUserReward] = await tx.insert(userRewards)
        .values({
          userId,
          rewardId,
          code: generateCode(),
          expiresAt: expiresAt,
          redeemed: false
        })
        .returning();
      
      // Deduct points from user
      await tx.update(users)
        .set({
          loyaltyPoints: user.loyaltyPoints - reward.pointsCost
        })
        .where(eq(users.id, userId));
      
      // Create loyalty activity record for reward redemption
      await tx.insert(loyaltyActivities)
        .values({
          userId,
          action: 'place_order', // Using place_order as placeholder
          points: -reward.pointsCost,
          description: `Redeemed reward: ${reward.name}`
        });
      
      return [newUserReward];
    });
    
    return userReward;
  }
  
  async verifyRewardCode(code: string): Promise<UserReward | undefined> {
    const [userReward] = await db.select()
      .from(userRewards)
      .where(
        and(
          eq(userRewards.code, code),
          eq(userRewards.redeemed, false)
        )
      );
    
    if (userReward) {
      // Check if reward has expired
      if (userReward.expiresAt && new Date(userReward.expiresAt) < new Date()) {
        return undefined;
      }
      
      return userReward;
    }
    
    return undefined;
  }
  
  // Challenges methods
  async getActiveUserChallenges(userId: number): Promise<{challenge: Challenge, progress: UserChallenge}[]> {
    const results = await db.select({
      challenge: challenges,
      progress: userChallenges
    })
    .from(challenges)
    .innerJoin(
      userChallenges,
      and(
        eq(userChallenges.challengeId, challenges.id),
        eq(userChallenges.userId, userId)
      )
    )
    .where(
      and(
        eq(challenges.isActive, true),
        eq(userChallenges.completed, false)
      )
    );
    
    return results;
  }
  
  async updateUserChallengeProgress(userId: number, challengeId: number): Promise<UserChallenge | undefined> {
    // Start a transaction
    const [userChallenge] = await db.transaction(async (tx) => {
      // Get the challenge and user progress
      const challenge = await tx.query.challenges.findFirst({
        where: eq(challenges.id, challengeId)
      });
      
      const [userProgress] = await tx.select()
        .from(userChallenges)
        .where(
          and(
            eq(userChallenges.userId, userId),
            eq(userChallenges.challengeId, challengeId)
          )
        );
      
      if (!challenge || !userProgress) {
        return [];
      }
      
      // Update the progress
      const newCount = userProgress.currentCount + 1;
      const completed = newCount >= challenge.targetCount;
      
      const [updatedProgress] = await tx.update(userChallenges)
        .set({
          currentCount: newCount,
          completed,
          completedAt: completed ? new Date() : null
        })
        .where(
          and(
            eq(userChallenges.userId, userId),
            eq(userChallenges.challengeId, challengeId)
          )
        )
        .returning();
      
      // If challenge is completed, add reward points
      if (completed) {
        await this.addLoyaltyPoints(
          userId,
          'challenge_completed',
          challenge.points,
          `Completed challenge: ${challenge.name}`
        );
      }
      
      return [updatedProgress];
    });
    
    return userChallenge;
  }
  
  async getAvailableChallenges(userTier: User['rewardTier']): Promise<Challenge[]> {
    // Get challenges available to this tier
    const tierValues = {
      bronze: 1,
      silver: 2,
      gold: 3,
      platinum: 4
    };
    
    const userTierValue = tierValues[userTier || 'bronze'];
    
    return await db.select()
      .from(challenges)
      .where(
        and(
          eq(challenges.isActive, true),
          or(
            eq(challenges.minimumTier, 'bronze'),
            eq(challenges.minimumTier, 'silver').and(userTierValue >= 2),
            eq(challenges.minimumTier, 'gold').and(userTierValue >= 3),
            eq(challenges.minimumTier, 'platinum').and(userTierValue >= 4)
          )
        )
      );
  }
}

// Export the storage instance
export const storage = new DatabaseStorage();
