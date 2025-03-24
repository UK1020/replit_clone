import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Phone, Mail, Clock, Settings, ShoppingCart, User, CreditCard, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// FAQ data
const faqCategories = {
  general: [
    {
      question: "How do I create an account on SPARKUR?",
      answer: "To create an account, click on the 'Sign In' button in the top right corner of the page. Then click on the 'Sign Up' tab and fill in your details. Once you submit the form, your account will be created and you'll be automatically logged in."
    },
    {
      question: "Is there a minimum order value?",
      answer: "The minimum order value varies by restaurant. You can see the minimum order value on the restaurant page before placing your order."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is confirmed, you can track it in real-time from the 'Orders' section in your profile. You'll also receive notifications when your order status changes."
    },
    {
      question: "What are the payment options available?",
      answer: "We accept various payment methods including credit/debit cards, UPI, wallets, and cash on delivery. Available payment options will be shown during checkout."
    },
    {
      question: "How do I apply a promo code?",
      answer: "You can apply a promo code during checkout. There will be a field where you can enter your code, and the discount will be applied automatically if the code is valid."
    },
  ],
  orders: [
    {
      question: "How can I cancel my order?",
      answer: "You can cancel your order from the 'Orders' section in your profile as long as the restaurant hasn't started preparing your food. Once the restaurant starts preparing your order, it cannot be canceled."
    },
    {
      question: "What if my order is late?",
      answer: "If your order is taking longer than the estimated delivery time, you can contact our customer support through the app or website. We'll check with the restaurant and delivery partner to get an update."
    },
    {
      question: "Can I change my order after placing it?",
      answer: "Once an order is placed, you cannot modify it directly. However, you can cancel the order (if it's not yet being prepared) and place a new one with the desired changes."
    },
    {
      question: "What if items are missing from my order?",
      answer: "If any items are missing from your order, please report it immediately through the 'Help' section in your order details. Our customer support team will assist you and provide a refund for the missing items."
    },
  ],
  payments: [
    {
      question: "How do refunds work?",
      answer: "Refunds are processed to the original payment method used for the order. It may take 5-7 business days for the refund to reflect in your account, depending on your bank's policies."
    },
    {
      question: "Is it safe to save my card details on SPARKUR?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your payment information. Your card details are securely stored by our payment partners and not directly on our servers."
    },
    {
      question: "My payment failed but money was deducted. What should I do?",
      answer: "If your payment was deducted but the order wasn't confirmed, the amount will be automatically refunded to your account within 5-7 business days. If you don't receive the refund, please contact our customer support."
    },
  ],
  account: [
    {
      question: "How do I update my profile information?",
      answer: "You can update your profile information from the 'Profile' section in your account. Click on the edit button next to the information you want to update, make the changes, and save."
    },
    {
      question: "How do I change my password?",
      answer: "To change your password, go to your profile settings and click on 'Change Password'. You'll need to enter your current password and then your new password."
    },
    {
      question: "How can I delete my account?",
      answer: "To delete your account, please contact our customer support. They will guide you through the account deletion process."
    },
  ]
};

// Contact options
const contactOptions = [
  {
    title: "Live Chat",
    description: "Chat with our support team",
    icon: <MessageSquare className="h-6 w-6" />,
    action: "Start Chat",
    available: "24/7"
  },
  {
    title: "Phone Support",
    description: "Call our helpline",
    icon: <Phone className="h-6 w-6" />,
    action: "Call Now",
    available: "8 AM - 10 PM"
  },
  {
    title: "Email Support",
    description: "Send us an email",
    icon: <Mail className="h-6 w-6" />,
    action: "Send Email",
    available: "Response within 24 hours"
  }
];

export default function HelpPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("general");
  
  // Filter FAQs based on search query
  const filterFAQs = (faqs: any[]) => {
    if (!searchQuery) return faqs;
    
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this might trigger an API call or more sophisticated search
    toast({
      title: "Searching for help",
      description: `Showing results for "${searchQuery}"`,
    });
  };
  
  const handleContactAction = (action: string) => {
    toast({
      title: "Contact action",
      description: `${action} feature would be activated here`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-primary-50 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                How can we help you?
              </h1>
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search for help topics..."
                  className="w-full rounded-full py-6 pl-6 pr-12 text-lg shadow-md focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-3"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </section>
        
        {/* Quick help section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Quick Help</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Order Issues</h3>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Payment Issues</h3>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Account Help</h3>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">App Settings</h3>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* FAQs section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="max-w-3xl mx-auto">
              <Tabs 
                defaultValue="general" 
                value={category}
                onValueChange={(value) => setCategory(value)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
                
                {Object.entries(faqCategories).map(([key, faqs]) => (
                  <TabsContent key={key} value={key}>
                    <Accordion type="single" collapsible className="w-full">
                      {filterFAQs(faqs).map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left font-semibold">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-gray-600">{faq.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    
                    {filterFAQs(faqs).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No results found for "{searchQuery}"</p>
                        <Button className="mt-4" variant="outline" onClick={() => setSearchQuery("")}>
                          Clear Search
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </section>
        
        {/* Contact section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Contact Support</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {contactOptions.map((option, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                        {option.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                      <p className="text-gray-600 mb-4 text-center">{option.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{option.available}</span>
                      </div>
                      
                      <Button 
                        onClick={() => handleContactAction(option.action)}
                        className="w-full"
                      >
                        {option.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}