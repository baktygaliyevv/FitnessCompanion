import { 
  users, exercises, workouts, workoutExercises, workoutSessions, 
  exerciseLogs, userStats,
  type User, type InsertUser, type Exercise, type InsertExercise,
  type Workout, type InsertWorkout, type WorkoutExercise, type InsertWorkoutExercise,
  type WorkoutSession, type InsertWorkoutSession, type ExerciseLog, type InsertExerciseLog,
  type UserStats, type InsertUserStats
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, or, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Exercise methods
  getAllExercises(): Promise<Exercise[]>;
  getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  searchExercises(query: string): Promise<Exercise[]>;
  
  // Workout methods
  getUserWorkouts(userId: number): Promise<Workout[]>;
  getWorkout(id: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getWorkoutWithExercises(workoutId: number): Promise<{workout: Workout, exercises: (WorkoutExercise & {exercise: Exercise})[]} | undefined>;
  
  // Workout exercise methods
  addExerciseToWorkout(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise>;
  getWorkoutExercises(workoutId: number): Promise<(WorkoutExercise & {exercise: Exercise})[]>;
  
  // Session methods
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;
  getRecentSessions(userId: number, limit?: number): Promise<WorkoutSession[]>;
  updateSessionEndTime(sessionId: number, endTime: Date, duration: number, calories?: number): Promise<void>;
  
  // Exercise log methods
  logExercise(log: InsertExerciseLog): Promise<ExerciseLog>;
  getSessionLogs(sessionId: number): Promise<ExerciseLog[]>;
  
  // User stats methods
  getUserStats(userId: number): Promise<UserStats | undefined>;
  updateUserStats(userId: number, stats: Partial<UserStats>): Promise<UserStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private exercises: Map<number, Exercise> = new Map();
  private workouts: Map<number, Workout> = new Map();
  private workoutExercises: Map<number, WorkoutExercise> = new Map();
  private workoutSessions: Map<number, WorkoutSession> = new Map();
  private exerciseLogs: Map<number, ExerciseLog> = new Map();
  private userStatsMap: Map<number, UserStats> = new Map();
  
  private currentUserId = 1;
  private currentExerciseId = 1;
  private currentWorkoutId = 1;
  private currentWorkoutExerciseId = 1;
  private currentSessionId = 1;
  private currentLogId = 1;
  private currentStatsId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "alex",
      password: "password",
      name: "Alex",
      email: "alex@example.com",
      createdAt: new Date(),
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Create default user stats
    const defaultStats: UserStats = {
      id: 1,
      userId: 1,
      totalWorkouts: 12,
      totalMinutes: 180,
      totalCalories: 850,
      currentStreak: 3,
      longestStreak: 7,
      lastWorkout: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    };
    this.userStatsMap.set(1, defaultStats);
    this.currentStatsId = 2;

    // Seed exercises
    const exerciseData = [
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
        videoUrl: null,
        tips: ["Keep your core engaged throughout the movement", "Don't bounce the bar off your chest", "Always use a spotter for heavy weights"]
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
        videoUrl: null,
        tips: ["Keep your core tight", "Don't let your hips sag", "Start on your knees if needed"]
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
        videoUrl: null,
        tips: ["Keep the bar close to your body", "Don't round your back", "Engage your lats"]
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
        videoUrl: null,
        tips: ["Keep knees aligned with toes", "Don't let knees cave inward", "Focus on sitting back"]
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
        videoUrl: null,
        tips: ["Don't swing or use momentum", "Focus on squeezing shoulder blades", "Use assistance if needed"]
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
        videoUrl: null,
        tips: ["Don't swing the weights", "Control the negative", "Keep wrists straight"]
      }
    ];

    exerciseData.forEach((exercise, index) => {
      const id = index + 1;
      this.exercises.set(id, { id, ...exercise });
    });
    this.currentExerciseId = exerciseData.length + 1;

    // Create a sample workout
    const sampleWorkout: Workout = {
      id: 1,
      userId: 1,
      name: "Upper Body Strength",
      description: "A comprehensive upper body workout",
      duration: 45,
      difficulty: "intermediate",
      isTemplate: true,
      createdAt: new Date(),
    };
    this.workouts.set(1, sampleWorkout);
    this.currentWorkoutId = 2;

    // Add exercises to the sample workout
    const workoutExerciseData = [
      { workoutId: 1, exerciseId: 1, sets: 4, reps: 8, weight: 135, restTime: 90, order: 1 },
      { workoutId: 1, exerciseId: 2, sets: 3, reps: 12, weight: null, restTime: 60, order: 2 },
      { workoutId: 1, exerciseId: 5, sets: 3, reps: 6, weight: null, restTime: 120, order: 3 },
      { workoutId: 1, exerciseId: 6, sets: 3, reps: 12, weight: 25, restTime: 60, order: 4 },
    ];

    workoutExerciseData.forEach((we, index) => {
      const id = index + 1;
      this.workoutExercises.set(id, { id, ...we });
    });
    this.currentWorkoutExerciseId = workoutExerciseData.length + 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      email: insertUser.email ?? null 
    };
    this.users.set(id, user);
    
    // Create initial user stats
    const stats: UserStats = {
      id: this.currentStatsId++,
      userId: id,
      totalWorkouts: 0,
      totalMinutes: 0,
      totalCalories: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastWorkout: null,
    };
    this.userStatsMap.set(id, stats);
    
    return user;
  }

  async getAllExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(exercise => 
      exercise.muscleGroups.includes(muscleGroup.toLowerCase())
    );
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = this.currentExerciseId++;
    const exercise: Exercise = { ...insertExercise, id };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.exercises.values()).filter(exercise =>
      exercise.name.toLowerCase().includes(lowercaseQuery) ||
      exercise.description.toLowerCase().includes(lowercaseQuery) ||
      exercise.muscleGroups.some(mg => mg.toLowerCase().includes(lowercaseQuery)) ||
      exercise.equipment.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getUserWorkouts(userId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(workout => workout.userId === userId);
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = this.currentWorkoutId++;
    const workout: Workout = { ...insertWorkout, id, createdAt: new Date() };
    this.workouts.set(id, workout);
    return workout;
  }

  async getWorkoutWithExercises(workoutId: number): Promise<{workout: Workout, exercises: (WorkoutExercise & {exercise: Exercise})[]} | undefined> {
    const workout = this.workouts.get(workoutId);
    if (!workout) return undefined;

    const workoutExercises = Array.from(this.workoutExercises.values())
      .filter(we => we.workoutId === workoutId)
      .sort((a, b) => a.order - b.order)
      .map(we => {
        const exercise = this.exercises.get(we.exerciseId!);
        return { ...we, exercise: exercise! };
      })
      .filter(we => we.exercise);

    return { workout, exercises: workoutExercises };
  }

  async addExerciseToWorkout(insertWorkoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const id = this.currentWorkoutExerciseId++;
    const workoutExercise: WorkoutExercise = { ...insertWorkoutExercise, id };
    this.workoutExercises.set(id, workoutExercise);
    return workoutExercise;
  }

  async getWorkoutExercises(workoutId: number): Promise<(WorkoutExercise & {exercise: Exercise})[]> {
    return Array.from(this.workoutExercises.values())
      .filter(we => we.workoutId === workoutId)
      .sort((a, b) => a.order - b.order)
      .map(we => {
        const exercise = this.exercises.get(we.exerciseId!);
        return { ...we, exercise: exercise! };
      })
      .filter(we => we.exercise);
  }

  async createWorkoutSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession> {
    const id = this.currentSessionId++;
    const session: WorkoutSession = { ...insertSession, id };
    this.workoutSessions.set(id, session);
    return session;
  }

  async getRecentSessions(userId: number, limit = 10): Promise<WorkoutSession[]> {
    return Array.from(this.workoutSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  async updateSessionEndTime(sessionId: number, endTime: Date, duration: number, calories?: number): Promise<void> {
    const session = this.workoutSessions.get(sessionId);
    if (session) {
      session.endTime = endTime;
      session.duration = duration;
      if (calories) session.caloriesBurned = calories;
      this.workoutSessions.set(sessionId, session);
    }
  }

  async logExercise(insertLog: InsertExerciseLog): Promise<ExerciseLog> {
    const id = this.currentLogId++;
    const log: ExerciseLog = { ...insertLog, id };
    this.exerciseLogs.set(id, log);
    return log;
  }

  async getSessionLogs(sessionId: number): Promise<ExerciseLog[]> {
    return Array.from(this.exerciseLogs.values()).filter(log => log.sessionId === sessionId);
  }

  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return this.userStatsMap.get(userId);
  }

  async updateUserStats(userId: number, statsUpdate: Partial<UserStats>): Promise<UserStats> {
    const existingStats = this.userStatsMap.get(userId);
    if (existingStats) {
      const updatedStats = { ...existingStats, ...statsUpdate };
      this.userStatsMap.set(userId, updatedStats);
      return updatedStats;
    } else {
      const newStats: UserStats = {
        id: this.currentStatsId++,
        userId,
        totalWorkouts: 0,
        totalMinutes: 0,
        totalCalories: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastWorkout: null,
        ...statsUpdate,
      };
      this.userStatsMap.set(userId, newStats);
      return newStats;
    }
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises);
  }

  async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    return await db.select().from(exercises)
      .where(sql`${exercises.muscleGroups} @> ARRAY[${muscleGroup.toLowerCase()}]`);
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
    return exercise || undefined;
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const [exercise] = await db
      .insert(exercises)
      .values(insertExercise)
      .returning();
    return exercise;
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const lowercaseQuery = query.toLowerCase();
    return await db.select().from(exercises)
      .where(or(
        like(exercises.name, `%${query}%`),
        like(exercises.description, `%${query}%`),
        like(exercises.equipment, `%${query}%`),
        sql`${exercises.muscleGroups}::text ILIKE ${'%' + lowercaseQuery + '%'}`
      ));
  }

  async getUserWorkouts(userId: number): Promise<Workout[]> {
    return await db.select().from(workouts).where(eq(workouts.userId, userId));
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout || undefined;
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const [workout] = await db
      .insert(workouts)
      .values(insertWorkout)
      .returning();
    return workout;
  }

  async getWorkoutWithExercises(workoutId: number): Promise<{workout: Workout, exercises: (WorkoutExercise & {exercise: Exercise})[]} | undefined> {
    const workout = await this.getWorkout(workoutId);
    if (!workout) return undefined;

    const workoutExercisesData = await db
      .select({
        workoutExercise: workoutExercises,
        exercise: exercises
      })
      .from(workoutExercises)
      .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
      .where(eq(workoutExercises.workoutId, workoutId))
      .orderBy(workoutExercises.order);

    const exercisesWithDetails = workoutExercisesData.map(item => ({
      ...item.workoutExercise,
      exercise: item.exercise
    }));

    return { workout, exercises: exercisesWithDetails };
  }

  async addExerciseToWorkout(insertWorkoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const [workoutExercise] = await db
      .insert(workoutExercises)
      .values(insertWorkoutExercise)
      .returning();
    return workoutExercise;
  }

  async getWorkoutExercises(workoutId: number): Promise<(WorkoutExercise & {exercise: Exercise})[]> {
    const workoutExercisesData = await db
      .select({
        workoutExercise: workoutExercises,
        exercise: exercises
      })
      .from(workoutExercises)
      .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
      .where(eq(workoutExercises.workoutId, workoutId))
      .orderBy(workoutExercises.order);

    return workoutExercisesData.map(item => ({
      ...item.workoutExercise,
      exercise: item.exercise
    }));
  }

  async createWorkoutSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession> {
    const [session] = await db
      .insert(workoutSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getRecentSessions(userId: number, limit = 10): Promise<WorkoutSession[]> {
    return await db.select().from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.startTime))
      .limit(limit);
  }

  async updateSessionEndTime(sessionId: number, endTime: Date, duration: number, calories?: number): Promise<void> {
    await db.update(workoutSessions)
      .set({ 
        endTime, 
        duration, 
        ...(calories && { caloriesBurned: calories })
      })
      .where(eq(workoutSessions.id, sessionId));
  }

  async logExercise(insertLog: InsertExerciseLog): Promise<ExerciseLog> {
    const [log] = await db
      .insert(exerciseLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getSessionLogs(sessionId: number): Promise<ExerciseLog[]> {
    return await db.select().from(exerciseLogs)
      .where(eq(exerciseLogs.sessionId, sessionId));
  }

  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats || undefined;
  }

  async updateUserStats(userId: number, statsUpdate: Partial<UserStats>): Promise<UserStats> {
    const existingStats = await this.getUserStats(userId);
    
    if (existingStats) {
      const [updatedStats] = await db.update(userStats)
        .set(statsUpdate)
        .where(eq(userStats.userId, userId))
        .returning();
      return updatedStats;
    } else {
      const [newStats] = await db.insert(userStats)
        .values({
          userId,
          totalWorkouts: 0,
          totalMinutes: 0,
          totalCalories: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastWorkout: null,
          ...statsUpdate,
        })
        .returning();
      return newStats;
    }
  }
}

