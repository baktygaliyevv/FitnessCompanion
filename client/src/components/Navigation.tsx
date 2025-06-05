import { Link, useLocation } from "wouter";
import { Home, Dumbbell, List, TrendingUp, User } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/workouts", icon: Dumbbell, label: "Workouts" },
    { path: "/exercises", icon: List, label: "Exercises" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path} className="nav-btn flex flex-col items-center p-2 rounded-lg">
              <Icon 
                className={`text-xl mb-1 ${
                  isActive ? "text-primary-custom" : "text-gray-400"
                }`}
                size={24}
              />
              <span 
                className={`text-xs font-medium ${
                  isActive ? "text-primary-custom" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
