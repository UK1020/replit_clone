import React from 'react';
import { Restaurant } from '@shared/schema';
import { Link } from 'wouter';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div className="cursor-pointer border-0 rounded-lg shadow-sm overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-md">
        <div className="h-48 overflow-hidden">
          <img 
            src={restaurant.imageUrl || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?crop=entropy&cs=tinysrgb&fit=crop&h=250&w=400"} 
            alt={restaurant.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h5 className="font-bold text-lg mb-1">{restaurant.name}</h5>
          
          <div className="flex items-center mb-2">
            <span className="bg-green-500 text-white px-1.5 py-0.5 rounded text-xs flex items-center mr-2">
              <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              {restaurant.rating.toFixed(1)}
            </span>
            <span className="text-gray-600 text-sm">{restaurant.deliveryTime}</span>
          </div>
          
          <p className="text-gray-600 text-sm mb-1">{restaurant.cuisineTypes.join(', ')}</p>
          <p className="text-gray-600 text-sm">₹{restaurant.priceForTwo / 100} for two</p>
          
          <div className="flex justify-between items-center mt-3">
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded flex items-center">
              <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd"></path>
                <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z"></path>
              </svg>
              {restaurant.priceForTwo > 300 ? "20% OFF up to ₹100" : "10% OFF"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
