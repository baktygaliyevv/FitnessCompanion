import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExerciseSchema, insertWorkoutSchema, insertWorkoutExerciseSchema, insertWorkoutSessionSchema, insertExerciseLogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  // Get exercises by muscle group
  app.get("/api/exercises/muscle/:muscleGroup", async (req, res) => {
    try {
      const { muscleGroup } = req.params;
      const exercises = await storage.getExercisesByMuscleGroup(muscleGroup);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises by muscle group" });
    }
  });

  // Search exercises
  app.get("/api/exercises/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      const exercises = await storage.searchExercises(q);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to search exercises" });
    }
  });

  // Get specific exercise
  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exercise = await storage.getExercise(id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  // Create new exercise
  app.post("/api/exercises", async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  // Get user workouts (using default user ID 1 for now)
  app.get("/api/workouts", async (req, res) => {
    try {
      const userId = 1; // Default user
      const workouts = await storage.getUserWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  // Get specific workout with exercises
  app.get("/api/workouts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workoutData = await storage.getWorkoutWithExercises(id);
      if (!workoutData) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workoutData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  // Create new workout
  app.post("/api/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse({
        ...req.body,
        userId: 1, // Default user
      });
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  // Add exercise to workout
  app.post("/api/workouts/:id/exercises", async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const workoutExerciseData = insertWorkoutExerciseSchema.parse({
        ...req.body,
        workoutId,
      });
      const workoutExercise = await storage.addExerciseToWorkout(workoutExerciseData);
      res.status(201).json(workoutExercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add exercise to workout" });
    }
  });

  // Start workout session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertWorkoutSessionSchema.parse({
        ...req.body,
        userId: 1, // Default user
        startTime: new Date(),
      });
      const session = await storage.createWorkoutSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to start workout session" });
    }
  });

  // End workout session
  app.patch("/api/sessions/:id/end", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { duration, calories } = req.body;
      
      await storage.updateSessionEndTime(
        sessionId,
        new Date(),
        duration,
        calories
      );

      // Update user stats
      const userId = 1; // Default user
      const currentStats = await storage.getUserStats(userId);
      if (currentStats) {
        await storage.updateUserStats(userId, {
          totalWorkouts: currentStats.totalWorkouts + 1,
          totalMinutes: currentStats.totalMinutes + duration,
          totalCalories: currentStats.totalCalories + (calories || 0),
          lastWorkout: new Date(),
        });
      }

      res.json({ message: "Session ended successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to end workout session" });
    }
  });

  // Get recent sessions
  app.get("/api/sessions/recent", async (req, res) => {
    try {
      const userId = 1; // Default user
      const limit = parseInt(req.query.limit as string) || 10;
      const sessions = await storage.getRecentSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent sessions" });
    }
  });

  // Log exercise completion
  app.post("/api/logs", async (req, res) => {
    try {
      const logData = insertExerciseLogSchema.parse(req.body);
      const log = await storage.logExercise(logData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid log data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to log exercise" });
    }
  });

  // Get user stats
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = 1; // Default user
      const stats = await storage.getUserStats(userId);
      if (!stats) {
        return res.status(404).json({ message: "User stats not found" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Get user profile
  app.get("/api/profile", async (req, res) => {
    try {
      const userId = 1; // Default user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...profile } = user;
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
