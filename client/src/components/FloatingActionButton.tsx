import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FloatingActionButton() {
  const handleQuickAdd = () => {
    // Quick add functionality - could open a menu or modal
    console.log("Quick add exercise/workout");
  };

  return (
    <Button
      onClick={handleQuickAdd}
      size="icon"
      className="fixed bottom-24 right-6 bg-gradient-to-r from-primary-custom to-blue-700 text-white p-4 rounded-full shadow-2xl z-40 active:scale-95 transition-transform hover:shadow-3xl w-14 h-14"
    >
      <Plus size={24} />
    </Button>
  );
}
