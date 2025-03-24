import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertRestaurantSchema, 
  insertMenuItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertLoyaltyActivitySchema,
  insertRewardSchema,
  insertUserRewardSchema,
  insertChallengeSchema,
  insertUserChallengeSchema,
  cartItemSchema
} from "@shared/schema";
import { ZodError } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user has the required role
const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && req.user && roles.includes(req.user.role)) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Cart management in session
  app.get("/api/cart", (req, res) => {
    const cart = req.session.cart || [];
    res.json(cart);
  });

  app.post("/api/cart", (req, res) => {
    try {
      const item = cartItemSchema.parse(req.body);
      
      // Initialize cart if it doesn't exist
      if (!req.session.cart) {
        req.session.cart = [];
      }
      
      // Check if item from same restaurant
      if (req.session.cart.length > 0 && 
          req.session.cart[0].restaurantId !== item.restaurantId) {
        return res.status(400).json({ 
          message: "Cannot add items from different restaurants to cart" 
        });
      }
      
      // Check if item already in cart and update quantity
      const existingItemIndex = req.session.cart.findIndex(
        cartItem => cartItem.menuItemId === item.menuItemId
      );
      
      if (existingItemIndex !== -1) {
        req.session.cart[existingItemIndex].quantity += item.quantity;
      } else {
        req.session.cart.push(item);
      }
      
      res.status(201).json(req.session.cart);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "An error occurred" });
      }
    }
  });

  app.put("/api/cart/:menuItemId", (req, res) => {
    try {
      const { menuItemId } = req.params;
      const { quantity } = req.body;
      
      if (!req.session.cart) {
        return res.status(404).json({ message: "Cart is empty" });
      }
      
      const itemIndex = req.session.cart.findIndex(
        item => item.menuItemId === parseInt(menuItemId)
      );
      
      if (itemIndex === -1) {
        return res.status(404).json({ message: "Item not found in cart" });
      }
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        req.session.cart.splice(itemIndex, 1);
      } else {
        // Update quantity
        req.session.cart[itemIndex].quantity = quantity;
      }
      
      res.json(req.session.cart);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.delete("/api/cart", (req, res) => {
    req.session.cart = [];
    res.json([]);
  });

  app.delete("/api/cart/:menuItemId", (req, res) => {
    const { menuItemId } = req.params;
    
    if (!req.session.cart) {
      return res.status(404).json({ message: "Cart is empty" });
    }
    
    req.session.cart = req.session.cart.filter(
      item => item.menuItemId !== parseInt(menuItemId)
    );
    
    res.json(req.session.cart);
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });
  
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.getCategory(parseInt(id));
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Error fetching category" });
    }
  });

  // Restaurants API
  app.get("/api/restaurants", async (req, res) => {
    try {
      const { query, categoryId } = req.query;
      let restaurants;
      
      if (query && typeof query === 'string') {
        // Convert query to lowercase for case-insensitive search
        const searchQuery = query.toLowerCase();
        restaurants = await storage.searchRestaurants(searchQuery);
      } else if (categoryId && typeof categoryId === 'string') {
        // Filter restaurants by category
        const category = parseInt(categoryId);
        restaurants = await storage.getRestaurantsByCategory(category);
      } else {
        restaurants = await storage.getAllRestaurants();
      }
      
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: "Error fetching restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const restaurant = await storage.getRestaurant(parseInt(id));
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Error fetching restaurant" });
    }
  });

  app.post("/api/restaurants", isAuthenticated, hasRole(['restaurant_admin']), async (req, res) => {
    try {
      const restaurantData = insertRestaurantSchema.parse({
        ...req.body,
        ownerId: req.user!.id
      });
      
      const restaurant = await storage.createRestaurant(restaurantData);
      res.status(201).json(restaurant);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid restaurant data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating restaurant" });
      }
    }
  });

  app.put("/api/restaurants/:id", isAuthenticated, hasRole(['restaurant_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const restaurant = await storage.getRestaurant(parseInt(id));
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      // Verify ownership
      if (restaurant.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to update this restaurant" });
      }
      
      const updatedRestaurant = await storage.updateRestaurant(parseInt(id), req.body);
      res.json(updatedRestaurant);
    } catch (error) {
      res.status(500).json({ message: "Error updating restaurant" });
    }
  });

  // Menu Items API
  app.get("/api/restaurants/:id/menu", async (req, res) => {
    try {
      const { id } = req.params;
      const menuItems = await storage.getMenuItemsByRestaurant(parseInt(id));
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching menu items" });
    }
  });

  app.post("/api/menu-items", isAuthenticated, hasRole(['restaurant_admin']), async (req, res) => {
    try {
      const menuItemData = insertMenuItemSchema.parse(req.body);
      
      // Verify restaurant ownership
      const restaurant = await storage.getRestaurant(menuItemData.restaurantId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      if (restaurant.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to add items to this restaurant" });
      }
      
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating menu item" });
      }
    }
  });

  app.put("/api/menu-items/:id", isAuthenticated, hasRole(['restaurant_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const menuItem = await storage.getMenuItem(parseInt(id));
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      // Verify restaurant ownership
      const restaurant = await storage.getRestaurant(menuItem.restaurantId);
      
      if (!restaurant || restaurant.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to update this menu item" });
      }
      
      const updatedMenuItem = await storage.updateMenuItem(parseInt(id), req.body);
      res.json(updatedMenuItem);
    } catch (error) {
      res.status(500).json({ message: "Error updating menu item" });
    }
  });

  app.delete("/api/menu-items/:id", isAuthenticated, hasRole(['restaurant_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const menuItem = await storage.getMenuItem(parseInt(id));
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      // Verify restaurant ownership
      const restaurant = await storage.getRestaurant(menuItem.restaurantId);
      
      if (!restaurant || restaurant.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to delete this menu item" });
      }
      
      await storage.deleteMenuItem(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting menu item" });
    }
  });

  // Orders API
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      let orders;
      
      // Different queries based on user role
      if (req.user!.role === 'customer') {
        orders = await storage.getOrdersByUser(req.user!.id);
      } else if (req.user!.role === 'restaurant_admin') {
        // Get all restaurants owned by the admin
        const userRestaurants = await storage.getRestaurantsByOwner(req.user!.id);
        
        if (userRestaurants.length === 0) {
          return res.json([]);
        }
        
        // Get orders for all restaurants owned by the admin
        // For simplicity, just getting orders for the first restaurant
        orders = await storage.getOrdersByRestaurant(userRestaurants[0].id);
      } else if (req.user!.role === 'delivery_partner') {
        orders = await storage.getOrdersByDeliveryPartner(req.user!.id);
      } else {
        return res.status(403).json({ message: "Unauthorized role" });
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(parseInt(id));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check permission based on role
      if (req.user!.role === 'customer' && order.userId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to view this order" });
      } else if (req.user!.role === 'restaurant_admin') {
        const restaurant = await storage.getRestaurant(order.restaurantId);
        if (!restaurant || restaurant.ownerId !== req.user!.id) {
          return res.status(403).json({ message: "You don't have permission to view this order" });
        }
      } else if (req.user!.role === 'delivery_partner' && order.deliveryPartnerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to view this order" });
      }
      
      // Get order items
      const items = await storage.getOrderItems(order.id);
      
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  app.post("/api/orders", isAuthenticated, hasRole(['customer']), async (req, res) => {
    try {
      // Validate cart is not empty
      if (!req.session.cart || req.session.cart.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      const cart = req.session.cart;
      
      // Calculate order totals
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryFee = 30; // Fixed delivery fee
      const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
      const discount = 0; // No discount by default
      const total = subtotal + deliveryFee + tax - discount;
      
      // Create order
      const orderData = {
        userId: req.user!.id,
        restaurantId: cart[0].restaurantId,
        status: 'placed' as const,
        amount: total,
        deliveryFee,
        tax,
        discount,
        deliveryAddress: req.body.deliveryAddress,
        // deliveryPartnerId will be assigned later
      };
      
      // Create order items
      const orderItemsData = cart.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price
      }));
      
      const order = await storage.createOrder(orderData, orderItemsData);
      
      // Clear cart after successful order
      req.session.cart = [];
      
      // Award loyalty points for the order
      try {
        const pointsAwarded = Math.floor(order.amount * 10); // 10 points per dollar spent
        await storage.addLoyaltyPoints(
          req.user!.id,
          'place_order',
          pointsAwarded,
          `Order #${order.id} completed`,
          order.id
        );
      } catch (loyaltyError) {
        console.error("Error awarding loyalty points:", loyaltyError);
        // Don't fail the entire order if loyalty points fail
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating order" });
      }
    }
  });

  app.put("/api/orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.getOrder(parseInt(id));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check permissions based on role and requested status change
      if (req.user!.role === 'restaurant_admin') {
        // Restaurant admin can only update to 'confirmed', 'preparing', or 'cancelled'
        const allowedStatuses = ['confirmed', 'preparing', 'cancelled'];
        
        if (!allowedStatuses.includes(status)) {
          return res.status(403).json({ message: "You can't update to this status" });
        }
        
        // Verify restaurant ownership
        const restaurant = await storage.getRestaurant(order.restaurantId);
        
        if (!restaurant || restaurant.ownerId !== req.user!.id) {
          return res.status(403).json({ message: "You don't have permission to update this order" });
        }
      } else if (req.user!.role === 'delivery_partner') {
        // Delivery partner can only update to 'out_for_delivery' or 'delivered'
        const allowedStatuses = ['out_for_delivery', 'delivered'];
        
        if (!allowedStatuses.includes(status)) {
          return res.status(403).json({ message: "You can't update to this status" });
        }
        
        // Verify delivery partner assignment
        if (order.deliveryPartnerId !== req.user!.id) {
          return res.status(403).json({ message: "You're not assigned to this order" });
        }
      } else {
        return res.status(403).json({ message: "You don't have permission to update order status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(parseInt(id), status as any);
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Error updating order status" });
    }
  });

  app.post("/api/orders/:id/assign", isAuthenticated, hasRole(['restaurant_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { deliveryPartnerId } = req.body;
      
      if (!deliveryPartnerId) {
        return res.status(400).json({ message: "Delivery partner ID is required" });
      }
      
      const order = await storage.getOrder(parseInt(id));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Verify restaurant ownership
      const restaurant = await storage.getRestaurant(order.restaurantId);
      
      if (!restaurant || restaurant.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to assign delivery partners to this order" });
      }
      
      // Verify delivery partner exists and has the correct role
      const deliveryPartner = await storage.getUser(deliveryPartnerId);
      
      if (!deliveryPartner || deliveryPartner.role !== 'delivery_partner') {
        return res.status(400).json({ message: "Invalid delivery partner" });
      }
      
      // Update order with delivery partner
      const updatedOrder = await storage.updateOrderStatus(
        parseInt(id), 
        order.status, 
        deliveryPartnerId
      );
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Error assigning delivery partner" });
    }
  });

  // Delivery partners API (for restaurant admins)
  app.get("/api/delivery-partners", isAuthenticated, hasRole(['restaurant_admin']), async (req, res) => {
    try {
      const deliveryPartners = await storage.getAllDeliveryPartners();
      // Don't send passwords in response
      const safeDeliveryPartners = deliveryPartners.map(({ password, ...rest }) => rest);
      res.json(safeDeliveryPartners);
    } catch (error) {
      res.status(500).json({ message: "Error fetching delivery partners" });
    }
  });

  // User profile API
  app.get("/api/profile", isAuthenticated, (req, res) => {
    // Don't send password in response
    const { password, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });

  app.put("/api/profile", isAuthenticated, async (req, res) => {
    try {
      // Only allow updating certain fields
      const allowedFields = ['fullName', 'email', 'phone', 'address'];
      const updateData: Record<string, any> = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const updatedUser = await storage.updateUser(req.user!.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating profile" });
    }
  });
  
  // Loyalty Points API
  app.get("/api/loyalty/points", isAuthenticated, async (req, res) => {
    try {
      const points = await storage.getUserLoyaltyPoints(req.user!.id);
      const user = await storage.getUser(req.user!.id);
      res.json({ 
        points, 
        tier: user?.rewardTier || 'bronze',
        streakCount: user?.streakCount || 0
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching loyalty points" });
    }
  });

  app.get("/api/loyalty/activities", isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getLoyaltyActivitiesByUser(req.user!.id);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching loyalty activities" });
    }
  });

  // Rewards API
  app.get("/api/rewards", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      const rewards = await storage.getRewardsByTier(user?.rewardTier || 'bronze');
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Error fetching rewards" });
    }
  });

  app.get("/api/user-rewards", isAuthenticated, async (req, res) => {
    try {
      const userRewards = await storage.getUserRewards(req.user!.id);
      res.json(userRewards);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user rewards" });
    }
  });

  app.post("/api/rewards/:id/redeem", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userReward = await storage.redeemReward(req.user!.id, parseInt(id));
      
      if (!userReward) {
        return res.status(400).json({ message: "Could not redeem reward. Check if you have enough points." });
      }
      
      res.status(201).json(userReward);
    } catch (error) {
      res.status(500).json({ message: "Error redeeming reward" });
    }
  });

  app.post("/api/rewards/verify", isAuthenticated, async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Reward code is required" });
      }
      
      const userReward = await storage.verifyRewardCode(code);
      
      if (!userReward) {
        return res.status(404).json({ message: "Invalid or expired reward code" });
      }
      
      res.json(userReward);
    } catch (error) {
      res.status(500).json({ message: "Error verifying reward code" });
    }
  });

  // Challenges API
  app.get("/api/challenges", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      const challenges = await storage.getAvailableChallenges(user?.rewardTier || 'bronze');
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Error fetching challenges" });
    }
  });

  app.get("/api/user-challenges", isAuthenticated, async (req, res) => {
    try {
      const userChallenges = await storage.getActiveUserChallenges(req.user!.id);
      res.json(userChallenges);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user challenges" });
    }
  });

  app.post("/api/challenges/:id/progress", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedProgress = await storage.updateUserChallengeProgress(req.user!.id, parseInt(id));
      
      if (!updatedProgress) {
        return res.status(404).json({ message: "Challenge not found or not enrolled" });
      }
      
      res.json(updatedProgress);
    } catch (error) {
      res.status(500).json({ message: "Error updating challenge progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