// Initialize database storage with seeding
async function initializeDatabase() {
  try {
    // Check if we have any users - if not, seed the database
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length === 0) {
      console.log('Seeding database...');
      
      // Create default user
      const [defaultUser] = await db.insert(users).values({
        username: "alex",
        password: "password",
        name: "Alex",
        email: "alex@example.com",
      }).returning();

      // Create default user stats
      await db.insert(userStats).values({
        userId: defaultUser.id,
        totalWorkouts: 12,
        totalMinutes: 180,
        totalCalories: 850,
        currentStreak: 3,
        longestStreak: 7,
        lastWorkout: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });

      // Seed exercises
      const exerciseData = [
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
          videoUrl: null,
          tips: ["Keep your core engaged throughout the movement", "Don't bounce the bar off your chest", "Always use a spotter for heavy weights"]
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
          videoUrl: null,
          tips: ["Keep your core tight", "Don't let your hips sag", "Start on your knees if needed"]
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
          videoUrl: null,
          tips: ["Keep the bar close to your body", "Don't round your back", "Engage your lats"]
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
          videoUrl: null,
          tips: ["Keep knees aligned with toes", "Don't let knees cave inward", "Focus on sitting back"]
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
          videoUrl: null,
          tips: ["Don't swing or use momentum", "Focus on squeezing shoulder blades", "Use assistance if needed"]
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
          videoUrl: null,
          tips: ["Don't swing the weights", "Control the negative", "Keep wrists straight"]
        }
      ];

      const insertedExercises = await db.insert(exercises).values(exerciseData).returning();

      // Create a sample workout
      const [sampleWorkout] = await db.insert(workouts).values({
        userId: defaultUser.id,
        name: "Upper Body Strength",
        description: "A comprehensive upper body workout",
        duration: 45,
        difficulty: "intermediate",
        isTemplate: true,
      }).returning();

      // Add exercises to the sample workout
      const workoutExerciseData = [
        { workoutId: sampleWorkout.id, exerciseId: insertedExercises[0].id, sets: 4, reps: 8, weight: 135, restTime: 90, order: 1 },
        { workoutId: sampleWorkout.id, exerciseId: insertedExercises[1].id, sets: 3, reps: 12, weight: null, restTime: 60, order: 2 },
        { workoutId: sampleWorkout.id, exerciseId: insertedExercises[4].id, sets: 3, reps: 6, weight: null, restTime: 120, order: 3 },
        { workoutId: sampleWorkout.id, exerciseId: insertedExercises[5].id, sets: 3, reps: 12, weight: 25, restTime: 60, order: 4 },
      ];

      await db.insert(workoutExercises).values(workoutExerciseData);

      console.log('Database seeded successfully!');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export const storage = new DatabaseStorage();

// Initialize the database on startup
initializeDatabase();
