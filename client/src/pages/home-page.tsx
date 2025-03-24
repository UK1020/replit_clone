import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import HomeHero from "@/components/home-hero";
import LocationBanner from "@/components/location-banner";
import CategoryFilters from "@/components/category-filters";
import RestaurantList from "@/components/restaurant-list";
import FoodCategoryCarousel from "@/components/food-category-carousel";
import Footer from "@/components/footer";
import { Loader2 } from "lucide-react";
import { Category, Restaurant } from "@shared/schema";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch restaurants
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants", searchQuery],
    queryFn: async ({ queryKey }) => {
      const query = queryKey[1] as string;
      const url = query ? `/api/restaurants?query=${encodeURIComponent(query)}` : "/api/restaurants";
      const response = await fetch(url, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }
      
      return await response.json();
    },
  });

  // Filter restaurants by category
  const filteredRestaurants = selectedCategory && restaurants
    ? restaurants.filter(restaurant => 
        restaurant.cuisineTypes.toLowerCase().includes(
          categories?.find(c => c.id === selectedCategory)?.name.toLowerCase() || ''
        )
      )
    : restaurants;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <HomeHero />
      <LocationBanner onSearch={handleSearch} />
      
      <main className="flex-grow container mx-auto px-4">
        <div className="py-4">
          <FoodCategoryCarousel />
        </div>
        
        {categoriesLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <CategoryFilters 
            categories={categories || []} 
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        )}
        
        {restaurantsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <RestaurantList 
            restaurants={filteredRestaurants || []} 
            searchQuery={searchQuery}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
