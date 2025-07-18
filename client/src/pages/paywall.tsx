import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Crown, Check } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/lib/queryClient";
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
      title: "Unlimited Identifications",
      description: "No limits - identify as many plants as you want"
    },
    {
      title: "Higher Accuracy",
      description: "Access to our most advanced AI models for better results"
    },
    {
      title: "Detailed Information",
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

  const handleSubscriptionSuccess = () => {
    setShowPaymentForm(false);
    setLocation('/');
  };

  const handleRestorePurchases = () => {
    alert('Restore purchases functionality would check for existing subscriptions');
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="bg-white p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setLocation('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Upgrade to Premium</h1>
        </div>
      </header>

      {/* Paywall Content */}
      <main className="p-4 space-y-6">
        {/* Hero Section */}
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-10 w-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Unlock Unlimited Identifications
          </h2>
          <p className="text-gray-600">
            You've used all 3 free identifications. Get unlimited access with premium.
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-plant-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Card or Payment Form */}
        {!showPaymentForm ? (
          <Card className="bg-gradient-to-r from-plant-green to-plant-green-dark text-white p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Premium Monthly</h3>
            <div className="text-3xl font-bold mb-1">$4.99</div>
            <p className="text-sm opacity-90 mb-4">per month</p>
            <Button 
              className="w-full bg-white text-plant-green font-semibold py-3 hover:bg-gray-50"
              onClick={handleStartTrial}
              disabled={isLoading}
            >
              {isLoading ? "Creating subscription..." : "Subscribe Now"}
            </Button>
            <p className="text-xs opacity-75 mt-2">Unlimited plant identifications</p>
          </Card>
        ) : (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Complete Your Subscription</h3>
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
