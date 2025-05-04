import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzeJournalEntry, generateMemorySummary, generateMonthlyInsights } from "./openai";
import { insertEntrySchema } from "@shared/schema";
import { z } from "zod";
import { subMonths } from "date-fns";

// Middleware to check if user is authenticated
function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Journal Entries API
  
  // Create a new entry
  app.post("/api/entries", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const entryData = insertEntrySchema.parse({
        ...req.body,
        userId
      });
      
      // Analyze sentiment if content is provided
      let sentimentAnalysis = null;
      if (entryData.content) {
        sentimentAnalysis = await analyzeJournalEntry(entryData.content);
        
        // If no mood was provided but we got one from analysis, use it
        if (!entryData.mood && sentimentAnalysis.primaryEmotion) {
          entryData.mood = sentimentAnalysis.primaryEmotion;
        }
      }
      
      const entry = await storage.createEntry({
        ...entryData,
        sentimentAnalysis
      });
      
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
      const userId = req.user!.id;
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
      if (!entry.isPublic && (!req.user || req.user.id !== entry.userId)) {
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
      
      // Check if the entry belongs to the authenticated user
      if (req.user!.id !== existingEntry.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Re-analyze sentiment if content changed
      let sentimentAnalysis = existingEntry.sentimentAnalysis;
      if (req.body.content && req.body.content !== existingEntry.content) {
        sentimentAnalysis = await analyzeJournalEntry(req.body.content);
        
        // If no mood was provided but we got one from analysis, use it
        if (!req.body.mood && sentimentAnalysis?.primaryEmotion) {
          req.body.mood = sentimentAnalysis.primaryEmotion;
        }
      }
      
      const updatedEntry = await storage.updateEntry(entryId, {
        ...req.body,
        sentimentAnalysis,
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
      
      // Check if the entry belongs to the authenticated user
      if (req.user!.id !== existingEntry.userId) {
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
      const userId = req.user!.id;
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
      const userId = req.user!.id;
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
          mood: entry.mood
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
