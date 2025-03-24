import { Category } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryFiltersProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export default function CategoryFilters({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFiltersProps) {
  return (
    <section className="py-4 bg-neutral-bg">
      <div className="container">
        <h2 className="font-heading mb-4">What's on your mind?</h2>
        <div className="row g-3">
          {categories.map((category) => (
            <div key={category.id} className="col-4 col-md-2">
              <Card 
                className={`h-100 border-0 text-center shadow-sm category-card cursor-pointer hover:shadow-md transition-shadow ${
                  selectedCategory === category.id ? 'border-primary border-2' : ''
                }`}
                onClick={() => onSelectCategory(selectedCategory === category.id ? null : category.id)}
              >
                <CardContent className="p-2">
                  {category.imageUrl ? (
                    <img 
                      src={category.imageUrl} 
                      className="rounded-circle mb-2" 
                      width="60" 
                      height="60" 
                      alt={category.name} 
                    />
                  ) : (
                    <div className="rounded-circle mb-2 bg-primary bg-opacity-10 flex items-center justify-center mx-auto" style={{ width: '60px', height: '60px' }}>
                      <span className="text-primary text-lg">{category.name.charAt(0)}</span>
                    </div>
                  )}
                  <h6 className="card-title mb-0">{category.name}</h6>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* If no categories are provided, show some placeholder skeleton items */}
          {categories.length === 0 && 
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="col-4 col-md-2">
                <Card className="h-100 border-0 text-center shadow-sm category-card">
                  <CardContent className="p-2">
                    <div className="rounded-circle mb-2 bg-gray-200 mx-auto" style={{ width: '60px', height: '60px' }}></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </CardContent>
                </Card>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
}
