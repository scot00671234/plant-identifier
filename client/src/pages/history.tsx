import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUsageTracker } from "@/hooks/use-usage-tracker";
import { getUserId } from "@/lib/storage";

export default function History() {
  const [, setLocation] = useLocation();
  const { usage } = useUsageTracker();

  const { data: identifications = [] } = useQuery({
    queryKey: ['/api/history', getUserId()],
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

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
          <h1 className="text-xl font-semibold text-gray-900">History</h1>
        </div>
      </header>

      {/* History Content */}
      <main className="p-4">
        {/* Usage Stats */}
        <Card className="p-4 mb-6 bg-plant-green-light">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Daily Usage</h3>
              <p className="text-sm text-gray-600">Resets daily at midnight</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-plant-green">
                {usage?.dailyCount ?? 0}
              </div>
              <div className="text-sm text-gray-600">
                of {usage?.isPremium ? '∞' : '5'} used
              </div>
            </div>
          </div>
        </Card>

        {/* History List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Recent Identifications</h3>
          
          {identifications.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No plant identifications yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start by taking a photo of a plant!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {identifications.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <img 
                      src={item.imageUrl}
                      alt={item.commonName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {item.scientificName}
                      </h4>
                      <p className="text-sm text-gray-600">{item.commonName}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-plant-green font-medium">
                          {item.confidence}% confidence
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(new Date(item.createdAt))}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
