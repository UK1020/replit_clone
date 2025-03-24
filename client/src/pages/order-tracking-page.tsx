import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import OrderProgress from "@/components/order-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, MapPin, Phone, Loader2 } from "lucide-react";
import { Order, OrderItem } from "@shared/schema";

// Helper to format price to INR
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  // Fetch order details
  const { data: orderData, isLoading } = useQuery<{ items: OrderItem[] } & Order>({
    queryKey: [`/api/orders/${id}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate("/")}>Go back to home</Button>
      </div>
    );
  }

  // Determine current step based on order status
  const currentStep = 
    orderData.status === 'placed' ? 0 :
    orderData.status === 'confirmed' ? 1 :
    orderData.status === 'preparing' ? 1 :
    orderData.status === 'out_for_delivery' ? 2 :
    orderData.status === 'delivered' ? 3 : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-5">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Order Tracking</h1>
                  <p className="text-gray-600">Order ID: #{orderData.id}</p>
                  {orderData.estimatedDeliveryTime && (
                    <p className="text-gray-600">
                      Estimated Delivery: {new Date(orderData.estimatedDeliveryTime).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => navigate("/")}
                >
                  <ChevronLeft className="h-4 w-4" /> Back to Home
                </Button>
              </div>
              
              <OrderProgress currentStep={currentStep} status={orderData.status} />
              
              <div className="grid md:grid-cols-2 gap-6 mt-10">
                {orderData.deliveryPartnerId && (
                  <Card className="border-0 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                        <div>
                          <h3 className="font-semibold">Delivery Partner</h3>
                          <p className="text-sm text-gray-600">Your Delivery Partner</p>
                        </div>
                        <Button variant="outline" size="icon" className="ml-auto rounded-full">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Your order is on the way! Your delivery partner is bringing your delicious food.
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                <Card className="border-0 bg-gray-50">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Delivery Location</h3>
                    <p className="flex items-start gap-2 text-sm mb-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{orderData.deliveryAddress}</span>
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 font-semibold">Item</th>
                        <th className="py-3 px-4 font-semibold">Quantity</th>
                        <th className="py-3 px-4 font-semibold text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-3 px-4">{item.menuItemId}</td>
                          <td className="py-3 px-4">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={2} className="py-3 px-4 text-right font-semibold">Item Total</td>
                        <td className="py-3 px-4 text-right">{formatPrice(orderData.amount - orderData.deliveryFee - orderData.tax + orderData.discount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="py-3 px-4 text-right">Delivery Fee</td>
                        <td className="py-3 px-4 text-right">{formatPrice(orderData.deliveryFee)}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="py-3 px-4 text-right">GST</td>
                        <td className="py-3 px-4 text-right">{formatPrice(orderData.tax)}</td>
                      </tr>
                      {orderData.discount > 0 && (
                        <tr>
                          <td colSpan={2} className="py-3 px-4 text-right text-green-600">Discount</td>
                          <td className="py-3 px-4 text-right text-green-600">-{formatPrice(orderData.discount)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={2} className="py-3 px-4 text-right font-semibold">Total</td>
                        <td className="py-3 px-4 text-right font-semibold">{formatPrice(orderData.amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
