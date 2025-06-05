import { useQuery } from "@tanstack/react-query";
import { User, Settings, Bell, HelpCircle, LogOut, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UserStats } from "@shared/schema";

export default function Profile() {
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const menuItems = [
    { icon: Settings, label: "Settings", action: () => {} },
    { icon: Bell, label: "Notifications", action: () => {} },
    { icon: HelpCircle, label: "Help & Support", action: () => {} },
    { icon: LogOut, label: "Sign Out", action: () => {}, danger: true },
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="gradient-primary p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Edit size={20} />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* User Info Card */}
        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-custom to-secondary-custom rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile?.name || "Alex"}</h2>
              <p className="text-gray-600">{profile?.email || "alex@example.com"}</p>
              <p className="text-sm text-gray-500">Member since {new Date().getFullYear()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-custom">
                {userStats?.totalWorkouts || 0}
              </div>
              <div className="text-sm text-gray-600">Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-custom">
                {userStats?.currentStreak || 0}
              </div>
              <div className="text-sm text-gray-600">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-custom">
                {Math.round((userStats?.totalMinutes || 0) / 60)}h
              </div>
              <div className="text-sm text-gray-600">Hours</div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Calories Burned</span>
              <span className="font-semibold">{userStats?.totalCalories || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Workout Time</span>
              <span className="font-semibold">
                {userStats?.totalWorkouts ? Math.round((userStats.totalMinutes || 0) / userStats.totalWorkouts) : 0} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Longest Streak</span>
              <span className="font-semibold">{userStats?.longestStreak || 0} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Workout</span>
              <span className="font-semibold">
                {userStats?.lastWorkout 
                  ? new Date(userStats.lastWorkout).toLocaleDateString()
                  : "Never"
                }
              </span>
            </div>
          </div>
        </Card>

        {/* Goals & Preferences */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Fitness Goals</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Weekly Workout Goal</div>
                <div className="text-sm text-gray-600">4 workouts per week</div>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Preferred Workout Time</div>
                <div className="text-sm text-gray-600">Morning (6:00 - 9:00 AM)</div>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>
        </Card>

        {/* Menu Items */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Account</h3>
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <div key={item.label}>
                <button
                  onClick={item.action}
                  className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    item.danger ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
                {index < menuItems.length - 1 && <Separator className="my-1" />}
              </div>
            ))}
          </div>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>FitPro App v1.0.0</p>
          <p>Your personal gym trainer</p>
        </div>
      </div>
    </div>
  );
}
