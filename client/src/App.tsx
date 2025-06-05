import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Exercises from "@/pages/Exercises";
import Workouts from "@/pages/Workouts";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import Navigation from "@/components/Navigation";
import WorkoutTimer from "@/components/WorkoutTimer";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";
import FloatingActionButton from "@/components/FloatingActionButton";
import { useState } from "react";

function Router() {
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);

  return (
    <div className="mobile-container">
      <Switch>
        <Route path="/" component={() => 
          <Home 
            onStartWorkout={(workout) => {
              setActiveWorkout(workout);
              setIsWorkoutActive(true);
            }} 
            onSelectExercise={setSelectedExercise}
          />
        } />
        <Route path="/workouts" component={() => 
          <Workouts 
            onStartWorkout={(workout) => {
              setActiveWorkout(workout);
              setIsWorkoutActive(true);
            }}
          />
        } />
        <Route path="/exercises" component={() => 
          <Exercises 
            onSelectExercise={setSelectedExercise}
          />
        } />
        <Route path="/progress" component={Progress} />
        <Route path="/profile" component={Profile} />
      </Switch>

      <Navigation />
      <FloatingActionButton />

      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onStartExercise={() => {
            // Start single exercise workout
            setSelectedExercise(null);
          }}
        />
      )}

      {isWorkoutActive && activeWorkout && (
        <WorkoutTimer
          workout={activeWorkout}
          onEndWorkout={() => {
            setIsWorkoutActive(false);
            setActiveWorkout(null);
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
