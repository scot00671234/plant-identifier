import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Share, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getUserId } from "@/lib/storage";

export default function Results() {
  const [, setLocation] = useLocation();

  // Get the most recent identification
  const { data: identifications = [] } = useQuery({
    queryKey: ['/api/history', getUserId()],
  });

  const latestIdentification = identifications[0];

  if (!latestIdentification) {
    setLocation('/');
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
          <h1 className="text-xl font-light text-gray-800">Plant Identified</h1>
        </div>
      </header>

      {/* Results Content */}
      <main className="max-w-md mx-auto px-6 py-8 space-y-8">
        {/* Plant Image */}
        <div className="text-center">
          <img 
            src={latestIdentification.imageUrl}
            alt={latestIdentification.commonName}
            className="w-full h-80 rounded-3xl object-cover shadow-2xl shadow-plant-green/10"
          />
        </div>

        {/* Plant Information */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-light text-gray-800 leading-tight">
              {latestIdentification.scientificName}
            </h2>
            <p className="text-xl text-gray-600 font-light">{latestIdentification.commonName}</p>
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center space-x-3 bg-plant-green/10 rounded-full px-4 py-2">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-plant-green h-2 rounded-full transition-all duration-300"
                    style={{ width: `${latestIdentification.confidence}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-plant-green">
                  {latestIdentification.confidence}%
                </span>
              </div>
            </div>
          </div>

          {/* Plant Details Card */}
          <Card className="p-6 space-y-4 bg-white/70 border-0 shadow-sm rounded-2xl">
            <h3 className="font-medium text-gray-800 text-lg">Plant Details</h3>
            <div className="space-y-3">
              {latestIdentification.family && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-light">Family:</span>
                  <span className="font-medium text-gray-800">{latestIdentification.family}</span>
                </div>
              )}
              {latestIdentification.origin && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-light">Origin:</span>
                  <span className="font-medium text-gray-800">{latestIdentification.origin}</span>
                </div>
              )}
              {latestIdentification.type && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-light">Type:</span>
                  <span className="font-medium text-gray-800">{latestIdentification.type}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          {latestIdentification.description && (
            <Card className="p-6 bg-white/70 border-0 shadow-sm rounded-2xl">
              <h3 className="font-medium text-gray-800 text-lg mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed font-light">
                {latestIdentification.description}
              </p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-plant-green to-plant-green-dark hover:from-plant-green-dark hover:to-plant-green text-white py-4 rounded-2xl shadow-lg shadow-plant-green/25 border-0"
              onClick={() => {
                // Mock save functionality
                alert('Result saved to your history!');
              }}
            >
              <Save className="mr-2 h-5 w-5" />
              Save Result
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-2 border-plant-green/30 text-plant-green hover:bg-plant-green/5 py-4 rounded-2xl bg-white/70"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Plant Identified: ${latestIdentification.commonName}`,
                    text: `I identified this plant as ${latestIdentification.scientificName} (${latestIdentification.commonName}) with ${latestIdentification.confidence}% confidence using PlantID!`,
                  });
                } else {
                  alert('Sharing not available on this device');
                }
              }}
            >
              <Share className="mr-2 h-5 w-5" />
              Share
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
