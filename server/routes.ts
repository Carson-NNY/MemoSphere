import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzeJournalEntry, generateMemorySummary, generateMonthlyInsights } from "./openai";
import { insertEntrySchema, insertUserSchema, User } from "@shared/schema";
import { z } from "zod";
import { subMonths } from "date-fns";
import { hashPassword } from "./auth";

// Schema for Firebase auth
const firebaseAuthSchema = z.object({
  uid: z.string(),
  displayName: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  photoURL: z.string().nullable().optional()
});

// Middleware to check if user is authenticated
function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ 
    message: "Authentication required",
    code: "AUTH_REQUIRED",
    details: "You must be logged in to access this resource" 
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Firebase authentication endpoint
  app.post("/api/firebase-auth", async (req, res, next) => {
    try {
      const firebaseData = firebaseAuthSchema.parse(req.body);
      
      // Check if user with this Firebase UID exists
      let user = await storage.getUserByFirebaseUid(firebaseData.uid);
      
      if (!user) {
        // Create new user if not exists
        // Generate a secure random password that won't be used for login
        const crypto = await import('crypto');
        const randomPassword = crypto.randomBytes(24).toString('hex');
        const hashedPassword = await hashPassword(randomPassword);
        
        // Create unique username based on email or uid if email is unavailable
        const usernameBase = firebaseData.email?.split('@')[0] || `user_${firebaseData.uid.substring(0, 8)}`;
        // Ensure the username is unique by adding random characters if needed
        let username = usernameBase;
        let existingUser = await storage.getUserByUsername(username);
        
        if (existingUser) {
          // Add a random suffix to make the username unique
          username = `${usernameBase}_${crypto.randomBytes(3).toString('hex')}`;
        }
        
        user = await storage.createUser({
          username,
          password: hashedPassword,
          displayName: firebaseData.displayName || null,
          email: firebaseData.email || null,
          photoURL: firebaseData.photoURL || null,
          firebaseUid: firebaseData.uid
        });
      } else {
        // Update user data if it has changed
        const updates: { 
          displayName?: string | null;
          email?: string | null;
          photoURL?: string | null;
        } = {};
        let hasUpdates = false;
        
        if (firebaseData.displayName !== undefined && firebaseData.displayName !== user.displayName) {
          updates.displayName = firebaseData.displayName;
          hasUpdates = true;
        }
        
        if (firebaseData.email !== undefined && firebaseData.email !== user.email) {
          updates.email = firebaseData.email;
          hasUpdates = true;
        }
        
        if (firebaseData.photoURL !== undefined && firebaseData.photoURL !== user.photoURL) {
          updates.photoURL = firebaseData.photoURL;
          hasUpdates = true;
        }
        
        if (hasUpdates && 'updateUser' in storage) {
          try {
            const updatedUser = await (storage as any).updateUser(user.id, updates);
            if (updatedUser) {
              user = updatedUser;
            }
          } catch (updateError) {
            console.error("Failed to update user profile:", updateError);
            // Continue with login even if update fails
          }
        }
      }
      
      // Safety check - ensure we have a valid user before logging in
      if (!user) {
        return res.status(500).json({ message: "Failed to create or retrieve user account" });
      }
      
      // Log in the user
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        // Don't return the password hash to the client
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  // Journal Entries API
  
  // Create a new entry
  app.post("/api/entries", isAuthenticated, async (req, res, next) => {
    try {
      // Ensure req.user is defined and has an id
      if (!req.user || typeof req.user.id !== 'number') {
        return res.status(401).json({ message: "User not properly authenticated" });
      }
      
      const userId = req.user.id;
      const entryData = insertEntrySchema.parse({
        ...req.body,
        userId
      });
      
      // Analyze sentiment if content is provided
      let sentimentAnalysis = null;
      if (entryData.content) {
        sentimentAnalysis = await analyzeJournalEntry(entryData.content);
        
        // If no mood was provided but we got one from analysis, use it
        if (!entryData.mood && sentimentAnalysis && typeof sentimentAnalysis === 'object' && 'primaryEmotion' in sentimentAnalysis) {
          entryData.mood = sentimentAnalysis.primaryEmotion as string;
        }
      }
      
      // Create the entry (without sentimentAnalysis in the initial data)
      const entry = await storage.createEntry(entryData);
      
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });
  
  // Get all entries for the authenticated user
  app.get("/api/entries", isAuthenticated, async (req, res, next) => {
    try {
      // Ensure req.user is defined and has an id
      if (!req.user || typeof req.user.id !== 'number') {
        return res.status(401).json({ message: "User not properly authenticated" });
      }
      
      const userId = req.user.id;
      const entries = await storage.getEntriesByUserId(userId);
      res.json(entries);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific entry
  app.get("/api/entries/:id", async (req, res, next) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const entry = await storage.getEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      // Check if the entry is public or belongs to the authenticated user
      if (!entry.isPublic && (!req.user || typeof req.user.id !== 'number' || req.user.id !== entry.userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(entry);
    } catch (error) {
      next(error);
    }
  });
  
  // Update an entry
  app.put("/api/entries/:id", isAuthenticated, async (req, res, next) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const existingEntry = await storage.getEntryById(entryId);
      
      if (!existingEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      // Ensure req.user is defined and has an id
      if (!req.user || typeof req.user.id !== 'number') {
        return res.status(401).json({ message: "User not properly authenticated" });
      }
      
      // Check if the entry belongs to the authenticated user
      if (req.user.id !== existingEntry.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Re-analyze sentiment if content changed
      if (req.body.content && req.body.content !== existingEntry.content) {
        const sentimentAnalysis = await analyzeJournalEntry(req.body.content);
        
        // If no mood was provided but we got one from analysis, use it
        if (!req.body.mood && sentimentAnalysis && typeof sentimentAnalysis === 'object' && 'primaryEmotion' in sentimentAnalysis) {
          req.body.mood = sentimentAnalysis.primaryEmotion as string;
        }
      }
      
      const updatedEntry = await storage.updateEntry(entryId, {
        ...req.body,
        userId: existingEntry.userId // Ensure userId doesn't change
      });
      
      res.json(updatedEntry);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete an entry
  app.delete("/api/entries/:id", isAuthenticated, async (req, res, next) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const existingEntry = await storage.getEntryById(entryId);
      
      if (!existingEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      // Ensure req.user is defined and has an id
      if (!req.user || typeof req.user.id !== 'number') {
        return res.status(401).json({ message: "User not properly authenticated" });
      }
      
      // Check if the entry belongs to the authenticated user
      if (req.user.id !== existingEntry.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const success = await storage.deleteEntry(entryId);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete entry" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Get "On This Day" entries
  app.get("/api/memories/on-this-day", isAuthenticated, async (req, res, next) => {
    try {
      // Ensure req.user is defined and has an id
      if (!req.user || typeof req.user.id !== 'number') {
        return res.status(401).json({ message: "User not properly authenticated" });
      }
      
      const userId = req.user.id;
      const entries = await storage.getOnThisDayEntries(userId);
      
      // Generate memory summaries for each entry
      const memoriesWithSummaries = await Promise.all(
        entries.map(async (entry) => {
          const createdAt = new Date(entry.createdAt);
          const currentYear = new Date().getFullYear();
          const entryYear = createdAt.getFullYear();
          const yearDifference = currentYear - entryYear;
          
          const summary = await generateMemorySummary(entry.content, yearDifference);
          
          return {
            ...entry,
            memorySummary: summary,
            yearDifference
          };
        })
      );
      
      res.json(memoriesWithSummaries);
    } catch (error) {
      next(error);
    }
  });
  
  // Get public entries
  app.get("/api/entries/public", async (req, res, next) => {
    try {
      const publicEntries = await storage.getPublicEntries();
      res.json(publicEntries);
    } catch (error) {
      next(error);
    }
  });
  
  // Get monthly insights
  app.get("/api/insights/monthly", isAuthenticated, async (req, res, next) => {
    try {
      // Ensure req.user is defined and has an id
      if (!req.user || typeof req.user.id !== 'number') {
        return res.status(401).json({ message: "User not properly authenticated" });
      }
      
      const userId = req.user.id;
      const now = new Date();
      const oneMonthAgo = subMonths(now, 1);
      
      // Get entries from the past month
      const entries = await storage.getEntriesByUserId(userId);
      const recentEntries = entries.filter(
        entry => new Date(entry.createdAt) >= oneMonthAgo
      );
      
      if (recentEntries.length === 0) {
        return res.json({
          monthlyReflection: "You haven't created any journal entries in the past month.",
          suggestions: [
            "Try to write at least once a week",
            "Short entries are better than no entries",
            "Set a reminder to journal regularly"
          ]
        });
      }
      
      // Generate insights based on recent entries
      const insights = await generateMonthlyInsights(
        recentEntries.map(entry => ({
          content: entry.content,
          mood: entry.mood || undefined
        }))
      );
      
      res.json({
        ...insights,
        entryCount: recentEntries.length
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
