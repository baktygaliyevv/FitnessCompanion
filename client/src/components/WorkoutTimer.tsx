import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, X, Play, Pause, SkipForward, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import type { Workout } from "@shared/schema";

interface WorkoutTimerProps {
  workout: Workout;
  onEndWorkout: () => void;
}

export default function WorkoutTimer({ workout, onEndWorkout }: WorkoutTimerProps) {
  const [workoutTime, setWorkoutTime] = useState(0); // Total workout time in seconds
  const [restTime, setRestTime] = useState(60); // Rest time in seconds
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Get workout details with exercises
  const { data: workoutData } = useQuery({
    queryKey: ["/api/workouts", workout.id],
    queryFn: async () => {
      const response = await fetch(`/api/workouts/${workout.id}`);
      if (!response.ok) throw new Error("Failed to fetch workout");
      return response.json();
    },
  });

  // Start workout session
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sessions", {
        workoutId: workout.id,
      });
      return response.json();
    },
    onSuccess: (session) => {
      setSessionId(session.id);
    },
  });

  // End workout session
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      await apiRequest("PATCH", `/api/sessions/${sessionId}/end`, {
        duration: Math.round(workoutTime / 60),
        calories: Math.round(workoutTime * 0.15), // Rough calorie calculation
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/recent"] });
      onEndWorkout();
    },
  });

  // Log exercise completion
  const logExerciseMutation = useMutation({
    mutationFn: async (logData: any) => {
      await apiRequest("POST", "/api/logs", logData);
    },
  });

  // Initialize session on mount
  useEffect(() => {
    startSessionMutation.mutate();
  }, []);

  // Timer effects
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  useEffect(() => {
    if (isResting && restTime > 0 && !isPaused) {
      const interval = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 60; // Reset rest time
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isResting, restTime, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = workoutData?.exercises?.[currentExerciseIndex];
  const totalSets = currentExercise?.sets || 3;

  const handleCompleteSet = () => {
    if (sessionId && currentExercise) {
      logExerciseMutation.mutate({
        sessionId,
        exerciseId: currentExercise.exerciseId,
        setNumber: currentSet,
        reps: currentExercise.reps,
        weight: currentExercise.weight,
        completed: true,
      });
    }

    if (currentSet < totalSets) {
      setCurrentSet(prev => prev + 1);
      setIsResting(true);
      setRestTime(currentExercise?.restTime || 60);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < (workoutData?.exercises?.length || 1) - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        setIsResting(true);
        setRestTime(120); // Longer rest between exercises
      } else {
        // Workout complete
        handleEndWorkout();
      }
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTime(60);
  };

  const handleEndWorkout = () => {
    endSessionMutation.mutate();
  };

  if (!workoutData || !currentExercise) {
    return (
      <div className="fixed inset-0 bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading workout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-secondary-custom to-green-700 text-white z-50 overflow-hidden">
      <div className="max-w-md mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPaused(!isPaused)}
            className="text-white hover:bg-white/20"
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </Button>
          <h2 className="text-xl font-bold">{workout.name}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEndWorkout}
            className="text-white hover:bg-white/20"
          >
            <X size={24} />
          </Button>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6 px-6">
          <div className="text-6xl font-bold mb-2">{formatTime(workoutTime)}</div>
          <div className="text-green-100">Total Workout Time</div>
        </div>

        {/* Current Exercise */}
        <Card className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 mx-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold">{currentExercise.exercise?.name}</h3>
              <p className="text-green-100">
                Exercise {currentExerciseIndex + 1} of {workoutData.exercises.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentSet}</div>
              <div className="text-green-100 text-sm">of {totalSets} sets</div>
            </div>
          </div>
          
          {/* Set Information */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentExercise.reps}</div>
              <div className="text-green-100 text-sm">Reps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentExercise.weight || "BW"}</div>
              <div className="text-green-100 text-sm">{currentExercise.weight ? "lbs" : "Bodyweight"}</div>
            </div>
          </div>
        </Card>

        {/* Rest Timer */}
        {isResting && (
          <Card className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-4 mb-6 mx-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-amber-100">Rest Time</h4>
                <p className="text-amber-200 text-sm">Take a break between sets</p>
              </div>
              <div className="text-3xl font-bold text-amber-100">{formatTime(restTime)}</div>
            </div>
            <div className="w-full bg-amber-500/20 rounded-full h-2">
              <div 
                className="bg-amber-400 h-2 rounded-full transition-all duration-1000" 
                style={{ 
                  width: `${((currentExercise?.restTime || 60) - restTime) / (currentExercise?.restTime || 60) * 100}%` 
                }}
              ></div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="px-6 mt-auto pb-6 space-y-3">
          <Button
            onClick={handleCompleteSet}
            className="w-full bg-white text-green-700 py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform hover:bg-gray-100"
          >
            Complete Set
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleSkipRest}
              disabled={!isResting}
              variant="ghost"
              className="bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl font-medium hover:bg-white/30 disabled:opacity-50"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip Rest
            </Button>
            <Button
              variant="ghost"
              className="bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl font-medium hover:bg-white/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Weight
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
