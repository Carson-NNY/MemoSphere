import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seed...");

    // Create a demo user
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "demo")
    });

    let userId: number;

    if (!existingUser) {
      console.log("Creating demo user...");
      const hashedPassword = await hashPassword("demopassword");
      const [user] = await db.insert(schema.users)
        .values({
          username: "demo",
          password: hashedPassword
        })
        .returning();
      userId = user.id;
      console.log("Demo user created with ID:", userId);
    } else {
      userId = existingUser.id;
      console.log("Demo user already exists with ID:", userId);
    }

    // Check if we already have entries
    const existingEntries = await db.query.entries.findMany({
      where: (entries, { eq }) => eq(entries.userId, userId)
    });

    if (existingEntries.length > 0) {
      console.log(`User already has ${existingEntries.length} entries, skipping entry creation`);
      return;
    }

    // Create sample journal entries
    console.log("Creating sample journal entries...");
    const sampleEntries = [
      {
        userId,
        title: "Weekend hike with friends",
        content: "It was such a refreshing experience to disconnect from technology and reconnect with nature. The mountain views were absolutely breathtaking, and spending quality time with friends made it even better. I feel rejuvenated and ready for the week ahead.",
        mood: "happy",
        isPublic: false,
        imageUrl: "https://images.unsplash.com/photo-1519834055134-c8c3a3acaaec?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        sentimentAnalysis: {
          primaryEmotion: "happy",
          emotionalInsight: "You're feeling refreshed and energized after connecting with nature and friends.",
          suggestion: "Consider making outdoor activities a regular part of your routine."
        },
        createdAt: new Date("2023-06-12")
      },
      {
        userId,
        title: "Reflections on the job interview",
        content: "Today's interview went better than expected. I was nervous at first, but once we started discussing the technical problems, I felt confident. The team seemed impressed with my portfolio, and I connected well with the potential manager. Now I just need to wait for their response.",
        mood: "nervous",
        isPublic: false,
        imageUrl: null,
        sentimentAnalysis: {
          primaryEmotion: "nervous",
          emotionalInsight: "You started anxious but gained confidence during the interview process.",
          suggestion: "Celebrate this small win regardless of the outcome."
        },
        createdAt: new Date("2023-06-10")
      },
      {
        userId,
        title: "Birthday celebration",
        content: "The surprise party my friends threw for me today was incredible! I had no idea they were planning this for weeks. So grateful for the amazing people in my life. The cake was delicious, and everyone's thoughtful gifts made me feel so appreciated.",
        mood: "excited",
        isPublic: true,
        imageUrl: "https://images.unsplash.com/photo-1533371452382-d45a9da51ad9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        sentimentAnalysis: {
          primaryEmotion: "excited",
          emotionalInsight: "You're feeling loved and appreciative of your social connections.",
          suggestion: "Take time to individually thank those who made your day special."
        },
        createdAt: new Date("2023-06-05")
      },
      {
        userId,
        title: "First day at new job",
        content: "I'm feeling both nervous and excited about starting at the new company tomorrow. It's a big step up in my career, but I know I've prepared well for this opportunity. I've done my research on the company culture and prepared all my questions. Looking forward to meeting my new team!",
        mood: "excited",
        isPublic: false,
        imageUrl: null,
        sentimentAnalysis: {
          primaryEmotion: "excited",
          emotionalInsight: "You're experiencing positive anticipation mixed with natural nervousness about a new beginning.",
          suggestion: "Focus on listening and observing on your first day to help ease the transition."
        },
        createdAt: new Date("2022-06-15")
      }
    ];

    for (const entry of sampleEntries) {
      await db.insert(schema.entries).values(entry);
    }

    console.log(`Created ${sampleEntries.length} sample journal entries`);
    console.log("Database seed completed successfully");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
