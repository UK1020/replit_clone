import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Clock, CalendarDays, Tag, Percent, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OfferProps {
  code: string;
  discount: string;
  maxDiscount: string;
  minOrder: string;
  validUntil: string;
  description: string;
  category: string;
}

const offers: OfferProps[] = [
  {
    code: "WELCOME50",
    discount: "50% OFF",
    maxDiscount: "₹150",
    minOrder: "₹300",
    validUntil: "Valid till Jun 30, 2025",
    description: "Get 50% OFF on your first order",
    category: "New User"
  },
  {
    code: "WEEKEND25",
    discount: "25% OFF",
    maxDiscount: "₹100",
    minOrder: "₹400",
    validUntil: "Valid on weekends",
    description: "Special weekend discount on all orders",
    category: "Weekend"
  },
  {
    code: "FREEDEL",
    discount: "FREE DELIVERY",
    maxDiscount: "₹50",
    minOrder: "₹200",
    validUntil: "Valid till May 31, 2025",
    description: "Free delivery on all orders",
    category: "Delivery"
  },
  {
    code: "TREAT20",
    discount: "20% OFF",
    maxDiscount: "₹120",
    minOrder: "₹500",
    validUntil: "Valid till Apr 15, 2025",
    description: "Special discount on selected restaurants",
    category: "Restaurant"
  },
  {
    code: "LUNCH15",
    discount: "15% OFF",
    maxDiscount: "₹75",
    minOrder: "₹300",
    validUntil: "Valid from 12PM - 3PM",
    description: "Lunch hour special discount",
    category: "Time-based"
  },
  {
    code: "VEGFEST",
    discount: "30% OFF",
    maxDiscount: "₹200",
    minOrder: "₹400",
    validUntil: "Valid till Jun 15, 2025",
    description: "Special discount on vegetarian dishes",
    category: "Cuisine"
  },
];

const specialOffers = [
  {
    title: "Refer & Earn",
    description: "Invite friends to SPARKUR and get ₹100 per referral",
    icon: <Gift className="h-8 w-8 text-primary" />,
    action: "Invite Now"
  },
  {
    title: "SPARKUR ONE Membership",
    description: "Join SPARKUR ONE for free delivery and exclusive offers",
    icon: <Tag className="h-8 w-8 text-primary" />,
    action: "Join Now"
  },
  {
    title: "Daily Rewards",
    description: "Order daily and unlock special rewards",
    icon: <CalendarDays className="h-8 w-8 text-primary" />,
    action: "Learn More"
  }
];

function OfferCard({ offer }: { offer: OfferProps }) {
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(offer.code);
    toast({
      title: "Coupon code copied!",
      description: `${offer.code} has been copied to clipboard`,
    });
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Badge className="mb-2 bg-primary-100 text-primary hover:bg-primary-200">{offer.category}</Badge>
        <h3 className="text-xl font-bold mb-1">{offer.discount}</h3>
        <p className="text-sm text-gray-500 mb-4">{offer.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="bg-gray-100 px-3 py-2 rounded-md font-mono font-medium">{offer.code}</div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-1" 
              onClick={handleCopyCode}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center">
            <CalendarDays className="h-3 w-3 mr-1" />
            <span>{offer.validUntil}</span>
          </div>
          <div className="flex items-center">
            <Tag className="h-3 w-3 mr-1" />
            <span>Min order: {offer.minOrder}</span>
          </div>
          <div className="flex items-center">
            <Percent className="h-3 w-3 mr-1" />
            <span>Max discount: {offer.maxDiscount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OffersPage() {
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
  const filteredOffers = filterCategory 
    ? offers.filter(offer => offer.category === filterCategory)
    : offers;
    
  const categories = Array.from(new Set(offers.map(offer => offer.category)));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-primary-50 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Exclusive Deals & Offers
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Discover amazing discounts and special promotions on your favorite food
              </p>
            </div>
          </div>
        </section>
        
        {/* Special offers section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Special Programs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {specialOffers.map((offer, index) => (
                <Card key={index} className="border-0 shadow-md transition-transform hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-4">
                      {offer.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                    <p className="text-gray-600 mb-4">{offer.description}</p>
                    <Button variant="outline" className="mt-2">
                      {offer.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Coupon codes section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Promo Codes</h2>
            
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <Button 
                variant={filterCategory === null ? "default" : "outline"}
                onClick={() => setFilterCategory(null)}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button 
                  key={category}
                  variant={filterCategory === category ? "default" : "outline"}
                  onClick={() => setFilterCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map((offer, index) => (
                <OfferCard key={index} offer={offer} />
              ))}
            </div>
          </div>
        </section>
        
        {/* How to use section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">How to Use Promo Codes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Choose a promo code</h3>
                <p className="text-gray-600 text-sm">Select a promo code that matches your order</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Apply at checkout</h3>
                <p className="text-gray-600 text-sm">Enter the code in the coupon field during checkout</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Enjoy the discount</h3>
                <p className="text-gray-600 text-sm">See the discount applied to your order total</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}