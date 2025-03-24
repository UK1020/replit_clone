import React from 'react';

interface CategoryCardProps {
  name: string;
  imageUrl: string;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, imageUrl, isSelected, onClick }) => {
  return (
    <div 
      className={`text-center cursor-pointer transition-all ${isSelected ? 'scale-105' : 'hover:scale-105'}`} 
      onClick={onClick}
    >
      <div 
        className={`w-20 h-20 rounded-full overflow-hidden mx-auto mb-2 border-2 transition-colors ${isSelected ? 'border-primary' : 'border-transparent'}`}
      >
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      </div>
      <h6 className={`text-sm font-semibold ${isSelected ? 'text-primary' : ''}`}>{name}</h6>
    </div>
  );
};

export default CategoryCard;
