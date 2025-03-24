import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import RestaurantPage from "@/pages/restaurant-page";
import OrderTrackingPage from "@/pages/order-tracking-page";
import ProfilePage from "@/pages/profile-page";
import RestaurantAdminPage from "@/pages/restaurant-admin-page";
import DeliveryPartnerPage from "@/pages/delivery-partner-page";
import OffersPage from "./pages/offers-page";
import HelpPage from "./pages/help-page";
import SearchPage from "./pages/search-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/restaurant/:id" component={RestaurantPage} />
      <Route path="/offers" component={OffersPage} />
      <Route path="/help" component={HelpPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/category/:id" component={SearchPage} />
      <ProtectedRoute path="/order/:id" component={OrderTrackingPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute 
        path="/restaurant-admin" 
        component={RestaurantAdminPage}
        roles={["restaurant_admin"]}
      />
      <ProtectedRoute 
        path="/delivery-partner" 
        component={DeliveryPartnerPage}
        roles={["delivery_partner"]}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
