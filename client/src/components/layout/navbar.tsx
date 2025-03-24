import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { CartItem } from '@shared/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onCartClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onCartClick }) => {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch cart items if user is logged in
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });

  // Update cart count when cart items change
  useEffect(() => {
    if (cartItems) {
      const count = cartItems.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    }
  }, [cartItems]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/');
      }
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <nav className="bg-white py-3 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-primary font-bold text-2xl">SPARKUR</span>
          </Link>

          {/* Mobile Toggle */}
          <button className="md:hidden border rounded px-2 py-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-grow items-center justify-between ml-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex border rounded-lg overflow-hidden max-w-md w-full mr-4">
              <div className="flex items-center px-3 bg-white">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <Input 
                type="search" 
                placeholder="Search for restaurants and food" 
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Nav Items */}
            <div className="flex items-center">
              {/* Cart Button */}
              <Button 
                variant="ghost" 
                className="relative mr-2"
                onClick={onCartClick}
              >
                <ShoppingCart className="h-5 w-5 mr-1" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center">
                      <User className="h-5 w-5 mr-1" />
                      {user.username}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      Profile
                    </DropdownMenuItem>
                    {user.role === 'restaurant_admin' && (
                      <DropdownMenuItem onClick={() => navigate('/restaurant-dashboard')}>
                        Restaurant Dashboard
                      </DropdownMenuItem>
                    )}
                    {user.role === 'delivery_partner' && (
                      <DropdownMenuItem onClick={() => navigate('/delivery-dashboard')}>
                        Delivery Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="default" 
                  className="bg-primary hover:bg-[#e67415]"
                  onClick={() => navigate('/auth')}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
