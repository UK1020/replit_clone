import { pgTable, text, serial, integer, boolean, timestamp, real, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'restaurant_admin', 'delivery_partner']);
export const orderStatusEnum = pgEnum('order_status', ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']);
export const rewardTierEnum = pgEnum('reward_tier', ['bronze', 'silver', 'gold', 'platinum']);
export const loyaltyActionEnum = pgEnum('loyalty_action', ['sign_up', 'place_order', 'review', 'referral', 'birthday', 'streak', 'challenge_completed']);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default('customer'),
  address: text("address"),
  loyaltyPoints: integer("loyalty_points").default(0),
  rewardTier: rewardTierEnum("reward_tier").default('bronze'),
  streakCount: integer("streak_count").default(0),
  lastOrderDate: timestamp("last_order_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Restaurants
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  imageUrl: text("image_url"),
  cuisineTypes: text("cuisine_types").notNull(),
  priceForTwo: integer("price_for_two").notNull(),
  rating: real("rating"),
  deliveryTime: integer("delivery_time").notNull(),
  isOpen: boolean("is_open").default(true).notNull(),
  ownerId: integer("owner_id").references(() => users.id),
});

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
});

// Menu Items
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  imageUrl: text("image_url"),
  isVeg: boolean("is_veg").default(false).notNull(),
  restaurantId: integer("restaurant_id").references(() => restaurants.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  restaurantId: integer("restaurant_id").references(() => restaurants.id).notNull(),
  status: orderStatusEnum("status").default('placed').notNull(),
  amount: real("amount").notNull(),
  deliveryFee: real("delivery_fee").notNull(),
  tax: real("tax").notNull(),
  discount: real("discount").default(0).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryPartnerId: integer("delivery_partner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  menuItemId: integer("menu_item_id").references(() => menuItems.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});

// Loyalty Points Activities
export const loyaltyActivities = pgTable("loyalty_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: loyaltyActionEnum("action").notNull(),
  points: integer("points").notNull(),
  description: text("description"),
  orderId: integer("order_id").references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Rewards
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pointsCost: integer("points_cost").notNull(),
  discountAmount: real("discount_amount"),
  discountPercentage: real("discount_percentage"),
  validFor: integer("valid_for_days"), // Number of days reward is valid after redemption
  minimumTier: rewardTierEnum("minimum_tier").default('bronze'),
  isActive: boolean("is_active").default(true).notNull(),
  imageUrl: text("image_url"),
});

// User Rewards
export const userRewards = pgTable("user_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rewardId: integer("reward_id").references(() => rewards.id).notNull(),
  redeemed: boolean("redeemed").default(false).notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at"),
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Challenges
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  targetCount: integer("target_count").notNull(), // Number of actions needed to complete
  actionType: text("action_type").notNull(), // Type of action (e.g., "order", "review")
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  minimumTier: rewardTierEnum("minimum_tier").default('bronze'),
  isActive: boolean("is_active").default(true).notNull(),
  imageUrl: text("image_url"),
});

// User Challenge Progress
export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  currentCount: integer("current_count").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cart (will be stored in session, not in database)
export const cartItemSchema = z.object({
  menuItemId: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  isVeg: z.boolean(),
  restaurantId: z.number(),
  restaurantName: z.string().optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Insert Schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

export const insertRestaurantSchema = createInsertSchema(restaurants)
  .omit({ id: true });

export const insertCategorySchema = createInsertSchema(categories)
  .omit({ id: true });

export const insertMenuItemSchema = createInsertSchema(menuItems)
  .omit({ id: true });

export const insertOrderSchema = createInsertSchema(orders)
  .omit({ id: true, createdAt: true });

export const insertOrderItemSchema = createInsertSchema(orderItems)
  .omit({ id: true });

export const insertLoyaltyActivitySchema = createInsertSchema(loyaltyActivities)
  .omit({ id: true, createdAt: true });

export const insertRewardSchema = createInsertSchema(rewards)
  .omit({ id: true });

export const insertUserRewardSchema = createInsertSchema(userRewards)
  .omit({ id: true, createdAt: true });

export const insertChallengeSchema = createInsertSchema(challenges)
  .omit({ id: true });

export const insertUserChallengeSchema = createInsertSchema(userChallenges)
  .omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type LoyaltyActivity = typeof loyaltyActivities.$inferSelect;
export type InsertLoyaltyActivity = z.infer<typeof insertLoyaltyActivitySchema>;

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;

export type UserReward = typeof userRewards.$inferSelect;
export type InsertUserReward = z.infer<typeof insertUserRewardSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
