import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Crown, Check } from "lucide-react";

export default function Paywall() {
  const [, setLocation] = useLocation();

  const features = [
    {
      title: "Unlimited Identifications",
      description: "No daily limits - identify as many plants as you want"
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

  const handleStartTrial = () => {
    // Mock premium upgrade
    alert('Premium upgrade functionality would be implemented here with real payment processing');
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
            Get instant access to unlimited plant identifications and premium features
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

        {/* Pricing Card */}
        <Card className="bg-gradient-to-r from-plant-green to-plant-green-dark text-white p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Premium Monthly</h3>
          <div className="text-3xl font-bold mb-1">$4.99</div>
          <p className="text-sm opacity-90 mb-4">per month</p>
          <Button 
            className="w-full bg-white text-plant-green font-semibold py-3 hover:bg-gray-50"
            onClick={handleStartTrial}
          >
            Start Free Trial
          </Button>
          <p className="text-xs opacity-75 mt-2">7-day free trial, then $4.99/month</p>
        </Card>

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
