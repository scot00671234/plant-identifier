import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getUserId } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { plantClassifier } from "@/lib/plant-classifier";

export function usePlantIdentification() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isModelLoading, setIsModelLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      // Ensure model is loaded
      if (!isModelLoading) {
        setIsModelLoading(true);
        try {
          await plantClassifier.loadModel();
        } finally {
          setIsModelLoading(false);
        }
      }

      // Convert base64 to image element for TensorFlow.js
      const img = new Image();
      const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.crossOrigin = "anonymous";
        img.src = `data:image/jpeg;base64,${imageBase64}`;
      });

      const imageElement = await imagePromise;
      
      // Use TensorFlow.js for classification
      const plantData = await plantClassifier.classifyPlant(imageElement);

      // Save to server (for history tracking and usage counting)
      const saveResponse = await apiRequest("POST", "/api/save-identification", {
        userId: getUserId(),
        imageBase64,
        scientificName: plantData.scientificName,
        commonName: plantData.commonName,
        confidence: plantData.confidence,
        family: plantData.family,
        description: plantData.description,
        origin: plantData.origin,
        type: plantData.type,
      });

      return saveResponse.json();
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
    isLoading: mutation.isPending || isModelLoading,
    error: mutation.error,
  };
}
