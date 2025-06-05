import { useQuery } from "@tanstack/react-query";
import { Play, ArrowRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Exercise, UserStats, Workout } from "@shared/schema";

interface HomeProps {
  onStartWorkout: (workout: any) => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export default function Home({ onStartWorkout, onSelectExercise }: HomeProps) {
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: workouts } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  const muscleGroups = [
    {
      name: "Chest",
      exercises: exercises?.filter(e => e.muscleGroups.includes("chest")).length || 0,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120",
      group: "chest"
    },
    {
      name: "Back", 
      exercises: exercises?.filter(e => e.muscleGroups.includes("back")).length || 0,
      image: "https://images.unsplash.com/photo-1434596922112-19c563067271?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120",
      group: "back"
    },
    {
      name: "Legs",
      exercises: exercises?.filter(e => e.muscleGroups.includes("legs")).length || 0,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120",
      group: "legs"
    },
    {
      name: "Arms",
      exercises: exercises?.filter(e => e.muscleGroups.includes("arms") || e.muscleGroups.includes("biceps")).length || 0,
      image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120",
      group: "arms"
    }
  ];

  const handleStartQuickWorkout = () => {
    if (workouts && workouts.length > 0) {
      onStartWorkout(workouts[0]);
    }
  };

  const handleMuscleGroupClick = (group: string) => {
    if (exercises) {
      const groupExercises = exercises.filter(e => e.muscleGroups.includes(group));
      if (groupExercises.length > 0) {
        onSelectExercise(groupExercises[0]);
      }
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="gradient-primary p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Good morning,</h1>
            <p className="text-blue-100">{profile?.name || "Alex"}!</p>
          </div>
          <Button variant="ghost" size="icon" className="relative p-2 text-white hover:bg-white/20">
            <Bell className="text-xl" />
            <span className="absolute -top-1 -right-1 bg-accent-custom text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
        
        {/* Today's Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">{userStats?.totalWorkouts || 0}</div>
            <div className="text-sm text-blue-100">Workouts</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">{userStats?.totalMinutes || 0}</div>
            <div className="text-sm text-blue-100">Minutes</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="text-2xl font-bold">{userStats?.totalCalories || 0}</div>
            <div className="text-sm text-blue-100">Calories</div>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Quick Start</h2>
        
        {/* Start Workout Button */}
        <Button 
          onClick={handleStartQuickWorkout}
          className="w-full quick-start-button text-white p-4 h-auto rounded-2xl mb-4 shadow-lg active:scale-95 transition-transform"
        >
          <div className="flex items-center justify-center">
            <Play className="mr-3 text-xl" size={24} />
            <div className="text-left">
              <div className="font-bold text-lg">Start Quick Workout</div>
              <div className="text-green-100 text-sm">Full body • 30 mins</div>
            </div>
          </div>
        </Button>

        {/* Current Workout Plan */}
        <Card className="bg-gradient-to-r from-accent-custom/10 to-accent-custom/5 border border-amber-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-amber-800">Today's Plan</h3>
              <p className="text-gray-600 text-sm">Upper Body Strength</p>
              <div className="flex items-center mt-2">
                <div className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                  ⏱️ 45 min
                </div>
                <div className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                  🔥 Advanced
                </div>
              </div>
            </div>
            <Button size="icon" className="bg-accent-custom text-white p-3 rounded-full shadow-lg hover:bg-accent-custom/90">
              <ArrowRight />
            </Button>
          </div>
        </Card>

        {/* Muscle Groups Grid */}
        <h3 className="text-lg font-bold mb-3">Train by Muscle Group</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {muscleGroups.map((group) => (
            <button
              key={group.name}
              onClick={() => handleMuscleGroupClick(group.group)}
              className="muscle-group-card bg-white border border-gray-200 rounded-xl p-4 shadow-sm active:scale-95 transition-all"
            >
              <img 
                src={group.image} 
                alt={`${group.name} workout`} 
                className="w-full h-20 object-cover rounded-lg mb-2" 
              />
              <div className="font-semibold text-sm">{group.name}</div>
              <div className="text-gray-500 text-xs">{group.exercises} exercises</div>
            </button>
          ))}
        </div>

        {/* Recent Workouts */}
        <h3 className="text-lg font-bold mb-3">Recent Workouts</h3>
        <div className="space-y-3">
          <Card className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold">Push Day</h4>
                <p className="text-gray-500 text-sm">Yesterday • 45 min</p>
                <div className="flex items-center mt-2">
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 bg-primary-custom rounded-full flex items-center justify-center text-white text-xs">💪</div>
                    <div className="w-6 h-6 bg-secondary-custom rounded-full flex items-center justify-center text-white text-xs">🔥</div>
                    <div className="w-6 h-6 bg-accent-custom rounded-full flex items-center justify-center text-white text-xs">⚡</div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">8 exercises</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-primary-custom">
                <ArrowRight className="text-lg" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
