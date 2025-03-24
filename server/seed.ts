import { db } from "./db";
import { users, restaurants, categories, menuItems } from "@shared/schema";
import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Check if there are existing users
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already seeded with users. Skipping...");
      return;
    }

    // Create sample users
    const sampleUsers = [
      {
        username: "customer",
        password: await hashPassword("password123"),
        email: "customer@example.com",
        fullName: "John Doe",
        phone: "1234567890",
        role: "customer" as const,
      },
      {
        username: "restaurant",
        password: await hashPassword("password123"),
        email: "restaurant@example.com",
        fullName: "Restaurant Owner",
        phone: "9876543210",
        role: "restaurant_admin" as const,
      },
      {
        username: "delivery",
        password: await hashPassword("password123"),
        email: "delivery@example.com",
        fullName: "Delivery Partner",
        phone: "5555555555",
        role: "delivery_partner" as const,
      },
    ];

    // Insert users
    const insertedUsers = await Promise.all(
      sampleUsers.map((user) => storage.createUser(user))
    );
    console.log(`Created ${insertedUsers.length} users`);

    // Create sample categories
    const sampleCategories = [
      {
        name: "Pizza",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&h=300&auto=format&fit=crop",
      },
      {
        name: "Burgers",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&h=300&auto=format&fit=crop",
      },
      {
        name: "Sushi",
        imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300&h=300&auto=format&fit=crop",
      },
      {
        name: "Indian",
        imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356c36?q=80&w=300&h=300&auto=format&fit=crop",
      },
      {
        name: "Chinese",
        imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=300&h=300&auto=format&fit=crop",
      },
      {
        name: "Mexican",
        imageUrl: "https://images.unsplash.com/photo-1586511925558-a4c6376fe65f?q=80&w=300&h=300&auto=format&fit=crop",
      },
    ];

    // Insert categories
    const insertedCategories = await Promise.all(
      sampleCategories.map((category) => storage.createCategory(category))
    );
    console.log(`Created ${insertedCategories.length} categories`);

    // Create sample restaurants
    const restaurantAdmin = insertedUsers.find(user => user.role === "restaurant_admin");
    if (!restaurantAdmin) {
      throw new Error("Restaurant admin user not found");
    }

    const sampleRestaurants = [
      {
        name: "Pizza Palace",
        description: "The best pizza in town with a variety of toppings.",
        address: "123 Main St, Anytown, USA",
        phone: "555-123-4567",
        cuisineTypes: "Italian, Pizza",
        priceForTwo: 500,
        deliveryTime: 30,
        isOpen: true,
        rating: 4.5,
        ownerId: restaurantAdmin.id,
        imageUrl: "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?q=80&w=800&auto=format&fit=crop",
      },
      {
        name: "Burger Barn",
        description: "Juicy burgers and crispy fries, perfect for a quick meal.",
        address: "456 Oak St, Anytown, USA",
        phone: "555-987-6543",
        cuisineTypes: "American, Fast Food",
        priceForTwo: 350,
        deliveryTime: 25,
        isOpen: true,
        rating: 4.2,
        ownerId: restaurantAdmin.id,
        imageUrl: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=800&auto=format&fit=crop",
      },
      {
        name: "Sushi Sensation",
        description: "Fresh and authentic Japanese sushi prepared by master chefs.",
        address: "789 Maple Ave, Anytown, USA",
        phone: "555-246-8010",
        cuisineTypes: "Japanese, Sushi",
        priceForTwo: 800,
        deliveryTime: 40,
        isOpen: true,
        rating: 4.7,
        ownerId: restaurantAdmin.id,
        imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=800&auto=format&fit=crop",
      },
      {
        name: "Spice of India",
        description: "Authentic Indian cuisine with a wide range of flavorful dishes.",
        address: "101 Pine St, Anytown, USA",
        phone: "555-369-2580",
        cuisineTypes: "Indian, Curry",
        priceForTwo: 600,
        deliveryTime: 35,
        isOpen: true,
        rating: 4.4,
        ownerId: restaurantAdmin.id,
        imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=800&auto=format&fit=crop",
      },
      {
        name: "Dragon House",
        description: "Delicious Chinese dishes prepared with traditional recipes.",
        address: "202 Cedar Rd, Anytown, USA",
        phone: "555-741-9630",
        cuisineTypes: "Chinese, Asian",
        priceForTwo: 450,
        deliveryTime: 30,
        isOpen: true,
        rating: 4.3,
        ownerId: restaurantAdmin.id,
        imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800&auto=format&fit=crop",
      },
      {
        name: "Taco Town",
        description: "Authentic Mexican street food and favorites.",
        address: "303 Elm Blvd, Anytown, USA",
        phone: "555-852-9631",
        cuisineTypes: "Mexican, Tex-Mex",
        priceForTwo: 400,
        deliveryTime: 25,
        isOpen: true,
        rating: 4.1,
        ownerId: restaurantAdmin.id,
        imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop",
      },
    ];

    // Insert restaurants
    const insertedRestaurants = await Promise.all(
      sampleRestaurants.map((restaurant) => storage.createRestaurant(restaurant))
    );
    console.log(`Created ${insertedRestaurants.length} restaurants`);

    // Create sample menu items for each restaurant
    const menuItemsToCreate = [];

    // Pizza Palace menu items
    const pizzaRestaurant = insertedRestaurants[0];
    const pizzaCategory = insertedCategories.find(cat => cat.name === "Pizza");
    if (pizzaRestaurant && pizzaCategory) {
      menuItemsToCreate.push(
        {
          name: "Margherita Pizza",
          description: "Classic pizza with tomato sauce, mozzarella, and basil.",
          price: 320,
          isVeg: true,
          imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=500&auto=format&fit=crop",
          restaurantId: pizzaRestaurant.id,
          categoryId: pizzaCategory.id,
        },
        {
          name: "Pepperoni Pizza",
          description: "Traditional pizza topped with pepperoni slices.",
          price: 380,
          isVeg: false,
          imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=500&auto=format&fit=crop",
          restaurantId: pizzaRestaurant.id,
          categoryId: pizzaCategory.id,
        },
        {
          name: "Vegetable Supreme",
          description: "Loaded with bell peppers, mushrooms, olives, and onions.",
          price: 360,
          isVeg: true,
          imageUrl: "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=500&auto=format&fit=crop",
          restaurantId: pizzaRestaurant.id,
          categoryId: pizzaCategory.id,
        },
        {
          name: "Chicken BBQ Pizza",
          description: "Tangy BBQ sauce, grilled chicken, red onions, and cilantro.",
          price: 420,
          isVeg: false,
          imageUrl: "https://images.unsplash.com/photo-1594007654729-407eedc4fe24?q=80&w=500&auto=format&fit=crop",
          restaurantId: pizzaRestaurant.id,
          categoryId: pizzaCategory.id,
        }
      );
    }

    // Burger Barn menu items
    const burgerRestaurant = insertedRestaurants[1];
    const burgerCategory = insertedCategories.find(cat => cat.name === "Burgers");
    if (burgerRestaurant && burgerCategory) {
      menuItemsToCreate.push(
        {
          name: "Classic Cheeseburger",
          description: "Beef patty with cheddar cheese, lettuce, tomato, and special sauce.",
          price: 280,
          isVeg: false,
          imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop",
          restaurantId: burgerRestaurant.id,
          categoryId: burgerCategory.id,
        },
        {
          name: "Veggie Burger",
          description: "Plant-based patty with all the fixings.",
          price: 250,
          isVeg: true,
          imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=500&auto=format&fit=crop",
          restaurantId: burgerRestaurant.id,
          categoryId: burgerCategory.id,
        },
        {
          name: "Bacon Avocado Burger",
          description: "Burger topped with crispy bacon, fresh avocado, and ranch dressing.",
          price: 320,
          isVeg: false,
          imageUrl: "https://images.unsplash.com/photo-1548946522-4a313e8972a4?q=80&w=500&auto=format&fit=crop",
          restaurantId: burgerRestaurant.id,
          categoryId: burgerCategory.id,
        },
        {
          name: "Loaded Fries",
          description: "Crispy fries topped with cheese, bacon bits, and sour cream.",
          price: 180,
          isVeg: false,
          imageUrl: "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=500&auto=format&fit=crop",
          restaurantId: burgerRestaurant.id,
          categoryId: burgerCategory.id,
        }
      );
    }

    // Sushi Sensation menu items
    const sushiRestaurant = insertedRestaurants[2];
    const sushiCategory = insertedCategories.find(cat => cat.name === "Sushi");
    if (sushiRestaurant && sushiCategory) {
      menuItemsToCreate.push(
        {
          name: "California Roll",
          description: "Crab, avocado, and cucumber wrapped in nori and rice.",
          price: 220,
          isVeg: false,
          imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500&auto=format&fit=crop",
          restaurantId: sushiRestaurant.id,
          categoryId: sushiCategory.id,
        },
        {
          name: "Spicy Tuna Roll",
          description: "Fresh tuna mixed with spicy mayo and wrapped in nori and rice.",
          price: 260,
          isVeg: false,
          imageUrl: "https://images.unsplash.com/photo-1621871908635-dce9a26ab1ca?q=80&w=500&auto=format&fit=crop",
          restaurantId: sushiRestaurant.id,
          categoryId: sushiCategory.id,
        },
        {
          name: "Vegetable Roll",
          description: "Assorted fresh vegetables wrapped in nori and rice.",
          price: 200,
          isVeg: true,
          imageUrl: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?q=80&w=500&auto=format&fit=crop",
          restaurantId: sushiRestaurant.id,
          categoryId: sushiCategory.id,
        },
        {
          name: "Sashimi Platter",
          description: "Assortment of fresh raw fish slices served with wasabi and soy sauce.",
          price: 450,
          isVeg: false,
          imageUrl: "https://images.unsplash.com/photo-1582450871972-ab5ca641643d?q=80&w=500&auto=format&fit=crop",
          restaurantId: sushiRestaurant.id,
          categoryId: sushiCategory.id,
        }
      );
    }

    // Indian restaurant menu items
    const indianRestaurant = insertedRestaurants[3];
    const indianCategory = insertedCategories.find(cat => cat.name === "Indian");
    if (indianRestaurant && indianCategory) {
      menuItemsToCreate.push(
        {
          name: "Butter Chicken",
          description: "Tender chicken pieces in a rich, creamy tomato sauce.",
          price: 350,
          isVeg: false,
          imageUrl: "https://images.unsplash.com/photo-1626777553635-be342223afc1?q=80&w=500&auto=format&fit=crop",
          restaurantId: indianRestaurant.id,
          categoryId: indianCategory.id,
        },
        {
          name: "Paneer Tikka Masala",
          description: "Grilled cottage cheese cubes in a spiced tomato gravy.",
          price: 320,
          isVeg: true,
          imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=500&auto=format&fit=crop",
          restaurantId: indianRestaurant.id,
          categoryId: indianCategory.id,
        },
        {
          name: "Garlic Naan",
          description: "Soft bread topped with garlic and butter, baked in a tandoor.",
          price: 80,
          isVeg: true,
          imageUrl: "https://images.unsplash.com/photo-1575377222312-dd1a1a108a3e?q=80&w=500&auto=format&fit=crop",
          restaurantId: indianRestaurant.id,
          categoryId: indianCategory.id,
        },
        {
          name: "Biryani",
          description: "Fragrant rice dish cooked with spices and your choice of meat or vegetables.",
          price: 300,
          isVeg: false,
          imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=500&auto=format&fit=crop",
          restaurantId: indianRestaurant.id,
          categoryId: indianCategory.id,
        }
      );
    }

    // Insert all menu items
    const insertedMenuItems = await Promise.all(
      menuItemsToCreate.map((menuItem) => storage.createMenuItem(menuItem))
    );
    console.log(`Created ${insertedMenuItems.length} menu items`);

    console.log("Database seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
}