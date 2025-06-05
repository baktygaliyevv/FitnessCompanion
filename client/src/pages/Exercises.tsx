import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Exercise } from "@shared/schema";

interface ExercisesProps {
  onSelectExercise: (exercise: Exercise) => void;
}

export default function Exercises({ onSelectExercise }: ExercisesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

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

  const { data: filteredExercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises/muscle", selectedFilter],
    enabled: selectedFilter !== "all",
    queryFn: async () => {
      const response = await fetch(`/api/exercises/muscle/${selectedFilter}`);
      if (!response.ok) throw new Error("Filter failed");
      return response.json();
    },
  });

  const displayExercises = searchQuery 
    ? searchResults 
    : selectedFilter !== "all" 
    ? filteredExercises 
    : exercises;

  const filters = [
    { id: "all", label: "All" },
    { id: "chest", label: "Chest" },
    { id: "back", label: "Back" },
    { id: "legs", label: "Legs" },
    { id: "arms", label: "Arms" },
  ];

  const getDifficultyStars = (difficulty: string) => {
    const levels = { beginner: 2, intermediate: 3, advanced: 4 };
    const stars = levels[difficulty as keyof typeof levels] || 2;
    return Array.from({ length: stars }, (_, i) => (
      <Star key={i} className="w-3 h-3 fill-current" />
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
    <div className="pb-20">
      {/* Search Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-40">
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-custom focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              className={`filter-tab px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedFilter === filter.id
                  ? "bg-primary-custom text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div className="p-4">
        {displayExercises?.map((exercise) => (
          <Card key={exercise.id} className="exercise-card bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex items-start space-x-4">
              <img 
                src={exercise.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"} 
                alt={`${exercise.name} demonstration`} 
                className="w-20 h-20 object-cover rounded-lg" 
              />
              
              <div className="flex-1">
                <h3 className="font-bold text-lg">{exercise.name}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {exercise.muscleGroups.join(", ")}
                </p>
                
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center">
                    <div className={`flex ${getDifficultyColor(exercise.difficulty)}`}>
                      {getDifficultyStars(exercise.difficulty)}
                    </div>
                    <span className="text-sm text-gray-600 ml-1 capitalize">
                      {exercise.difficulty}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <span className="mr-1">🏋️</span>
                    {exercise.equipment}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => onSelectExercise(exercise)}
                    className="flex-1 bg-primary-custom text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-custom/90"
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {!displayExercises?.length && (
          <div className="text-center py-8">
            <p className="text-gray-500">No exercises found</p>
          </div>
        )}
      </div>
    </div>
  );
}
