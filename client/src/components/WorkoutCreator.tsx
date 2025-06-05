import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import type { Exercise, InsertWorkout } from "@shared/schema";

interface WorkoutCreatorProps {
  onClose: () => void;
  onWorkoutCreated: (workout: any) => void;
}

interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  weight?: number;
  restTime: number;
}

export default function WorkoutCreator({ onClose, onWorkoutCreated }: WorkoutCreatorProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const queryClient = useQueryClient();

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: searchResults } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises/search", searchQuery],
    enabled: !!searchQuery,
    queryFn: async () => {
      const response = await fetch(`/api/exercises/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (workoutData: InsertWorkout) => {
      const response = await apiRequest("POST", "/api/workouts", workoutData);
      return response.json();
    },
    onSuccess: (workout) => {
      // Add exercises to the workout
      selectedExercises.forEach(async (we, index) => {
        await apiRequest("POST", `/api/workouts/${workout.id}/exercises`, {
          exerciseId: we.exercise.id,
          sets: we.sets,
          reps: we.reps,
          weight: we.weight,
          restTime: we.restTime,
          order: index + 1,
        });
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      onWorkoutCreated(workout);
      onClose();
    },
  });

  const addExercise = (exercise: Exercise) => {
    const workoutExercise: WorkoutExercise = {
      exercise,
      sets: 3,
      reps: 12,
      weight: undefined,
      restTime: 60,
    };
    setSelectedExercises(prev => [...prev, workoutExercise]);
    setShowExerciseSelector(false);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    setSelectedExercises(prev => 
      prev.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    );
  };

  const handleCreateWorkout = () => {
    if (!workoutName.trim() || selectedExercises.length === 0) return;

    const estimatedDuration = selectedExercises.reduce((total, ex) => {
      return total + (ex.sets * 2) + (ex.restTime * ex.sets / 60);
    }, 0);

    createWorkoutMutation.mutate({
      name: workoutName,
      description: workoutDescription,
      difficulty,
      duration: Math.round(estimatedDuration),
      isTemplate: false,
    });
  };

  const displayExercises = searchQuery ? searchResults : exercises;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create Workout</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={24} />
            </Button>
          </div>

          {/* Workout Details */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Workout Name</label>
              <Input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Enter workout name"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                value={workoutDescription}
                onChange={(e) => setWorkoutDescription(e.target.value)}
                placeholder="Brief description (optional)"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Exercises */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Exercises ({selectedExercises.length})</h3>
              <Button
                onClick={() => setShowExerciseSelector(true)}
                className="bg-primary-custom text-white hover:bg-primary-custom/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            {selectedExercises.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                <p>No exercises added yet</p>
                <p className="text-sm">Tap "Add Exercise" to get started</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {selectedExercises.map((we, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{we.exercise.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {we.exercise.muscleGroups.join(", ")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExercise(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Sets</label>
                        <Input
                          type="number"
                          value={we.sets}
                          onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                          min="1"
                          max="10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Reps</label>
                        <Input
                          type="number"
                          value={we.reps}
                          onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                          min="1"
                          max="50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Weight (lbs)</label>
                        <Input
                          type="number"
                          value={we.weight || ""}
                          onChange={(e) => updateExercise(index, 'weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="BW"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Exercise Selector Modal */}
          {showExerciseSelector && (
            <div className="fixed inset-0 bg-black/50 z-10 flex items-end">
              <div className="w-full bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Select Exercise</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowExerciseSelector(false)}>
                      <X size={20} />
                    </Button>
                  </div>

                  <div className="relative mb-4">
                    <Input
                      type="text"
                      placeholder="Search exercises..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>

                  <div className="space-y-2">
                    {displayExercises?.map((exercise) => (
                      <Card key={exercise.id} className="p-3 cursor-pointer hover:bg-gray-50" onClick={() => addExercise(exercise)}>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={exercise.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"} 
                            alt={exercise.name} 
                            className="w-12 h-12 object-cover rounded-lg" 
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{exercise.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">
                              {exercise.muscleGroups.join(", ")}
                            </p>
                          </div>
                          <Plus className="w-5 h-5 text-primary-custom" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Button */}
          <Button
            onClick={handleCreateWorkout}
            disabled={!workoutName.trim() || selectedExercises.length === 0 || createWorkoutMutation.isPending}
            className="w-full bg-primary-custom text-white py-3 rounded-xl font-bold text-lg hover:bg-primary-custom/90 disabled:opacity-50"
          >
            {createWorkoutMutation.isPending ? "Creating..." : "Create Workout"}
          </Button>
        </div>
      </div>
    </div>
  );
}