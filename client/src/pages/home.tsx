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

  const canIdentify = usage?.isPremium || (usage?.remainingFree ?? 3) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-plant-green-ultra-light to-white pb-20">
      {/* Header */}
      <header className="glass-effect p-6 border-b border-gray-200/50">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-plant-green to-plant-green-dark rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4 L12 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 7 Q7 5 5 8 Q7 11 12 9" fill="currentColor" fillOpacity="0.9"/>
                <path d="M12 11 Q17 9 19 12 Q17 15 12 13" fill="currentColor" fillOpacity="0.8"/>
                <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="text-2xl font-light text-gray-800">PlantID</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {usage?.isPremium ? (
              <span className="text-sm text-yellow-600 flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </span>
            ) : (
              <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                {usage?.remainingFree ?? 3}/3 left
              </span>
            )}
            
            <button 
              onClick={() => setLocation('/paywall')}
              className="w-8 h-8 rounded-full bg-plant-green/10 flex items-center justify-center hover:bg-plant-green/20 transition-colors"
            >
              <Crown className="h-4 w-4 text-plant-green" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-plant-green to-plant-green-dark rounded-full flex items-center justify-center mx-auto shadow-lg shadow-plant-green/20">
              <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center">
                  {/* Simple, clear plant icon */}
                  <div className="text-white text-4xl font-bold">🌱</div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-plant-green/20 animate-pulse"></div>
          </div>
          
          <h2 className="text-3xl font-light text-gray-800 mb-3">Identify Any Plant</h2>
          <p className="text-gray-500 text-lg font-light leading-relaxed max-w-sm mx-auto">
            Take a photo or upload an image to discover plant species instantly
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            className="w-full bg-gradient-to-r from-plant-green to-plant-green-dark hover:from-plant-green-dark hover:to-plant-green text-white font-medium py-6 h-auto rounded-2xl shadow-lg shadow-plant-green/25 border-0"
            onClick={() => setShowCamera(true)}
            disabled={!canIdentify}
          >
            <Camera className="mr-3 h-6 w-6" />
            Take Photo
          </Button>
          
          <div className="relative">
            <Button 
              className="w-full border-2 border-plant-green/30 text-plant-green hover:bg-plant-green/5 font-medium py-6 h-auto bg-white/70 rounded-2xl shadow-sm"
              disabled={!canIdentify}
            >
              <Upload className="mr-3 h-6 w-6" />
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
            <div className="text-center py-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-red-600 font-medium mb-2">Free identifications used</p>
              <button 
                onClick={() => setLocation('/paywall')}
                className="text-plant-green hover:text-plant-green-dark font-medium underline"
              >
                Upgrade to premium for unlimited access
              </button>
            </div>
          )}
        </div>

        {/* Recent Identifications */}
        {recentIdentifications.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-light text-gray-700 mb-6 text-center">Recent Identifications</h3>
            
            <div className="space-y-4">
              {recentIdentifications.map((item) => (
                <Card key={item.id} className="p-4 bg-white/70 border-0 shadow-sm rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.imageUrl} 
                      alt={item.commonName}
                      className="w-16 h-16 rounded-xl object-cover shadow-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-lg">{item.scientificName}</h4>
                      <p className="text-gray-600 font-light">{item.commonName}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mr-3">
                          <div 
                            className="bg-plant-green h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${item.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{item.confidence}%</span>
                      </div>
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
