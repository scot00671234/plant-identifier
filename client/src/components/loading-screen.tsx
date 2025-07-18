import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <Loader2 className="h-16 w-16 animate-spin text-plant-green mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Identifying Plant...</h2>
      <p className="text-gray-600 text-center">
        Our AI is analyzing your image to identify the plant species
      </p>
    </div>
  );
}
