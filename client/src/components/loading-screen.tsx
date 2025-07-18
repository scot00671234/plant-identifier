import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
}

export default function LoadingScreen({ 
  message = "Identifying Plant...", 
  subtitle = "Our AI is analyzing your image to identify the plant species"
}: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <Loader2 className="h-16 w-16 animate-spin text-plant-green mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
      <p className="text-gray-600 text-center">
        {subtitle}
      </p>
    </div>
  );
}
