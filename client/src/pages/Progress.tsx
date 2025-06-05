import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Calendar, Target, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { UserStats, WorkoutSession } from "@shared/schema";

export default function Progress() {
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const { data: recentSessions } = useQuery<WorkoutSession[]>({
    queryKey: ["/api/sessions/recent"],
  });

  const getStreakStatus = (streak: number) => {
    if (streak >= 7) return { color: "text-green-600", icon: "🔥", message: "On fire!" };
    if (streak >= 3) return { color: "text-orange-600", icon: "⚡", message: "Great momentum!" };
    if (streak >= 1) return { color: "text-blue-600", icon: "💪", message: "Keep going!" };
    return { color: "text-gray-600", icon: "🎯", message: "Start your streak!" };
  };

  const streakStatus = getStreakStatus(userStats?.currentStreak || 0);

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="gradient-primary p-6 text-white">
        <div className="flex items-center mb-4">
          <TrendingUp className="mr-3" size={32} />
          <div>
            <h1 className="text-2xl font-bold">Your Progress</h1>
            <p className="text-blue-100">Track your fitness journey</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary-custom mb-1">
              {userStats?.totalWorkouts || 0}
            </div>
            <div className="text-sm text-gray-600">Total Workouts</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-secondary-custom mb-1">
              {Math.round((userStats?.totalMinutes || 0) / 60)}h
            </div>
            <div className="text-sm text-gray-600">Hours Trained</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-accent-custom mb-1">
              {userStats?.totalCalories || 0}
            </div>
            <div className="text-sm text-gray-600">Calories Burned</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {userStats?.longestStreak || 0}
            </div>
            <div className="text-sm text-gray-600">Best Streak</div>
          </Card>
        </div>

        {/* Current Streak */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Current Streak</h3>
            <span className="text-2xl">{streakStatus.icon}</span>
          </div>
          
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${streakStatus.color}`}>
              {userStats?.currentStreak || 0}
            </div>
            <div className="text-gray-600 text-sm mb-2">days in a row</div>
            <div className={`text-sm font-medium ${streakStatus.color}`}>
              {streakStatus.message}
            </div>
          </div>
          
          {/* Streak visualization */}
          <div className="flex justify-center mt-4 space-x-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < (userStats?.currentStreak || 0) 
                    ? "bg-primary-custom text-white" 
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </Card>

        {/* Goals Section */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Target className="mr-2 text-primary-custom" size={24} />
            <h3 className="text-lg font-bold">Weekly Goals</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Workouts this week</span>
                <span>3/4</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-custom h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Minutes trained</span>
                <span>180/200</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-secondary-custom h-2 rounded-full" style={{ width: "90%" }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Calendar className="mr-2 text-primary-custom" size={24} />
            <h3 className="text-lg font-bold">Recent Activity</h3>
          </div>
          
          <div className="space-y-3">
            {recentSessions?.slice(0, 5).map((session, index) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Workout Session</div>
                  <div className="text-xs text-gray-500">
                    {session.startTime ? new Date(session.startTime).toLocaleDateString() : 'Unknown date'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{session.duration || 0} min</div>
                  <div className="text-xs text-gray-500">{session.caloriesBurned || 0} cal</div>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                <p>No recent activity</p>
                <p className="text-xs">Start a workout to see your progress!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Award className="mr-2 text-primary-custom" size={24} />
            <h3 className="text-lg font-bold">Achievements</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-xs font-medium">First Workout</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
              <div className="text-2xl mb-1">💪</div>
              <div className="text-xs font-medium">10 Workouts</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xs font-medium">3 Day Streak</div>
            </div>
            
            <div className="text-center p-3 bg-gray-100 rounded-lg opacity-50">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs font-medium">7 Day Streak</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
