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
          <h1 className="text-xl font-light text-gray-800">History</h1>
        </div>
      </header>

      {/* History Content */}
      <main className="max-w-md mx-auto px-6 py-8">
        {/* Usage Stats */}
        <Card className="p-6 mb-8 bg-white/70 border-0 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800 text-lg">Total Usage</h3>
              <p className="text-gray-500 font-light">Identifications used</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-light text-plant-green">
                {usage?.totalCount ?? 0}
              </div>
              <div className="text-sm text-gray-500 font-light">
                of {usage?.isPremium ? '∞' : '3'} used
              </div>
            </div>
          </div>
        </Card>

        {/* History List */}
        <div className="space-y-4">
          <h3 className="text-xl font-light text-gray-700 text-center">Recent Identifications</h3>
          
          {identifications.length === 0 ? (
            <Card className="p-12 text-center bg-white/70 border-0 shadow-sm rounded-2xl">
              <p className="text-gray-500 text-lg font-light">No plant identifications yet</p>
              <p className="text-gray-400 mt-2 font-light">
                Start by taking a photo of a plant!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {identifications.map((item) => (
                <Card key={item.id} className="p-4 bg-white/70 border-0 shadow-sm rounded-2xl">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={item.imageUrl}
                      alt={item.commonName}
                      className="w-16 h-16 rounded-xl object-cover shadow-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-lg">
                        {item.scientificName}
                      </h4>
                      <p className="text-gray-600 font-light">{item.commonName}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-plant-green h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${item.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">{item.confidence}%</span>
                        </div>
                        <span className="text-xs text-gray-400 font-light">
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
