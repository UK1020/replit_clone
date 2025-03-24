import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, StarIcon, TruckIcon } from "lucide-react";

export default function HomeHero() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = () => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we would use the coordinates to get the location name
          // For now, we'll just show a success toast
          toast({
            title: "Location detected",
            description: "We've found your location and will show restaurants near you.",
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location detection failed",
            description: "Please enter your delivery address manually.",
            variant: "destructive",
          });
          setIsLocating(false);
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services. Please enter your delivery address manually.",
        variant: "destructive",
      });
      setIsLocating(false);
    }
  };

  // If user is logged in, we don't show the hero section
  if (user) {
    return null;
  }

  return (
    <>
      <section id="home" className="bg-white py-5 border-bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 order-lg-2">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000" 
                alt="Food delivery" 
                className="img-fluid rounded-lg shadow-lg" 
              />
            </div>
            <div className="col-lg-6 order-lg-1 mt-4 mt-lg-0">
              <h1 className="display-5 fw-bold font-heading text-secondary mb-3">
                Hungry? We've got you covered
              </h1>
              <p className="lead text-neutral-light mb-4">
                Order food from the best restaurants and have it delivered to your doorstep in minutes.
              </p>
              <div className="d-grid gap-2 d-md-flex">
                <Button 
                  size="lg" 
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="px-4"
                >
                  <MapPin className="mr-2 h-5 w-5" /> 
                  {isLocating ? "Detecting location..." : "Use current location"}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-4"
                  data-bs-toggle="modal" 
                  data-bs-target="#locationModal"
                >
                  Enter delivery address
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section with 3 columns */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Choose SPARKUR?</h2>
            <p className="lead text-muted">Delivering happiness with every order</p>
          </div>
          
          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="card-title h5 mb-3">Fast Delivery</h3>
                  <p className="card-text text-muted">
                    Your favorite food delivered in 30 minutes or less. We value your time and ensure quick service.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                    <StarIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="card-title h5 mb-3">Quality Food</h3>
                  <p className="card-text text-muted">
                    Partner with top-rated restaurants that maintain high standards of food quality and hygiene.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                    <TruckIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="card-title h5 mb-3">Live Tracking</h3>
                  <p className="card-text text-muted">
                    Track your order in real-time from the restaurant to your doorstep. Know exactly when your food will arrive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
