import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@shared/schema";

export default function useCart() {
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch cart
  const { 
    data: cart, 
    isLoading: cartLoading, 
    error: cartError
  } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (item: CartItem) => {
      setIsAddingToCart(true);
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
      setIsAddingToCart(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
      setIsAddingToCart(false);
    },
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
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

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (menuItemId: number) => {
      const res = await fetch(`/api/cart/${menuItemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to remove item from cart");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from cart",
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

  // Clear cart mutation
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

  // Calculate cart totals
  const cartSubtotal = cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const deliveryFee = cart && cart.length > 0 ? 30 : 0; // Fixed delivery fee
  const tax = Math.round(cartSubtotal * 0.05 * 100) / 100; // 5% tax
  const discount = cartSubtotal >= 200 ? 100 : 0; // ₹100 off on orders above ₹200
  const cartTotal = cartSubtotal + deliveryFee + tax - discount;
  const cartItemCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const addToCart = (item: CartItem) => {
    addToCartMutation.mutate(item);
  };

  const updateCartItem = (menuItemId: number, quantity: number) => {
    updateCartItemMutation.mutate({ menuItemId, quantity });
  };

  const removeFromCart = (menuItemId: number) => {
    removeFromCartMutation.mutate(menuItemId);
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  return {
    cart,
    cartLoading,
    cartError,
    cartSubtotal,
    deliveryFee,
    tax,
    discount,
    cartTotal,
    cartItemCount,
    isAddingToCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };
}
