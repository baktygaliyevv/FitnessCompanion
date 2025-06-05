import { useState } from "react";
import { Plus, Dumbbell, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import WorkoutCreator from "./WorkoutCreator";

export default function FloatingActionButton() {
  const [showMenu, setShowMenu] = useState(false);
  const [showWorkoutCreator, setShowWorkoutCreator] = useState(false);

  const handleQuickAdd = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      {/* Quick Action Menu */}
      {showMenu && (
        <div className="fixed bottom-32 right-6 z-40 space-y-3">
          <Card className="p-3 bg-white shadow-lg">
            <Button
              onClick={() => {
                setShowWorkoutCreator(true);
                setShowMenu(false);
              }}
              variant="ghost"
              className="w-full justify-start text-left"
            >
              <Dumbbell className="w-4 h-4 mr-3" />
              Create Workout
            </Button>
            <Button
              onClick={() => {
                // Navigate to exercises page
                window.location.href = "/exercises";
                setShowMenu(false);
              }}
              variant="ghost"
              className="w-full justify-start text-left"
            >
              <List className="w-4 h-4 mr-3" />
              Browse Exercises
            </Button>
          </Card>
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={handleQuickAdd}
        size="icon"
        className={`fixed bottom-24 right-6 bg-gradient-to-r from-primary-custom to-blue-700 text-white p-4 rounded-full shadow-2xl z-40 transition-all duration-200 w-14 h-14 ${
          showMenu ? "rotate-45 scale-110" : "active:scale-95"
        }`}
      >
        <Plus size={24} />
      </Button>

      {/* Backdrop */}
      {showMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Workout Creator Modal */}
      {showWorkoutCreator && (
        <WorkoutCreator
          onClose={() => setShowWorkoutCreator(false)}
          onWorkoutCreated={() => {
            setShowWorkoutCreator(false);
          }}
        />
      )}
    </>
  );
}
