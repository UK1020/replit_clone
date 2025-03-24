import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search, Percent, HelpCircle, Menu, X, Award } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { CartItem } from "@shared/schema";
import { useState } from "react";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Fetch cart data to show cart count
  const { data: cart } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });
  
  // Fetch user loyalty points
  const { data: loyaltyData } = useQuery({
    queryKey: ["/api/loyalty/points"],
    enabled: !!user,
  });
  
  const cartCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50">
      <nav className="container navbar navbar-expand-lg navbar-light py-3">
        <div className="container-fluid">
          <Link href="/" className="navbar-brand font-heading font-bold text-2xl text-primary">
            <i className="fas fa-fire text-primary mr-2"></i> SPARKUR
          </Link>
          
          <button 
            className="navbar-toggler border p-2" 
            type="button" 
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <div className={`navbar-collapse ${mobileMenuOpen ? 'show' : 'collapse'}`} id="navbarNav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link href="/" className="nav-link d-flex align-items-center">
                  <Search className="h-4 w-4 mr-1" /> Search
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/offers" className="nav-link d-flex align-items-center">
                  <Percent className="h-4 w-4 mr-1" /> Offers
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/help" className="nav-link d-flex align-items-center">
                  <HelpCircle className="h-4 w-4 mr-1" /> Help
                </Link>
              </li>
              
              {user ? (
                <>
                  <li className="nav-item">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href="/profile?tab=loyalty" className="nav-link d-flex align-items-center position-relative">
                            <Award className="h-4 w-4 mr-1" />
                            <span className="d-none d-md-inline">Rewards</span>
                            {loyaltyData && (
                              <Badge className="position-absolute top-0 start-100 translate-middle rounded-pill bg-amber-400 text-amber-950">
                                {loyaltyData.points}
                              </Badge>
                            )}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm font-medium">
                            {loyaltyData ? `${loyaltyData.points} loyalty points` : 'Your Rewards'}
                          </p>
                          {loyaltyData && (
                            <p className="text-xs text-muted-foreground">{loyaltyData.tier.charAt(0).toUpperCase() + loyaltyData.tier.slice(1)} tier</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                
                  <li className="nav-item">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="nav-link d-flex align-items-center border-0 bg-transparent">
                          <User className="h-4 w-4 mr-1" /> {user.fullName}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/profile")}>
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/profile?tab=loyalty")}>
                          <Award className="h-4 w-4 mr-2" /> Loyalty Rewards
                        </DropdownMenuItem>
                        {user.role === "restaurant_admin" && (
                          <DropdownMenuItem onClick={() => navigate("/restaurant-admin")}>
                            Restaurant Dashboard
                          </DropdownMenuItem>
                        )}
                        {user.role === "delivery_partner" && (
                          <DropdownMenuItem onClick={() => navigate("/delivery-partner")}>
                            Delivery Dashboard
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => navigate("/profile?tab=orders")}>
                          Orders
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                  
                  <li className="nav-item">
                    <Link href={`/restaurant/${cart?.[0]?.restaurantId || ''}`} className="nav-link d-flex align-items-center position-relative">
                      <ShoppingCart className="h-4 w-4 mr-1" /> 
                      <span className="d-none d-md-inline">Cart</span>
                      {cartCount > 0 && (
                        <Badge className="position-absolute top-0 start-100 translate-middle rounded-pill bg-primary">
                          {cartCount}
                        </Badge>
                      )}
                    </Link>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link href="/auth" className="nav-link d-flex align-items-center">
                    <User className="h-4 w-4 mr-1" /> Sign In
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
