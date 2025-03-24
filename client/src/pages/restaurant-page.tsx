import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Cart from "@/components/cart";
import MenuItem from "@/components/menu-item";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Loader2, ChevronLeft, Star, Clock, DollarSign, Percent, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Restaurant, MenuItem as MenuItemType, CartItem } from "@shared/schema";

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [vegOnly, setVegOnly] = useState(false);

  // Fetch restaurant details
  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: [`/api/restaurants/${id}`],
  });

  // Fetch menu items
  const { data: menuItems, isLoading: menuItemsLoading } = useQuery<MenuItemType[]>({
    queryKey: [`/api/restaurants/${id}/menu`],
    enabled: !!id,
  });

  // Fetch cart
  const { data: cart, isLoading: cartLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (item: CartItem) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add item to cart");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item added to cart",
        description: "Your item has been added to the cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (menuItem: MenuItemType) => {
    if (!restaurant) return;
    
    addToCartMutation.mutate({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
      isVeg: menuItem.isVeg,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    });
  };

  // Filter menu items if vegOnly is checked
  const filteredMenuItems = vegOnly && menuItems 
    ? menuItems.filter(item => item.isVeg) 
    : menuItems;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          {restaurantLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : restaurant ? (
            <>
              <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
                <div className="relative">
                  <div className="h-40 md:h-64 bg-gray-200"></div>
                  <div className="absolute top-4 left-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-white rounded-full h-10 w-10"
                      onClick={() => navigate("/")}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="md:flex md:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold mb-1">{restaurant.name}</h1>
                      <p className="text-gray-500 mb-2">{restaurant.cuisineTypes}</p>
                      <p className="text-gray-500 mb-3">{restaurant.address}</p>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="bg-green-600 text-white px-2 py-1 rounded flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          <span>{restaurant.rating}</span>
                        </div>
                        
                        <div className="flex items-center border-r pr-4">
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{restaurant.deliveryTime} mins</span>
                        </div>
                        
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                          <span>₹{restaurant.priceForTwo} for two</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 space-y-2">
                      <div className="bg-gray-100 text-gray-800 p-2 rounded-md inline-flex items-center">
                        <Percent className="h-4 w-4 mr-2 text-primary" />
                        <span>50% off up to ₹100</span>
                      </div>
                      
                      <div className="bg-gray-100 text-gray-800 p-2 rounded-md inline-flex items-center">
                        <Truck className="h-4 w-4 mr-2 text-primary" />
                        <span>Free delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm">
                    <Tabs defaultValue="menu">
                      <div className="px-6 pt-6 border-b">
                        <TabsList>
                          <TabsTrigger value="menu">Menu</TabsTrigger>
                          <TabsTrigger value="reviews">Reviews</TabsTrigger>
                          <TabsTrigger value="info">Restaurant Info</TabsTrigger>
                        </TabsList>
                      </div>
                      
                      <TabsContent value="menu" className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold">
                            Menu {filteredMenuItems && `(${filteredMenuItems.length})`}
                          </h2>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="veg-only" 
                              checked={vegOnly}
                              onCheckedChange={setVegOnly}
                            />
                            <label htmlFor="veg-only" className="text-sm">Veg Only</label>
                          </div>
                        </div>
                        
                        {menuItemsLoading ? (
                          <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : filteredMenuItems && filteredMenuItems.length > 0 ? (
                          <div className="space-y-4">
                            {filteredMenuItems.map((item) => (
                              <MenuItem 
                                key={item.id} 
                                item={item} 
                                onAddToCart={() => handleAddToCart(item)}
                                isPending={addToCartMutation.isPending}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No menu items available</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="reviews" className="p-6">
                        <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>
                        <div className="text-center py-8">
                          <p className="text-gray-500">No reviews available yet</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="info" className="p-6">
                        <h2 className="text-xl font-bold mb-6">Restaurant Information</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-2">Address</h3>
                            <p className="text-gray-600">{restaurant.address}</p>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold mb-2">Opening Hours</h3>
                            <p className="text-gray-600">11:00 AM - 11:00 PM (All Days)</p>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold mb-2">Cuisines</h3>
                            <p className="text-gray-600">{restaurant.cuisineTypes}</p>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold mb-2">Contact</h3>
                            <p className="text-gray-600">{restaurant.phone}</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
                
                <div>
                  <Cart 
                    restaurantId={parseInt(id)} 
                    restaurantName={restaurant.name}
                    cart={cart || []}
                    isLoading={cartLoading}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Restaurant not found</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
