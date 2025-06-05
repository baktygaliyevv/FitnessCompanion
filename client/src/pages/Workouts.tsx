import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Clock, Flame, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import WorkoutCreator from "@/components/WorkoutCreator";
import type { Workout } from "@shared/schema";

interface WorkoutsProps {
  onStartWorkout: (workout: any) => void;
}

export default function Workouts({ onStartWorkout }: WorkoutsProps) {
  const [showWorkoutCreator, setShowWorkoutCreator] = useState(false);
  const { data: workouts } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800"
    };
    return colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="gradient-primary p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Workouts</h1>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Plus size={24} />
          </Button>
        </div>
        <p className="text-blue-100">Choose your workout and get started</p>
      </div>

      {/* Quick Start Section */}
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Quick Start</h2>
        
        <Button 
          onClick={() => workouts?.[0] && onStartWorkout(workouts[0])}
          className="w-full gradient-secondary text-white p-4 h-auto rounded-2xl mb-6 shadow-lg active:scale-95 transition-transform"
        >
          <div className="flex items-center justify-center">
            <Play className="mr-3" size={24} />
            <div>
              <div className="font-bold text-lg">Start Quick Workout</div>
              <div className="text-green-100 text-sm">Full body • 30 mins</div>
            </div>
          </div>
        </Button>

        {/* Workout Templates */}
        <h3 className="text-lg font-bold mb-4">Workout Templates</h3>
        <div className="space-y-4">
          {workouts?.map((workout) => (
            <Card key={workout.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{workout.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{workout.description}</p>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {workout.duration} min
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Flame className="w-4 h-4 mr-1" />
                      ~{Math.round((workout.duration || 0) * 10)} cal
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                      {workout.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={() => onStartWorkout(workout)}
                  className="flex-1 bg-primary-custom text-white hover:bg-primary-custom/90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Workout
                </Button>
                <Button variant="outline" className="px-4">
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Custom Workouts Section */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">My Custom Workouts</h3>
          <Card className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <div className="text-gray-400 mb-2">
              <Plus size={32} className="mx-auto" />
            </div>
            <h4 className="font-semibold text-gray-600 mb-1">Create Your First Workout</h4>
            <p className="text-sm text-gray-500 mb-4">Build a custom workout plan tailored to your goals</p>
            <Button className="bg-primary-custom text-white hover:bg-primary-custom/90">
              Create Workout
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
