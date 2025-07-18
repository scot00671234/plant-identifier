import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Crown, Check, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { useUsageTracker } from "@/hooks/use-usage-tracker";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUserId } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Premium() {
  const [, setLocation] = useLocation();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const { usage } = useUsageTracker();
  const { toast } = useToast();

  const isPremium = usage?.isPremium;

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

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const response = await apiRequest("POST", "/api/cancel-subscription", {
        userId: getUserId(),
      });
      
      if (response.ok) {
        // Invalidate usage cache to immediately reflect cancellation
        await queryClient.invalidateQueries({ 
          queryKey: ['/api/usage', getUserId()] 
        });
        
        toast({
          title: "Subscription Canceled",
          description: "Your premium subscription has been canceled. You'll retain access until the end of your billing period.",
        });
        
        setShowCancelDialog(false);
        setLocation('/');
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      toast({
        title: "Cancellation Failed",
        description: "Unable to cancel subscription. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  if (!isPremium) {
    // Redirect to paywall if user is not premium
    setLocation('/paywall');
    return null;
  }

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
          <h1 className="text-xl font-light text-gray-800">Premium Subscription</h1>
        </div>
      </header>

      {/* Premium Content */}
      <main className="max-w-md mx-auto px-6 py-8">
        {/* Premium Status */}
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
            Premium Active
          </h2>
          <p className="text-gray-500 text-lg font-light leading-relaxed">
            You have 100 monthly plant identifications and priority features.
          </p>
          
          {usage?.premiumMonthlyCount !== undefined && (
            <div className="mt-6 p-4 bg-plant-green/10 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-plant-green">This Month</span>
                <span className="text-sm font-medium text-plant-green">
                  {usage.premiumMonthlyCount || 0} / 100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-plant-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(((usage.premiumMonthlyCount || 0) / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Details Card */}
        <Card className="p-6 mb-6 bg-white/70 border-0 shadow-sm rounded-2xl">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-plant-green" />
              <div>
                <h3 className="font-medium text-gray-800">Premium Monthly</h3>
                <p className="text-sm text-gray-600">$4.99 per month</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-plant-green" />
              <div>
                <h3 className="font-medium text-gray-800">Next Billing</h3>
                <p className="text-sm text-gray-600">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Features List */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Your Premium Benefits</h3>
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-white/70 rounded-2xl">
              <div className="w-8 h-8 bg-plant-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 text-lg">{feature.title}</h4>
                <p className="text-gray-600 font-light">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cancel Subscription */}
        {!showCancelDialog ? (
          <div className="text-center">
            <button 
              onClick={() => setShowCancelDialog(true)}
              className="text-gray-500 hover:text-gray-700 transition-colors text-sm underline"
            >
              Cancel Subscription
            </button>
          </div>
        ) : (
          <Card className="p-6 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Cancel Subscription?</h3>
                <p className="text-sm text-red-600 mt-1">
                  You'll lose access to 100 monthly plant identifications and premium features at the end of your current billing period.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                variant="destructive"
                className="flex-1"
              >
                {isCanceling ? "Canceling..." : "Yes, Cancel"}
              </Button>
              <Button
                onClick={() => setShowCancelDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Keep Premium
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}