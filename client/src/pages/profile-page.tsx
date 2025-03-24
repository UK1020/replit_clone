import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LoyaltyPoints from "@/components/loyalty-points";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, MapPin, Clock, Loader2, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Order } from "@shared/schema";

// Profile update schema
const profileSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Get tab from URL query parameter
  const getTabFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['profile', 'orders', 'loyalty', 'addresses'].includes(tab)) {
      return tab;
    }
    return "profile";
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromUrl());

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  // Profile update form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.fullName || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    },
  });

  // Update profile when data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
  }, [profile, form]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return null; // Handled by ProtectedRoute
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">My Account</h1>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="h-20 w-20 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mb-3">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="font-semibold text-lg">{user.fullName}</h2>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                  </div>
                  
                  <nav className="space-y-1">
                    <Button 
                      variant={activeTab === "profile" ? "default" : "ghost"} 
                      className="w-full justify-start" 
                      onClick={() => setActiveTab("profile")}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                    <Button 
                      variant={activeTab === "orders" ? "default" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab("orders")}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Orders
                    </Button>
                    <Button 
                      variant={activeTab === "loyalty" ? "default" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab("loyalty")}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Rewards
                    </Button>
                    <Button 
                      variant={activeTab === "addresses" ? "default" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab("addresses")}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Addresses
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-3">
              {activeTab === "profile" && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profileLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Default Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="mt-4"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "orders" && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : orders && orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <Card key={order.id} className="bg-gray-50 border hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                <div>
                                  <p className="font-semibold">Order #{order.id}</p>
                                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                </div>
                                
                                <div>
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap justify-between items-end gap-2 mt-3">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>
                                    {order.status === 'delivered' ? 'Delivered' : 'Expected delivery'}: 
                                    {order.estimatedDeliveryTime ? 
                                      ` ${new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                                      ' Pending'}
                                  </span>
                                </div>
                                
                                <div className="text-right">
                                  <p className="text-gray-500 text-sm">Total Amount</p>
                                  <p className="font-semibold">₹{order.amount}</p>
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-3 border-t">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.location.href = `/order/${order.id}`}
                                >
                                  View Order
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                        <Button onClick={() => window.location.href = "/"}>
                          Browse Restaurants
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "loyalty" && (
                <div>
                  <Card className="border-0 shadow-sm mb-4">
                    <CardHeader>
                      <CardTitle>Rewards &amp; Loyalty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user && <LoyaltyPoints userId={user.id} />}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "addresses" && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Saved Addresses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile?.address ? (
                      <div className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">Default Address</h3>
                          <span className="bg-primary bg-opacity-10 text-primary text-xs px-2 py-1 rounded">Default</span>
                        </div>
                        <p className="text-gray-600 mb-3">{profile.address}</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setActiveTab("profile")}>Edit</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No addresses saved</h3>
                        <p className="text-gray-500 mb-4">You haven't saved any delivery addresses yet.</p>
                        <Button onClick={() => setActiveTab("profile")}>
                          Add Address to Profile
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
