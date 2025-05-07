import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Analyze emotion/sentiment of a journal entry
export async function analyzeJournalEntry(text: string) {
  try {
    // Validate the API key before making a request
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "") {
      console.error("OpenAI API key is missing or empty");
      throw new Error("OpenAI API key is not configured");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant specialized in emotional analysis of journal entries. " +
            "Analyze the following journal entry and provide(And respond like you are talking directly to the user: you ....)): " +
            "1. The primary emotion (happy, sad, excited, calm, angry, nervous, stressed, neutral) " +
            "2. A brief emotional insight (1-2 sentences about the emotional state) " +
            "3. A thoughtful suggestion (1 sentence) based on the emotional content " +
            'Return only JSON in this format: { "primaryEmotion": string, "emotionalInsight": string, "suggestion": string }',
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    if (
      !response.choices ||
      response.choices.length === 0 ||
      !response.choices[0].message.content
    ) {
      throw new Error("Invalid response from OpenAI API");
    }

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      throw new Error("Invalid JSON in OpenAI response");
    }
  } catch (error) {
    console.error("Error analyzing journal entry:", error);
    // Return a default analysis if the API fails
    return {
      primaryEmotion: "neutral",
      emotionalInsight: "Unable to analyze the emotional content at this time.",
      suggestion: "Try writing more details about how you feel in your entry.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Generate a summary of past journal entries for the "On This Day" feature
export async function generateMemorySummary(
  entryContent: string,
  yearDifference: number
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that creates nostalgic summaries of past journal entries. " +
            "You should create a brief, thoughtful summary that captures the emotional essence of the entry. " +
            "Begin with a phrase like 'X years ago, you...' where X is the provided year difference.",
        },
        {
          role: "user",
          content: `Create a memory summary for this journal entry from ${yearDifference} year(s) ago: ${entryContent}`,
        },
      ],
      max_tokens: 100,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating memory summary:", error);
    return `${yearDifference} years ago on this day, you wrote this entry.`;
  }
}

// Generate monthly insights based on journal entries
export async function generateMonthlyInsights(
  entries: { content: string; mood?: string }[]
) {
  try {
    // Extract text and moods from entries
    const entriesText = entries
      .map((e) => `Content: ${e.content}\nMood: ${e.mood || "Unknown"}`)
      .join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant specialized in analyzing patterns in journal entries (And respond like you are talking directly to the user: you ....). " +
            "Based on the provided journal entries from this month, create: " +
            "1. A brief summary of overall emotional trends " +
            "2. Three actionable suggestions based on the content " +
            'Return only JSON in this format: { "monthlyReflection": string, "suggestions": [string, string, string] }',
        },
        {
          role: "user",
          content: `Here are the journal entries from this month:\n\n${entriesText}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating monthly insights:", error);
    return {
      monthlyReflection:
        "Your journal entries from the past month show some interesting patterns.",
      suggestions: [
        "Consider writing more regularly to track your emotions",
        "Try to include more details about your daily activities",
        "Reflect on what makes you happy or fulfilled",
      ],
    };
  }
}
