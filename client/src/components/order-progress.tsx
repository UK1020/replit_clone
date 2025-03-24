import { Check, Truck, Home, Utensils } from "lucide-react";

interface OrderProgressProps {
  currentStep: number;
  status: string;
}

export default function OrderProgress({ currentStep, status }: OrderProgressProps) {
  // Define the steps
  const steps = [
    { label: "Order Placed", icon: <Check className="h-5 w-5" /> },
    { label: "Preparing", icon: <Utensils className="h-5 w-5" /> },
    { label: "On the way", icon: <Truck className="h-5 w-5" /> },
    { label: "Delivered", icon: <Home className="h-5 w-5" /> },
  ];

  // If order is cancelled, show a different UI
  if (status === "cancelled") {
    return (
      <div className="mt-4">
        <div className="bg-red-100 border border-red-200 text-red-800 rounded-md p-4 text-center">
          <h4 className="font-semibold mb-2">Order Cancelled</h4>
          <p className="mb-0">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-progress mt-4">
      <div className="row position-relative">
        {steps.map((step, index) => (
          <div key={index} className="col-3 text-center">
            <div 
              className={`rounded-circle step d-flex align-items-center justify-content-center mx-auto border ${
                index < currentStep ? 'bg-success border-success text-white' : 
                index === currentStep ? 'border-primary text-primary' :
                'border-gray-300 text-gray-400'
              }`} 
              style={{ width: '60px', height: '60px' }}
            >
              {index < currentStep ? <Check className="h-6 w-6" /> : step.icon}
            </div>
            <p className={`mt-2 ${
              index <= currentStep ? 'font-medium' : 'text-gray-500'
            }`}>
              {step.label}
            </p>
          </div>
        ))}
        
        <div className="position-absolute top-50 start-0 end-0 d-flex">
          <div className={`line flex-grow-1 ${currentStep > 0 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className="mx-4"></div>
          <div className={`line flex-grow-1 ${currentStep > 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className="mx-4"></div>
          <div className={`line flex-grow-1 ${currentStep > 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    </div>
  );
}
