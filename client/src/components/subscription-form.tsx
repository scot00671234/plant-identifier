import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getUserId } from "@/lib/storage";

interface SubscriptionFormProps {
  onSuccess: () => void;
}

export default function SubscriptionForm({ onSuccess }: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Payment successful, now update user's premium status
        try {
          const response = await apiRequest("POST", "/api/subscription-success", {
            userId: getUserId(),
          });
          
          if (response.ok) {
            toast({
              title: "Payment Successful!",
              description: "You now have unlimited plant identifications!",
            });
            onSuccess();
          } else {
            throw new Error("Failed to update premium status");
          }
        } catch (updateError) {
          console.error("Failed to update premium status:", updateError);
          toast({
            title: "Payment Processed",
            description: "Payment successful, but there was an issue updating your account. Please contact support.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-plant-green hover:bg-plant-green-dark"
      >
        {isLoading ? "Processing..." : "Subscribe for $4.99/month"}
      </Button>
    </form>
  );
}