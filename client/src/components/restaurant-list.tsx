import { useState } from "react";
import { Restaurant } from "@shared/schema";
import RestaurantCard from "./restaurant-card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, SortDesc, Star, Clock } from "lucide-react";

interface RestaurantListProps {
  restaurants: Restaurant[];
  searchQuery?: string;
}

type SortOption = "relevance" | "rating" | "deliveryTime";

export default function RestaurantList({ restaurants, searchQuery }: RestaurantListProps) {
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [displayCount, setDisplayCount] = useState(8);

  // Sort restaurants based on selected option
  const sortedRestaurants = [...restaurants].sort((a, b) => {
    if (sortOption === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    } else if (sortOption === "deliveryTime") {
      return a.deliveryTime - b.deliveryTime;
    }
    // Default: relevance (no specific sorting)
    return 0;
  });

  const displayedRestaurants = sortedRestaurants.slice(0, displayCount);
  
  const loadMore = () => {
    setDisplayCount(prev => prev + 8);
  };

  return (
    <section className="py-5 bg-neutral-bg">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="font-heading mb-0">
            {searchQuery 
              ? `Restaurants matching "${searchQuery}"`
              : "Restaurants near you"}
          </h2>
          
          <div className="d-none d-md-flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  {sortOption === "relevance" && <SortDesc className="h-4 w-4 mr-2" />}
                  {sortOption === "rating" && <Star className="h-4 w-4 mr-2" />}
                  {sortOption === "deliveryTime" && <Clock className="h-4 w-4 mr-2" />}
                  
                  {sortOption === "relevance" && "Relevance"}
                  {sortOption === "rating" && "Rating"}
                  {sortOption === "deliveryTime" && "Delivery Time"}
                  
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortOption("relevance")}>
                  <SortDesc className="h-4 w-4 mr-2" /> Relevance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("rating")}>
                  <Star className="h-4 w-4 mr-2" /> Rating
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("deliveryTime")}>
                  <Clock className="h-4 w-4 mr-2" /> Delivery Time
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="row g-4">
          {displayedRestaurants.length > 0 ? (
            displayedRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="col-md-6 col-lg-4 col-xl-3">
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <p className="text-gray-500">
                {searchQuery 
                  ? `No restaurants found matching "${searchQuery}"`
                  : "No restaurants available in your area"}
              </p>
            </div>
          )}
        </div>
        
        {displayCount < restaurants.length && (
          <div className="text-center mt-5">
            <Button 
              variant="outline" 
              size="lg" 
              className="px-4"
              onClick={loadMore}
            >
              <i className="fas fa-plus-circle mr-2"></i> Show more restaurants
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
