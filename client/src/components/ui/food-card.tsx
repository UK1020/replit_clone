import React from 'react';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@shared/schema';

interface FoodCardProps {
  menuItem: MenuItem;
  onAddToCart: () => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ menuItem, onAddToCart }) => {
  return (
    <div className="flex justify-between border-b pb-4">
      <div className="flex-grow pr-4">
        <div className="flex items-center mb-2">
          <div className={`${menuItem.isVeg ? 'border-green-500' : 'border-red-500'} border w-4 h-4 flex items-center justify-center mr-2`}>
            <div className={`${menuItem.isVeg ? 'bg-green-500' : 'bg-red-500'} rounded-full w-2 h-2`}></div>
          </div>
          <h3 className="font-semibold">{menuItem.name}</h3>
        </div>
        <p className="font-bold mb-1">₹{menuItem.price / 100}</p>
        <p className="text-gray-600 text-sm">{menuItem.description || 'No description available'}</p>
        <div className="mt-2">
          <Button 
            onClick={onAddToCart} 
            size="sm" 
            variant="outline" 
            className="hover:bg-green-50 border border-green-500 text-green-500 hover:text-green-600"
          >
            Add
          </Button>
        </div>
      </div>
      {menuItem.imageUrl && (
        <div className="w-24 h-24">
          <img 
            src={menuItem.imageUrl} 
            alt={menuItem.name} 
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default FoodCard;
