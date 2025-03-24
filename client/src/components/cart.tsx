import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { CartItem } from "@shared/schema";
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CartProps {
  restaurantId: number;
  restaurantName: string;
  cart: CartItem[];
  isLoading: boolean;
}

export default function Cart({ restaurantId, restaurantName, cart, isLoading }: CartProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [address, setAddress] = useState(user?.address || "");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Update cart item quantity
  const updateCartMutation = useMutation({
    mutationFn: async ({ menuItemId, quantity }: { menuItemId: number, quantity: number }) => {
      const res = await fetch(`/api/cart/${menuItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to update cart");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to clear cart");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "Your cart has been cleared",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Place order
  const placeOrderMutation = useMutation({
    mutationFn: async (deliveryAddress: string) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deliveryAddress }),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to place order");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Order placed",
        description: "Your order has been placed successfully!",
      });
      navigate(`/order/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
      setIsPlacingOrder(false);
    },
  });

  const handleQuantityChange = (menuItemId: number, change: number, currentQuantity: number) => {
    const newQuantity = currentQuantity + change;
    
    if (newQuantity <= 0) {
      // Remove item if quantity becomes 0
      updateCartMutation.mutate({ menuItemId, quantity: 0 });
    } else {
      updateCartMutation.mutate({ menuItemId, quantity: newQuantity });
    }
  };

  const handlePlaceOrder = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!address.trim()) {
      toast({
        title: "Address required",
        description: "Please provide a delivery address",
        variant: "destructive",
      });
      return;
    }
    
    if (address.trim().length < 10) {
      toast({
        title: "Address too short",
        description: "Please provide a complete address with landmarks, city, and pincode",
        variant: "destructive",
      });
      return;
    }
    
    setIsPlacingOrder(true);
    placeOrderMutation.mutate(address);
    
    // Also update user's saved address if they're logged in
    if (user && (!user.address || user.address !== address)) {
      try {
        fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
          credentials: "include",
        });
        // We don't need to wait for this to complete or handle errors
        // since it's just a convenience update
      } catch (error) {
        console.error("Failed to update user address:", error);
      }
    }
  };

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 30; // Fixed delivery fee
  const gst = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
  const discount = subtotal >= 200 ? 100 : 0; // ₹100 off on orders above ₹200
  const total = subtotal + deliveryFee + gst - discount;

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="border-0 shadow-sm sticky-top" style={{ top: '90px' }}>
      <CardHeader className="bg-white border-bottom-0 pt-3">
        <h5 className="font-heading mb-0 flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2" /> Your Cart
        </h5>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center p-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-500">Loading cart...</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center p-4">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-3" />
            <h6 className="mb-2">Your cart is empty</h6>
            <p className="text-muted small mb-0">Add items from the menu to get started</p>
          </div>
        ) : (
          <div>
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <span className="text-sm font-semibold">{restaurantName}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                onClick={() => clearCartMutation.mutate()}
                disabled={clearCartMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Clear cart
              </Button>
            </div>
            
            {cart.map((item) => (
              <div key={item.menuItemId} className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-3">
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <span className={`p-1 me-1 border rounded-sm ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                      <div 
                        className={`h-2 w-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}
                      ></div>
                    </span>
                    <h6 className="mb-0 font-semibold">{item.name}</h6>
                  </div>
                  <p className="mb-0 text-muted small">{formatPrice(item.price)}</p>
                </div>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => handleQuantityChange(item.menuItemId, -1, item.quantity)}
                    disabled={updateCartMutation.isPending}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => handleQuantityChange(item.menuItemId, 1, item.quantity)}
                    disabled={updateCartMutation.isPending}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="card bg-light border-0 mb-3">
              <div className="card-body py-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span>Item Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span>GST</span>
                  <span>{formatPrice(gst)}</span>
                </div>
                {discount > 0 && (
                  <div className="d-flex justify-content-between align-items-center text-success">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="d-flex justify-content-between align-items-center font-semibold mb-3">
              <h6 className="mb-0">To Pay</h6>
              <h6 className="mb-0">{formatPrice(total)}</h6>
            </div>
            
            <div className="mb-3 border p-3 rounded-md bg-gray-50">
              <h6 className="text-sm font-semibold mb-2">Delivery Address</h6>
              <textarea
                placeholder="Enter your complete delivery address with landmarks, city, state and pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 border rounded min-h-[80px] text-sm"
                required
              />
              {!address.trim() && (
                <p className="text-red-500 text-xs mt-1">* Address is required to place an order</p>
              )}
              {address.trim() && address.trim().length < 10 && (
                <p className="text-amber-500 text-xs mt-1">* Please provide a complete address with landmarks</p>
              )}
            </div>
            
            <Button 
              className="w-100 bg-success hover:bg-success/90"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || placeOrderMutation.isPending}
            >
              {isPlacingOrder || placeOrderMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  <span>PLACING ORDER...</span>
                </div>
              ) : (
                "PLACE ORDER"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
