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
          <h1 className="text-xl font-semibold text-gray-900">Plant Identified</h1>
        </div>
      </header>

      {/* Results Content */}
      <main className="p-4 space-y-6">
        {/* Plant Image */}
        <div className="text-center">
          <img 
            src={latestIdentification.imageUrl}
            alt={latestIdentification.commonName}
            className="w-full h-64 rounded-xl object-cover shadow-md"
          />
        </div>

        {/* Plant Information */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {latestIdentification.scientificName}
            </h2>
            <p className="text-lg text-gray-600">{latestIdentification.commonName}</p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-plant-green rounded-full"></div>
                <span className="text-sm font-medium text-plant-green">
                  {latestIdentification.confidence}% confidence
                </span>
              </div>
            </div>
          </div>

          {/* Plant Details Card */}
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Plant Details</h3>
            <div className="space-y-2 text-sm">
              {latestIdentification.family && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Family:</span>
                  <span className="font-medium">{latestIdentification.family}</span>
                </div>
              )}
              {latestIdentification.origin && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Origin:</span>
                  <span className="font-medium">{latestIdentification.origin}</span>
                </div>
              )}
              {latestIdentification.type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{latestIdentification.type}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          {latestIdentification.description && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                {latestIdentification.description}
              </p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              className="flex-1 bg-plant-green hover:bg-plant-green-dark text-white"
              onClick={() => {
                // Mock save functionality
                alert('Result saved to your history!');
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Result
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
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
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
