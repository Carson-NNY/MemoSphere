import { db } from "@db";
import { eq, desc, and, sql } from "drizzle-orm";
import { users, entries, User, Entry, InsertUser, InsertEntry } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Journal entry operations
  createEntry(entry: InsertEntry): Promise<Entry>;
  getEntryById(id: number): Promise<Entry | undefined>;
  getEntriesByUserId(userId: number): Promise<Entry[]>;
  getPublicEntries(): Promise<Entry[]>;
  updateEntry(id: number, entry: Partial<InsertEntry>): Promise<Entry | undefined>;
  deleteEntry(id: number): Promise<boolean>;
  
  // "On this day" entries
  getOnThisDayEntries(userId: number): Promise<Entry[]>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session' 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  
  async getUserByFirebaseUid(uid: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.firebaseUid, uid)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Make sure we don't try to update the id field
    const { id: _id, ...updateData } = userData;
    
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  async createEntry(entry: InsertEntry): Promise<Entry> {
    const result = await db.insert(entries).values(entry).returning();
    return result[0];
  }

  async getEntryById(id: number): Promise<Entry | undefined> {
    const result = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
    return result[0];
  }

  async getEntriesByUserId(userId: number): Promise<Entry[]> {
    return await db.select().from(entries)
      .where(eq(entries.userId, userId))
      .orderBy(desc(entries.createdAt));
  }

  async getPublicEntries(): Promise<Entry[]> {
    return await db.select({
      id: entries.id,
      userId: entries.userId,
      title: entries.title,
      content: entries.content,
      mood: entries.mood,
      isPublic: entries.isPublic,
      imageUrl: entries.imageUrl,
      createdAt: entries.createdAt,
      sentimentAnalysis: entries.sentimentAnalysis,
      user: {
        username: users.username
      }
    }).from(entries)
      .leftJoin(users, eq(entries.userId, users.id))
      .where(eq(entries.isPublic, true))
      .orderBy(desc(entries.createdAt));
  }

  async updateEntry(id: number, entryData: Partial<InsertEntry>): Promise<Entry | undefined> {
    const result = await db.update(entries)
      .set(entryData)
      .where(eq(entries.id, id))
      .returning();
    
    return result[0];
  }

  async deleteEntry(id: number): Promise<boolean> {
    const result = await db.delete(entries).where(eq(entries.id, id)).returning();
    return result.length > 0;
  }

  async getOnThisDayEntries(userId: number): Promise<Entry[]> {
    // Get entries from previous years that match the current month and day
    const result = await db.select().from(entries)
      .where(and(
        eq(entries.userId, userId),
        sql`EXTRACT(MONTH FROM ${entries.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`,
        sql`EXTRACT(DAY FROM ${entries.createdAt}) = EXTRACT(DAY FROM CURRENT_DATE)`,
        sql`EXTRACT(YEAR FROM ${entries.createdAt}) < EXTRACT(YEAR FROM CURRENT_DATE)`
      ))
      .orderBy(desc(entries.createdAt));
    
    return result;
  }
}

export const storage = new DatabaseStorage();
