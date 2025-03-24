import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface LocationBannerProps {
  onSearch?: (query: string) => void;
}

export default function LocationBanner({ onSearch }: LocationBannerProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [location, setLocation] = useState("Koramangala, Bangalore");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleLocationChange = () => {
    setShowLocationModal(true);
  };

  return (
    <section className="bg-white py-3 shadow-sm border-bottom">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <MapPin className="text-primary h-5 w-5 mr-2" />
              <h5 className="mb-0 font-semibold">
                Deliver to: <span className="fw-normal">{user?.address || location}</span>
              </h5>
              <Button variant="link" className="text-primary ms-2 p-0" onClick={handleLocationChange}>
                Change
              </Button>
            </div>
          </div>
          <div className="col-md-6">
            <form onSubmit={handleSearch} className="d-flex">
              <div className="input-group">
                <Input 
                  type="text" 
                  placeholder="Search for restaurants and food" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                />
                <Button type="submit" className="btn btn-primary">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Location Modal would be implemented here */}
    </section>
  );
}
