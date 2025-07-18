import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, Leaf, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { usePlantIdentification } from "@/hooks/use-plant-identification";
import { useUsageTracker } from "@/hooks/use-usage-tracker";
import { getUserId } from "@/lib/storage";
import CameraCapture from "@/components/camera-capture";
import LoadingScreen from "@/components/loading-screen";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showCamera, setShowCamera] = useState(false);
  const { identifyPlant, isLoading } = usePlantIdentification();
  const { usage } = useUsageTracker();

  // Fetch recent identifications
  const { data: recentIdentifications = [] } = useQuery({
    queryKey: ['/api/history', getUserId()],
    select: (data) => data.slice(0, 3),
  });

  const handleImageCapture = async (imageBase64: string) => {
    setShowCamera(false);
    try {
      const result = await identifyPlant(imageBase64);
      if (result) {
        setLocation('/results');
      }
    } catch (error) {
      console.error('Identification failed:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      await handleImageCapture(base64);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (showCamera) {
    return (
      <CameraCapture 
        onCapture={handleImageCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  const canIdentify = usage?.isPremium || (usage?.remainingFree ?? 5) > 0;

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="bg-white p-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">PlantID</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Free: {usage?.remainingFree ?? 5}/5
            </span>
            <button 
              onClick={() => setLocation('/paywall')}
              className="text-plant-green hover:text-plant-green-dark transition-colors"
            >
              <Crown className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Hero Section */}
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-plant-green-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="h-12 w-12 text-plant-green" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Identify Any Plant</h2>
          <p className="text-gray-600 text-sm">Take a photo or upload an image to discover plant species instantly</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-plant-green hover:bg-plant-green-dark text-white font-medium py-4 h-auto"
            onClick={() => setShowCamera(true)}
            disabled={!canIdentify}
          >
            <Camera className="mr-2 h-5 w-5" />
            Take Photo
          </Button>
          
          <div className="relative">
            <Button 
              className="w-full border-2 border-plant-green text-plant-green hover:bg-plant-green-light font-medium py-4 h-auto bg-white"
              disabled={!canIdentify}
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Photo
            </Button>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={!canIdentify}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>

          {!canIdentify && (
            <p className="text-center text-sm text-red-600 mt-2">
              Daily limit reached. <button 
                onClick={() => setLocation('/paywall')}
                className="text-plant-green hover:underline"
              >
                Upgrade to premium
              </button> for unlimited access.
            </p>
          )}
        </div>

        {/* Recent Identifications */}
        {recentIdentifications.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Identifications</h3>
            
            <div className="space-y-3">
              {recentIdentifications.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={item.imageUrl} 
                      alt={item.commonName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.scientificName}</h4>
                      <p className="text-sm text-gray-600">{item.commonName}</p>
                      <p className="text-xs text-gray-500">{item.confidence}% confidence</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
