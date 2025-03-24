import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order } from "@shared/schema";
import { 
  Loader2, 
  PackageCheck, 
  Truck, 
  Home, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle,
  Package,
  User
} from "lucide-react";

export default function DeliveryPartnerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("available");

  // Fetch orders assigned to this delivery partner
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user && user.role === "delivery_partner",
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
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Status updated",
        description: "Order status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter orders based on status
  const availableOrders = orders?.filter(order => 
    order.status === 'confirmed' || order.status === 'preparing'
  ) || [];
  
  const activeOrders = orders?.filter(order => 
    order.status === 'out_for_delivery' && order.deliveryPartnerId === user?.id
  ) || [];
  
  const completedOrders = orders?.filter(order => 
    order.status === 'delivered' && order.deliveryPartnerId === user?.id
  ) || [];

  // Handle order status update
  const handleUpdateOrderStatus = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!user || user.role !== "delivery_partner") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="mb-4">You don't have permission to access the delivery partner dashboard.</p>
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
            <h1 className="text-2xl font-bold mb-2">Delivery Partner Dashboard</h1>
            <p className="text-gray-600">Manage your delivery orders</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-20 w-20 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mb-3">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="font-semibold text-lg">{user.fullName}</h2>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Delivery Partner</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Orders</p>
                    <h3 className="text-2xl font-bold">{availableOrders.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-full mr-4">
                    <Truck className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Deliveries</p>
                    <h3 className="text-2xl font-bold">{activeOrders.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed Deliveries</p>
                    <h3 className="text-2xl font-bold">{completedOrders.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="available" className="flex items-center">
                <Package className="h-4 w-4 mr-2" /> Available Orders
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center">
                <Truck className="h-4 w-4 mr-2" /> Active Deliveries
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" /> Completed Deliveries
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="available">
              <Card>
                <CardHeader>
                  <CardTitle>Available Orders</CardTitle>
                  <CardDescription>Orders that need to be picked up</CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : availableOrders.length > 0 ? (
                    <div className="space-y-4">
                      {availableOrders.map((order) => (
                        <Card key={order.id} className="bg-gray-50 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex flex-wrap justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center mb-1">
                                  <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                                  <Badge className={`ml-2 ${
                                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="font-semibold">{formatPrice(order.amount)}</p>
                              </div>
                            </div>
                            
                            <div className="border-t border-b py-3 mb-4">
                              <div className="flex items-start mb-2">
                                <MapPin className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                                <p className="text-sm">{order.deliveryAddress}</p>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                <p className="text-sm">
                                  {order.estimatedDeliveryTime ? 
                                    `Estimated delivery: ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}` : 
                                    'Delivery time not yet estimated'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <Button 
                                onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                                disabled={updateOrderStatusMutation.isPending}
                              >
                                {updateOrderStatusMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Truck className="h-4 w-4 mr-2" />
                                )}
                                Pick Up Order
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No available orders</h3>
                      <p className="text-gray-500">There are no orders available for pickup at the moment.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Active Deliveries</CardTitle>
                  <CardDescription>Orders you're currently delivering</CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : activeOrders.length > 0 ? (
                    <div className="space-y-4">
                      {activeOrders.map((order) => (
                        <Card key={order.id} className="bg-gray-50 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex flex-wrap justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center mb-1">
                                  <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                                  <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                                    On the way
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="font-semibold">{formatPrice(order.amount)}</p>
                              </div>
                            </div>
                            
                            <div className="border-t border-b py-3 mb-4">
                              <div className="flex items-start mb-2">
                                <MapPin className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                                <p className="text-sm">{order.deliveryAddress}</p>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                <p className="text-sm">
                                  {order.estimatedDeliveryTime ? 
                                    `Deliver by: ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}` : 
                                    'Delivery time not yet estimated'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <Button 
                                onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                disabled={updateOrderStatusMutation.isPending}
                              >
                                {updateOrderStatusMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Home className="h-4 w-4 mr-2" />
                                )}
                                Mark as Delivered
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No active deliveries</h3>
                      <p className="text-gray-500">You're not delivering any orders at the moment.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Deliveries</CardTitle>
                  <CardDescription>History of your past deliveries</CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : completedOrders.length > 0 ? (
                    <div className="space-y-4">
                      {completedOrders.map((order) => (
                        <Card key={order.id} className="bg-gray-50 hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex flex-wrap justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center mb-1">
                                  <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                                  <Badge className="ml-2 bg-green-100 text-green-800">
                                    Delivered
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="font-semibold">{formatPrice(order.amount)}</p>
                              </div>
                            </div>
                            
                            <div className="border-t border-b py-3 mb-1">
                              <div className="flex items-start mb-2">
                                <MapPin className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                                <p className="text-sm">{order.deliveryAddress}</p>
                              </div>
                              <div className="flex items-center text-green-600">
                                <PackageCheck className="h-4 w-4 mr-2" />
                                <p className="text-sm">Successfully delivered</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No completed deliveries</h3>
                      <p className="text-gray-500">You haven't completed any deliveries yet.</p>
                    </div>
                  )}
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
