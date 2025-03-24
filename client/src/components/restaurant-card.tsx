import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Restaurant } from "@shared/schema";
import { Star, Clock, DollarSign } from "lucide-react";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="h-100 restaurant-card border-0 shadow-sm cursor-pointer hover:shadow-md transition-all hover:-translate-y-1">
        <div className="relative">
          {restaurant.imageUrl ? (
            <img 
              src={restaurant.imageUrl} 
              className="card-img-top" 
              style={{ height: '200px', objectFit: 'cover' }}
              alt={restaurant.name} 
            />
          ) : (
            <div className="bg-gray-200" style={{ height: '200px' }}>
              <div className="h-full flex items-center justify-center">
                <span className="text-gray-400 text-lg">{restaurant.name}</span>
              </div>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h5 className="card-title font-heading">{restaurant.name}</h5>
          <div className="d-flex align-items-center mb-2">
            <Badge className="bg-success me-2 flex items-center">
              <Star className="h-3 w-3 mr-1" /> {restaurant.rating || "New"}
            </Badge>
            <span className="text-muted">{restaurant.deliveryTime} mins</span>
            <span className="ms-auto text-muted">₹{restaurant.priceForTwo} for two</span>
          </div>
          <p className="card-text text-muted small">{restaurant.cuisineTypes}</p>
          <div className="d-flex align-items-center mt-3">
            <Badge variant="outline" className="text-dark me-2 bg-gray-100">
              <i className="fas fa-percent text-primary me-1"></i> 50% OFF
            </Badge>
            <Badge variant="outline" className="text-dark bg-gray-100">
              Free Delivery
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
