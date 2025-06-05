// This file contains the exercise data used to seed the database
// In a real app, this would be in a separate content management system

export const exerciseData = [
  {
    name: "Bench Press",
    description: "A compound upper body exercise targeting chest, triceps, and shoulders",
    instructions: [
      "Lie flat on the bench with your feet firmly planted on the ground. Grip the barbell with your hands slightly wider than shoulder-width apart.",
      "Unrack the barbell and position it directly over your chest with your arms fully extended.",
      "Lower the barbell slowly to your chest, keeping your elbows at a 45-degree angle to your body.",
      "Press the barbell back up to the starting position, exhaling as you push up."
    ],
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: "Barbell",
    difficulty: "intermediate",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    tips: [
      "Keep your core engaged throughout the movement",
      "Don't bounce the bar off your chest",
      "Always use a spotter for heavy weights"
    ]
  },
  {
    name: "Push-ups",
    description: "A bodyweight exercise targeting chest, triceps, and core",
    instructions: [
      "Start in a plank position with hands slightly wider than shoulder-width apart.",
      "Keep your body in a straight line from head to heels.",
      "Lower your body until your chest nearly touches the ground.",
      "Push back up to the starting position, maintaining proper form."
    ],
    muscleGroups: ["chest", "triceps", "core"],
    equipment: "Bodyweight",
    difficulty: "beginner",
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    tips: [
      "Keep your core tight",
      "Don't let your hips sag",
      "Start on your knees if needed"
    ]
  },
  {
    name: "Deadlift",
    description: "A compound exercise targeting back, glutes, and hamstrings",
    instructions: [
      "Stand with feet hip-width apart, barbell over mid-foot.",
      "Bend at hips and knees to grip the bar with hands shoulder-width apart.",
      "Keep chest up and back straight as you lift the bar.",
      "Drive through heels to stand up, extending hips and knees simultaneously.",
      "Lower the bar by pushing hips back and bending knees."
    ],
    muscleGroups: ["back", "glutes", "hamstrings"],
    equipment: "Barbell",
    difficulty: "advanced",
    imageUrl: "https://images.unsplash.com/photo-1434596922112-19c563067271?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    tips: [
      "Keep the bar close to your body",
      "Don't round your back",
      "Engage your lats"
    ]
  },
  {
    name: "Squats",
    description: "A compound lower body exercise targeting quads, glutes, and hamstrings",
    instructions: [
      "Stand with feet shoulder-width apart, toes slightly turned out.",
      "Lower your body by bending at hips and knees as if sitting back into a chair.",
      "Keep your chest up and knees tracking over your toes.",
      "Lower until thighs are parallel to the ground.",
      "Drive through heels to return to starting position."
    ],
    muscleGroups: ["legs", "glutes", "core"],
    equipment: "Bodyweight",
    difficulty: "beginner",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    tips: [
      "Keep knees aligned with toes",
      "Don't let knees cave inward",
      "Focus on sitting back"
    ]
  },
  {
    name: "Pull-ups",
    description: "An upper body exercise targeting back and biceps",
    instructions: [
      "Hang from a pull-up bar with hands slightly wider than shoulder-width apart.",
      "Engage your lats and pull your body up until your chin clears the bar.",
      "Lower yourself slowly to the starting position.",
      "Maintain control throughout the movement."
    ],
    muscleGroups: ["back", "biceps"],
    equipment: "Pull-up Bar",
    difficulty: "intermediate",
    imageUrl: "https://images.unsplash.com/photo-1434596922112-19c563067271?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    tips: [
      "Don't swing or use momentum",
      "Focus on squeezing shoulder blades",
      "Use assistance if needed"
    ]
  },
  {
    name: "Bicep Curls",
    description: "An isolation exercise targeting the biceps",
    instructions: [
      "Stand with feet hip-width apart, holding dumbbells at your sides.",
      "Keep elbows close to your body and curl the weights up.",
      "Squeeze your biceps at the top of the movement.",
      "Lower the weights slowly to the starting position."
    ],
    muscleGroups: ["arms", "biceps"],
    equipment: "Dumbbells",
    difficulty: "beginner",
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    tips: [
      "Don't swing the weights",
      "Control the negative",
      "Keep wrists straight"
    ]
  }
];
