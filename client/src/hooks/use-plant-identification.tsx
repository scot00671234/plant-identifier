import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getUserId } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export function usePlantIdentification() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const response = await apiRequest("POST", "/api/identify-plant", {
        imageBase64,
        userId: getUserId(),
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate history and usage queries
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/usage'] });
      
      toast({
        title: "Plant identified!",
        description: `Found ${data.identification.commonName} with ${data.identification.confidence}% confidence`,
      });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to identify plant";
      toast({
        title: "Identification failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  return {
    identifyPlant: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
