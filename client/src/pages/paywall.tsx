import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Crown, Check } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUserId } from "@/lib/storage";
import SubscriptionForm from "@/components/subscription-form";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

export default function Paywall() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const features = [
    {
      title: "100 Monthly Identifications",
      description: "Generous monthly limit that resets every month - perfect for enthusiasts"
    },
    {
      title: "Priority AI Processing",
      description: "Access to our most advanced AI models for higher accuracy"
    },
    {
      title: "Detailed Plant Care",
      description: "Get comprehensive plant care guides and growing tips"
    },
    {
      title: "History Backup",
      description: "Never lose your plant identifications with cloud backup"
    }
  ];

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/create-subscription", {
        userId: getUserId(),
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }
      
      setClientSecret(data.clientSecret);
      setShowPaymentForm(true);
    } catch (error) {
      console.error("Subscription creation error:", error);
      alert("Failed to create subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscriptionSuccess = async () => {
    // Invalidate usage cache to immediately reflect premium status
    await queryClient.invalidateQueries({ 
      queryKey: ['/api/usage', getUserId()] 
    });
    
    setShowPaymentForm(false);
    setLocation('/');
  };

  const handleRestorePurchases = () => {
    alert('Restore purchases functionality would check for existing subscriptions');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-plant-green-ultra-light to-white pb-20">
      {/* Header */}
      <header className="glass-effect p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3 max-w-md mx-auto">
          <button 
            onClick={() => setLocation('/')}
            className="w-10 h-10 rounded-full bg-plant-green/10 flex items-center justify-center hover:bg-plant-green/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-plant-green" />
          </button>
          <h1 className="text-xl font-light text-gray-800">Upgrade to Premium</h1>
        </div>
      </header>

      {/* Paywall Content */}
      <main className="max-w-md mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center py-8">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-yellow-400/20">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-yellow-400/20 animate-pulse"></div>
          </div>
          
          <h2 className="text-3xl font-light text-gray-800 mb-3">
            Upgrade to Premium
          </h2>
          <p className="text-gray-500 text-lg font-light leading-relaxed">
            You've used all 3 free identifications. Get 100 monthly identifications with premium.
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-white/70 rounded-2xl">
              <div className="w-8 h-8 bg-plant-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 text-lg">{feature.title}</h3>
                <p className="text-gray-600 font-light">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Card or Payment Form */}
        {!showPaymentForm ? (
          <Card className="gradient-green text-white p-8 text-center border-0 shadow-xl rounded-2xl">
            <h3 className="text-xl font-light mb-2">Premium Monthly</h3>
            <div className="text-4xl font-light mb-2">$4.99</div>
            <p className="text-white/80 mb-6">per month</p>
            <Button 
              className="w-full bg-white text-plant-green font-medium py-4 hover:bg-gray-50 rounded-xl border-0 shadow-lg"
              onClick={handleStartTrial}
              disabled={isLoading}
            >
              {isLoading ? "Creating subscription..." : "Subscribe Now"}
            </Button>
            <p className="text-white/70 mt-4 font-light">100 monthly plant identifications</p>
          </Card>
        ) : (
          <Card className="p-8 bg-white/70 border-0 shadow-sm rounded-2xl">
            <h3 className="text-xl font-light mb-6 text-center text-gray-800">Complete Your Subscription</h3>
            {clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret }}
              >
                <SubscriptionForm onSuccess={handleSubscriptionSuccess} />
              </Elements>
            )}
          </Card>
        )}

        {/* Alternative Option */}
        <div className="text-center">
          <button 
            onClick={handleRestorePurchases}
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            Restore Previous Purchase
          </button>
        </div>
      </main>
    </div>
  );
}
