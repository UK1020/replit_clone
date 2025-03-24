import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useEffect, useState } from "react";
import { Category, Restaurant } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import RestaurantList from "@/components/restaurant-list";
import LocationBanner from "@/components/location-banner";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [, params] = useRoute("/category/:id");
  
  // Get the search query or category from URL
  useEffect(() => {
    if (params && params.id) {
      setCategoryId(parseInt(params.id, 10));
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get("q");
      if (query) {
        setSearchQuery(query);
      }
    }
  }, [params]);

  // Fetch category name if we're filtering by category
  const { data: category } = useQuery<Category>({
    queryKey: ["/api/categories", categoryId],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${categoryId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch category");
      }
      return response.json();
    },
    enabled: !!categoryId,
  });
  
  // Fetch restaurants based on search query or category
  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants", searchQuery, categoryId],
    queryFn: async () => {
      let url = "/api/restaurants";
      
      if (searchQuery) {
        url += `?query=${encodeURIComponent(searchQuery)}`;
      } else if (categoryId) {
        url += `?categoryId=${categoryId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }
      return response.json();
    },
    enabled: !!searchQuery || !!categoryId,
  });
  
  // Handle search from location banner
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCategoryId(null);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // Determine the heading text based on search or category
  const getHeadingText = () => {
    if (categoryId && category) {
      return `${category.name} Restaurants`;
    } else if (searchQuery) {
      return `Search results for "${searchQuery}"`;
    } else {
      return "Search for restaurants";
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <LocationBanner onSearch={handleSearch} />
        
        <div className="mt-6">
          <h1 className="text-2xl font-bold mb-4">
            {getHeadingText()}
          </h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !restaurants || restaurants.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium text-muted-foreground">
                {categoryId ? `No restaurants found in ${category?.name || 'this category'}` : `No restaurants found for "${searchQuery}"`}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {categoryId ? 'Try a different category' : 'Try a different search term or browse categories'}
              </p>
            </div>
          ) : (
            <RestaurantList restaurants={restaurants} searchQuery={searchQuery} />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}