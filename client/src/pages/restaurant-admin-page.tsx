import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Restaurant, 
  Order, 
  MenuItem, 
  User,
  insertRestaurantSchema,
  insertMenuItemSchema
} from "@shared/schema";
import { 
  Store, 
  Package, 
  Utensils, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Truck, 
  Home, 
  AlertTriangle,
  Loader2,
  FileEdit,
  X,
  ShoppingCart,
  CheckCircle
} from "lucide-react";

// Restaurant form schema
const restaurantFormSchema = insertRestaurantSchema
  .omit({ ownerId: true })
  .extend({
    name: z.string().min(3, "Name must be at least 3 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    phone: z.string().min(10, "Phone must be at least 10 characters"),
    cuisineTypes: z.string().min(3, "Cuisine types must be at least 3 characters"),
    priceForTwo: z.coerce.number().min(1, "Price for two must be at least 1"),
    deliveryTime: z.coerce.number().min(5, "Delivery time must be at least 5 minutes"),
  });

// Menu item form schema
const menuItemFormSchema = insertMenuItemSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  price: z.coerce.number().min(1, "Price must be at least 1"),
  description: z.string().optional(),
});

type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;
type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

export default function RestaurantAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("restaurants");
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);

  // Fetch restaurants owned by the user
  const { 
    data: restaurants, 
    isLoading: restaurantsLoading 
  } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants/owned"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/restaurants?ownerId=${user.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      return res.json();
    },
    enabled: !!user && user.role === "restaurant_admin",
  });

  // Fetch orders for the selected restaurant
  const { 
    data: orders, 
    isLoading: ordersLoading 
  } = useQuery<Order[]>({
    queryKey: ["/api/orders", selectedRestaurantId],
    enabled: !!selectedRestaurantId,
  });

  // Fetch menu items for the selected restaurant
  const { 
    data: menuItems, 
    isLoading: menuItemsLoading 
  } = useQuery<MenuItem[]>({
    queryKey: [`/api/restaurants/${selectedRestaurantId}/menu`],
    enabled: !!selectedRestaurantId,
  });

  // Fetch delivery partners
  const { 
    data: deliveryPartners, 
    isLoading: deliveryPartnersLoading 
  } = useQuery<User[]>({
    queryKey: ["/api/delivery-partners"],
    enabled: !!user && user.role === "restaurant_admin",
  });

  // Update when first restaurant is loaded
  useEffect(() => {
    if (restaurants && restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

  // Restaurant form
  const restaurantForm = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      cuisineTypes: "",
      priceForTwo: 0,
      deliveryTime: 30,
      isOpen: true,
      imageUrl: "",
    },
  });

  // Menu item form
  const menuItemForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      isVeg: false,
      imageUrl: "",
      restaurantId: selectedRestaurantId || 0,
      categoryId: undefined,
    },
  });

  // Update form when editing restaurant
  useEffect(() => {
    if (editingRestaurant) {
      restaurantForm.reset({
        name: editingRestaurant.name,
        description: editingRestaurant.description || "",
        address: editingRestaurant.address,
        phone: editingRestaurant.phone,
        cuisineTypes: editingRestaurant.cuisineTypes,
        priceForTwo: editingRestaurant.priceForTwo,
        deliveryTime: editingRestaurant.deliveryTime,
        isOpen: editingRestaurant.isOpen,
        imageUrl: editingRestaurant.imageUrl || "",
      });
    } else {
      restaurantForm.reset({
        name: "",
        description: "",
        address: "",
        phone: "",
        cuisineTypes: "",
        priceForTwo: 0,
        deliveryTime: 30,
        isOpen: true,
        imageUrl: "",
      });
    }
  }, [editingRestaurant, restaurantForm]);

  // Update form when editing menu item
  useEffect(() => {
    if (editingMenuItem) {
      menuItemForm.reset({
        name: editingMenuItem.name,
        description: editingMenuItem.description || "",
        price: editingMenuItem.price,
        isVeg: editingMenuItem.isVeg,
        imageUrl: editingMenuItem.imageUrl || "",
        restaurantId: editingMenuItem.restaurantId,
        categoryId: editingMenuItem.categoryId,
      });
    } else {
      menuItemForm.reset({
        name: "",
        description: "",
        price: 0,
        isVeg: false,
        imageUrl: "",
        restaurantId: selectedRestaurantId || 0,
        categoryId: undefined,
      });
    }
  }, [editingMenuItem, menuItemForm, selectedRestaurantId]);

  // Update restaurantId in form when restaurant selection changes
  useEffect(() => {
    if (selectedRestaurantId) {
      menuItemForm.setValue("restaurantId", selectedRestaurantId);
    }
  }, [selectedRestaurantId, menuItemForm]);

  // Create restaurant mutation
  const createRestaurantMutation = useMutation({
    mutationFn: async (data: RestaurantFormValues) => {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create restaurant");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants/owned"] });
      toast({
        title: "Restaurant created",
        description: "Your restaurant has been created successfully",
      });
      restaurantForm.reset();
      setActiveTab("restaurants");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create restaurant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update restaurant mutation
  const updateRestaurantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: RestaurantFormValues }) => {
      const res = await fetch(`/api/restaurants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update restaurant");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants/owned"] });
      toast({
        title: "Restaurant updated",
        description: "Your restaurant has been updated successfully",
      });
      setEditingRestaurant(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update restaurant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormValues) => {
      const res = await fetch("/api/menu-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create menu item");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurantId}/menu`] });
      toast({
        title: "Menu item created",
        description: "Your menu item has been created successfully",
      });
      menuItemForm.reset({
        name: "",
        description: "",
        price: 0,
        isVeg: false,
        imageUrl: "",
        restaurantId: selectedRestaurantId || 0,
        categoryId: undefined,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create menu item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: MenuItemFormValues }) => {
      const res = await fetch(`/api/menu-items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update menu item");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurantId}/menu`] });
      toast({
        title: "Menu item updated",
        description: "Your menu item has been updated successfully",
      });
      setEditingMenuItem(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update menu item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/menu-items/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete menu item");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurantId}/menu`] });
      toast({
        title: "Menu item deleted",
        description: "Your menu item has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete menu item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update order status");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", selectedRestaurantId] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update order status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Assign delivery partner mutation
  const assignDeliveryPartnerMutation = useMutation({
    mutationFn: async ({ orderId, deliveryPartnerId }: { orderId: number, deliveryPartnerId: number }) => {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deliveryPartnerId }),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to assign delivery partner");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", selectedRestaurantId] });
      toast({
        title: "Delivery partner assigned",
        description: "The delivery partner has been assigned successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to assign delivery partner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Restaurant form submission
  const onSubmitRestaurant = (data: RestaurantFormValues) => {
    if (editingRestaurant) {
      updateRestaurantMutation.mutate({ id: editingRestaurant.id, data });
    } else {
      createRestaurantMutation.mutate(data);
    }
  };

  // Menu item form submission
  const onSubmitMenuItem = (data: MenuItemFormValues) => {
    if (editingMenuItem) {
      updateMenuItemMutation.mutate({ id: editingMenuItem.id, data });
    } else {
      createMenuItemMutation.mutate(data);
    }
  };

  // Handle menu item delete
  const handleDeleteMenuItem = (id: number) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteMenuItemMutation.mutate(id);
    }
  };

  // Handle order status update
  const handleUpdateOrderStatus = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  // Handle delivery partner assignment
  const handleAssignDeliveryPartner = (orderId: number, deliveryPartnerId: number) => {
    assignDeliveryPartnerMutation.mutate({ orderId, deliveryPartnerId });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user || user.role !== "restaurant_admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="mb-4">You don't have permission to access the restaurant admin dashboard.</p>
                <Button onClick={() => window.location.href = "/"}>
                  Go to Homepage
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-6">
        <div className="container">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Restaurant Admin Dashboard</h1>
            <p className="text-gray-600">Manage your restaurants, menus, and orders</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="restaurants" className="flex items-center">
                <Store className="h-4 w-4 mr-2" /> My Restaurants
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center">
                <Utensils className="h-4 w-4 mr-2" /> Menu Management
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center">
                <Package className="h-4 w-4 mr-2" /> Orders
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="restaurants">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Restaurants</CardTitle>
                      <CardDescription>
                        Manage your restaurant profiles
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {restaurantsLoading ? (
                        <div className="flex justify-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : restaurants && restaurants.length > 0 ? (
                        <div className="space-y-4">
                          {restaurants.map((restaurant) => (
                            <Card key={restaurant.id} className="bg-gray-50 hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{restaurant.address}</p>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Badge 
                                        variant={restaurant.isOpen ? "success" : "destructive"}
                                        className={restaurant.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                      >
                                        {restaurant.isOpen ? "Open" : "Closed"}
                                      </Badge>
                                      <span className="mx-2">•</span>
                                      <span>{restaurant.cuisineTypes}</span>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => {
                                        setEditingRestaurant(restaurant);
                                        setActiveTab("settings");
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-1" /> Edit
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setSelectedRestaurantId(restaurant.id)}
                                    >
                                      <Utensils className="h-4 w-4 mr-1" /> Manage
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Store className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                          <h3 className="font-semibold text-lg mb-2">No restaurants yet</h3>
                          <p className="text-gray-500 mb-4">You haven't added any restaurants yet.</p>
                          <Button onClick={() => setActiveTab("settings")}>
                            <Plus className="h-4 w-4 mr-2" /> Add Restaurant
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Stats</CardTitle>
                      <CardDescription>
                        Overview of your restaurant performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-primary bg-opacity-10 p-4 rounded-md">
                          <p className="text-sm text-gray-600 mb-1">Total Restaurants</p>
                          <p className="text-2xl font-bold">{restaurants?.length || 0}</p>
                        </div>
                        
                        <div className="bg-green-100 p-4 rounded-md">
                          <p className="text-sm text-gray-600 mb-1">Active Orders</p>
                          <p className="text-2xl font-bold">
                            {orders?.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length || 0}
                          </p>
                        </div>
                        
                        <div className="bg-blue-100 p-4 rounded-md">
                          <p className="text-sm text-gray-600 mb-1">Menu Items</p>
                          <p className="text-2xl font-bold">{menuItems?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="menu">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Menu Items</CardTitle>
                        <CardDescription>
                          Manage your restaurant's menu items
                        </CardDescription>
                      </div>
                      
                      {restaurants && restaurants.length > 0 && (
                        <Select 
                          value={selectedRestaurantId?.toString()} 
                          onValueChange={(value) => setSelectedRestaurantId(parseInt(value))}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Restaurant" />
                          </SelectTrigger>
                          <SelectContent>
                            {restaurants.map((restaurant) => (
                              <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                                {restaurant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      {!selectedRestaurantId ? (
                        <div className="text-center py-8">
                          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                          <h3 className="font-semibold text-lg mb-2">No Restaurant Selected</h3>
                          <p className="text-gray-500 mb-4">Please select a restaurant to manage its menu items.</p>
                          {restaurants && restaurants.length === 0 && (
                            <Button onClick={() => setActiveTab("settings")}>
                              <Plus className="h-4 w-4 mr-2" /> Add Restaurant
                            </Button>
                          )}
                        </div>
                      ) : menuItemsLoading ? (
                        <div className="flex justify-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : menuItems && menuItems.length > 0 ? (
                        <div className="space-y-4">
                          {menuItems.map((item) => (
                            <Card key={item.id} className="bg-gray-50 hover:shadow-sm transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start gap-4">
                                    <div className="bg-gray-200 rounded-md w-16 h-16 flex-shrink-0 overflow-hidden">
                                      {item.imageUrl ? (
                                        <img 
                                          src={item.imageUrl} 
                                          alt={item.name} 
                                          className="w-full h-full object-cover" 
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                          <Utensils className="h-6 w-6" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center mb-1">
                                        <span className={`p-1 me-1 border rounded-sm ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                                          <div 
                                            className={`h-2 w-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}
                                          ></div>
                                        </span>
                                        <h3 className="font-semibold">{item.name}</h3>
                                      </div>
                                      <p className="text-sm font-medium mb-1">₹{item.price}</p>
                                      <p className="text-sm text-gray-600">
                                        {item.description || "No description"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setEditingMenuItem(item)}
                                    >
                                      <Edit className="h-4 w-4 mr-1" /> Edit
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                      onClick={() => handleDeleteMenuItem(item.id)}
                                      disabled={deleteMenuItemMutation.isPending}
                                    >
                                      {deleteMenuItemMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Utensils className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                          <h3 className="font-semibold text-lg mb-2">No menu items yet</h3>
                          <p className="text-gray-500 mb-4">You haven't added any menu items yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {editingMenuItem ? "Edit Menu Item" : "Add Menu Item"}
                      </CardTitle>
                      <CardDescription>
                        {editingMenuItem 
                          ? "Update details for this menu item" 
                          : "Add a new item to your restaurant menu"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!selectedRestaurantId ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500 mb-4">Please select a restaurant first.</p>
                        </div>
                      ) : (
                        <Form {...menuItemForm}>
                          <form onSubmit={menuItemForm.handleSubmit(onSubmitMenuItem)} className="space-y-4">
                            <FormField
                              control={menuItemForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Item Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={menuItemForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      value={field.value || ""}
                                      className="min-h-[100px]"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={menuItemForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price (₹)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={menuItemForm.control}
                              name="isVeg"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel>Vegetarian</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={menuItemForm.control}
                              name="imageUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Image URL (optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ""} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex justify-between pt-2">
                              {editingMenuItem ? (
                                <>
                                  <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setEditingMenuItem(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    type="submit"
                                    disabled={
                                      updateMenuItemMutation.isPending ||
                                      !menuItemForm.formState.isDirty
                                    }
                                  >
                                    {updateMenuItemMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <FileEdit className="h-4 w-4 mr-2" />
                                    )}
                                    Update Item
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  type="submit" 
                                  className="w-full"
                                  disabled={createMenuItemMutation.isPending}
                                >
                                  {createMenuItemMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                  )}
                                  Add Menu Item
                                </Button>
                              )}
                            </div>
                          </form>
                        </Form>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="orders">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Order Management</CardTitle>
                    <CardDescription>
                      View and manage customer orders
                    </CardDescription>
                  </div>
                  
                  {restaurants && restaurants.length > 0 && (
                    <Select 
                      value={selectedRestaurantId?.toString()} 
                      onValueChange={(value) => setSelectedRestaurantId(parseInt(value))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                            {restaurant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardHeader>
                
                <CardContent>
                  {!selectedRestaurantId ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No Restaurant Selected</h3>
                      <p className="text-gray-500 mb-4">Please select a restaurant to view its orders.</p>
                      {restaurants && restaurants.length === 0 && (
                        <Button onClick={() => setActiveTab("settings")}>
                          <Plus className="h-4 w-4 mr-2" /> Add Restaurant
                        </Button>
                      )}
                    </div>
                  ) : ordersLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                      <Tabs defaultValue="active">
                        <TabsList>
                          <TabsTrigger value="active">Active Orders</TabsTrigger>
                          <TabsTrigger value="completed">Completed</TabsTrigger>
                          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="active" className="mt-4">
                          {orders.filter(order => 
                            ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
                          ).length > 0 ? (
                            <div className="space-y-4">
                              {orders
                                .filter(order => 
                                  ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
                                )
                                .map((order) => (
                                  <Card key={order.id} className="bg-gray-50 hover:shadow-sm transition-shadow">
                                    <CardContent className="p-4">
                                      <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                                        <div>
                                          <div className="flex items-center mb-1">
                                            <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                                            <Badge 
                                              className={`ml-2 ${
                                                order.status === 'placed' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'preparing' ? 'bg-purple-100 text-purple-800' :
                                                'bg-green-100 text-green-800'
                                              }`}
                                            >
                                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-gray-600">
                                            {formatDate(order.createdAt)}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm text-gray-600">Total Amount</p>
                                          <p className="font-semibold">₹{order.amount}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="border-t border-b py-3 mb-3">
                                        <p className="text-sm mb-1">
                                          <span className="font-medium">Delivery Address:</span> {order.deliveryAddress}
                                        </p>
                                        {order.deliveryPartnerId ? (
                                          <p className="text-sm text-green-600">
                                            <Check className="inline h-4 w-4 mr-1" /> Delivery partner assigned
                                          </p>
                                        ) : (
                                          <p className="text-sm text-yellow-600">
                                            <AlertTriangle className="inline h-4 w-4 mr-1" /> Delivery partner not assigned
                                          </p>
                                        )}
                                      </div>
                                      
                                      <div className="flex flex-wrap gap-2">
                                        {order.status === 'placed' && (
                                          <>
                                            <Button 
                                              size="sm"
                                              onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                                              disabled={updateOrderStatusMutation.isPending}
                                            >
                                              <Check className="h-4 w-4 mr-1" /> Confirm Order
                                            </Button>
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              className="border-red-200 text-red-600 hover:bg-red-50"
                                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                              disabled={updateOrderStatusMutation.isPending}
                                            >
                                              <X className="h-4 w-4 mr-1" /> Cancel Order
                                            </Button>
                                          </>
                                        )}
                                        
                                        {order.status === 'confirmed' && (
                                          <Button 
                                            size="sm"
                                            onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                            disabled={updateOrderStatusMutation.isPending}
                                          >
                                            <Utensils className="h-4 w-4 mr-1" /> Start Preparing
                                          </Button>
                                        )}
                                        
                                        {order.status === 'preparing' && !order.deliveryPartnerId && (
                                          <Select
                                            onValueChange={(value) => 
                                              handleAssignDeliveryPartner(order.id, parseInt(value))
                                            }
                                            disabled={assignDeliveryPartnerMutation.isPending || !deliveryPartners?.length}
                                          >
                                            <SelectTrigger className="w-[200px]">
                                              <SelectValue placeholder="Assign Delivery Partner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {deliveryPartnersLoading ? (
                                                <div className="flex justify-center p-2">
                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                                </div>
                                              ) : deliveryPartners && deliveryPartners.length > 0 ? (
                                                deliveryPartners.map((partner) => (
                                                  <SelectItem key={partner.id} value={partner.id.toString()}>
                                                    {partner.fullName}
                                                  </SelectItem>
                                                ))
                                              ) : (
                                                <div className="p-2 text-sm text-gray-500">
                                                  No delivery partners available
                                                </div>
                                              )}
                                            </SelectContent>
                                          </Select>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              }
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                              <h3 className="font-semibold text-lg mb-2">No active orders</h3>
                              <p className="text-gray-500">You don't have any active orders at the moment.</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="completed" className="mt-4">
                          {orders.filter(order => order.status === 'delivered').length > 0 ? (
                            <div className="space-y-4">
                              {orders
                                .filter(order => order.status === 'delivered')
                                .map((order) => (
                                  <Card key={order.id} className="bg-gray-50 hover:shadow-sm transition-shadow">
                                    <CardContent className="p-4">
                                      <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                                        <div>
                                          <div className="flex items-center mb-1">
                                            <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                                            <Badge className="ml-2 bg-green-100 text-green-800">
                                              Delivered
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-gray-600">
                                            {formatDate(order.createdAt)}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm text-gray-600">Total Amount</p>
                                          <p className="font-semibold">₹{order.amount}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="border-t border-b py-3 mb-3">
                                        <p className="text-sm mb-1">
                                          <span className="font-medium">Delivery Address:</span> {order.deliveryAddress}
                                        </p>
                                        <p className="text-sm text-green-600">
                                          <CheckCircle className="inline h-4 w-4 mr-1" /> Delivered successfully
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              }
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                              <h3 className="font-semibold text-lg mb-2">No completed orders</h3>
                              <p className="text-gray-500">You don't have any completed orders yet.</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="cancelled" className="mt-4">
                          {orders.filter(order => order.status === 'cancelled').length > 0 ? (
                            <div className="space-y-4">
                              {orders
                                .filter(order => order.status === 'cancelled')
                                .map((order) => (
                                  <Card key={order.id} className="bg-gray-50 hover:shadow-sm transition-shadow">
                                    <CardContent className="p-4">
                                      <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                                        <div>
                                          <div className="flex items-center mb-1">
                                            <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                                            <Badge className="ml-2 bg-red-100 text-red-800">
                                              Cancelled
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-gray-600">
                                            {formatDate(order.createdAt)}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm text-gray-600">Total Amount</p>
                                          <p className="font-semibold">₹{order.amount}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="border-t border-b py-3 mb-3">
                                        <p className="text-sm mb-1">
                                          <span className="font-medium">Delivery Address:</span> {order.deliveryAddress}
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              }
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <X className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                              <h3 className="font-semibold text-lg mb-2">No cancelled orders</h3>
                              <p className="text-gray-500">You don't have any cancelled orders.</p>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
                      <p className="text-gray-500">You haven't received any orders yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingRestaurant ? "Edit Restaurant" : "Add New Restaurant"}
                  </CardTitle>
                  <CardDescription>
                    {editingRestaurant 
                      ? "Update details for your restaurant" 
                      : "Register a new restaurant to start accepting orders"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...restaurantForm}>
                    <form onSubmit={restaurantForm.handleSubmit(onSubmitRestaurant)} className="space-y-4">
                      <FormField
                        control={restaurantForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Restaurant Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={restaurantForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                value={field.value || ""}
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={restaurantForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  className="min-h-[80px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={restaurantForm.control}
                          name="cuisineTypes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cuisine Types</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="e.g. North Indian, Chinese, Italian"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={restaurantForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={restaurantForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Restaurant Image URL (optional)</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={restaurantForm.control}
                          name="priceForTwo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Average Price for Two (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={restaurantForm.control}
                          name="deliveryTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Average Delivery Time (minutes)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={restaurantForm.control}
                        name="isOpen"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Restaurant Status</FormLabel>
                              <p className="text-sm text-gray-500">
                                Set whether your restaurant is currently accepting orders
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-between pt-2">
                        {editingRestaurant ? (
                          <>
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => setEditingRestaurant(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              disabled={
                                updateRestaurantMutation.isPending ||
                                !restaurantForm.formState.isDirty
                              }
                            >
                              {updateRestaurantMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <FileEdit className="h-4 w-4 mr-2" />
                              )}
                              Update Restaurant
                            </Button>
                          </>
                        ) : (
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={createRestaurantMutation.isPending}
                          >
                            {createRestaurantMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            Register Restaurant
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
