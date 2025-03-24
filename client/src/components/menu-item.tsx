import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@shared/schema";
import { Check, Plus } from "lucide-react";

interface MenuItemProps {
  item: MenuItem;
  onAddToCart: () => void;
  isPending: boolean;
}

export default function MenuItemComponent({ item, onAddToCart, isPending }: MenuItemProps) {
  // Function to format price in INR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="mb-3 border food-card hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="row g-0">
          <div className="col-md-8">
            <div className="d-flex align-items-start mb-2">
              <span className={`p-1 me-2 border rounded-sm ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                <div 
                  className={`h-2 w-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}
                ></div>
              </span>
              <h5 className="card-title mb-0">{item.name}</h5>
            </div>
            <p className="card-text mb-1">{formatPrice(item.price)}</p>
            <p className="card-text small text-muted">
              {item.description || "No description available"}
            </p>
          </div>
          <div className="col-md-4 text-center">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                className="img-fluid rounded" 
                alt={item.name} 
                style={{ height: '100px', objectFit: 'cover' }}
              />
            ) : (
              <div className="bg-gray-100 rounded" style={{ height: '100px' }}>
                <div className="h-full flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-3/4 bg-white text-green-600 border-green-600 hover:bg-green-50"
              onClick={onAddToCart}
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-1 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  <span>ADDING</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Plus className="h-4 w-4 mr-1" /> ADD
                </div>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
