import { useLocation } from "wouter";
import { Home, History, Crown } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/history", icon: History, label: "History" },
    { path: "/paywall", icon: Crown, label: "Premium" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md">
      <div className="mx-4 mb-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50">
        <div className="flex justify-around py-3">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className={`flex-1 flex flex-col items-center py-3 transition-all duration-200 ${
                location === path
                  ? "text-plant-green"
                  : "text-gray-400 hover:text-plant-green"
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                location === path
                  ? "bg-plant-green/10"
                  : "hover:bg-plant-green/5"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium mt-1">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
