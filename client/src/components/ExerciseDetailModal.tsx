import { X, Play, Target, Dumbbell, Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Exercise } from "@shared/schema";

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
  onStartExercise: () => void;
}

export default function ExerciseDetailModal({ exercise, onClose, onStartExercise }: ExerciseDetailModalProps) {
  const getDifficultyStars = (difficulty: string) => {
    const levels = { beginner: 2, intermediate: 3, advanced: 4 };
    const stars = levels[difficulty as keyof typeof levels] || 2;
    return Array.from({ length: stars }, (_, i) => (
      <Star key={i} className="w-4 h-4 fill-current" />
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: "text-secondary-custom",
      intermediate: "text-accent-custom",
      advanced: "text-red-500"
    };
    return colors[difficulty as keyof typeof colors] || "text-secondary-custom";
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{exercise.name}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </Button>
          </div>

          {/* Exercise Video/Image */}
          <div className="relative mb-6">
            <img 
              src={exercise.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"} 
              alt={`${exercise.name} demonstration`} 
              className="w-full h-48 object-cover rounded-xl" 
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 rounded-xl"
            >
              <div className="bg-primary-custom/80 text-white rounded-full p-4">
                <Play className="text-2xl" size={32} />
              </div>
            </Button>
          </div>

          {/* Exercise Info */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <Card className="bg-blue-50 p-3 border-blue-200">
                <Target className="text-primary-custom text-xl mb-2 mx-auto" size={24} />
                <div className="text-sm font-medium">Primary</div>
                <div className="text-xs text-gray-600 capitalize">
                  {exercise.muscleGroups[0]}
                </div>
              </Card>
            </div>
            <div className="text-center">
              <Card className="bg-green-50 p-3 border-green-200">
                <Dumbbell className="text-secondary-custom text-xl mb-2 mx-auto" size={24} />
                <div className="text-sm font-medium">Equipment</div>
                <div className="text-xs text-gray-600">{exercise.equipment}</div>
              </Card>
            </div>
            <div className="text-center">
              <Card className="bg-amber-50 p-3 border-amber-200">
                <div className={`flex justify-center mb-2 ${getDifficultyColor(exercise.difficulty)}`}>
                  {getDifficultyStars(exercise.difficulty)}
                </div>
                <div className="text-sm font-medium">Level</div>
                <div className="text-xs text-gray-600 capitalize">{exercise.difficulty}</div>
              </Card>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">About</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{exercise.description}</p>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">Instructions</h3>
            <div className="space-y-3">
              {exercise.instructions.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-primary-custom text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {exercise.tips && exercise.tips.length > 0 && (
            <Card className="bg-yellow-50 border border-yellow-200 p-4 mb-6">
              <h4 className="font-bold text-yellow-800 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {exercise.tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Muscle Groups */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">Muscle Groups</h3>
            <div className="flex flex-wrap gap-2">
              {exercise.muscleGroups.map((muscle) => (
                <span
                  key={muscle}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-primary-custom text-white hover:bg-primary-custom/90">
              <Plus className="w-4 h-4 mr-2" />
              Add to Workout
            </Button>
            <Button
              onClick={onStartExercise}
              className="bg-secondary-custom text-white hover:bg-secondary-custom/90"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
