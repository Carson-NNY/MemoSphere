



## 🌐 Project Title: **MemoSphere – AI-Powered Web App for Journaling & Memories**

------

### 📌 1. Project Overview

**MemoSphere** is a secure and intelligent web application that allows users to **record journal entries**, **save personal memories**, and receive **AI-powered emotional insights** and memory-based storytelling. Designed for self-reflection and emotional growth, it offers a seamless journaling experience enhanced by natural language processing.

------

### 🎯 2. Core Objectives

- Let users write, save, and revisit journal entries or memories.
- Analyze emotional tone using AI and offer thoughtful feedback.
- Surface past entries on significant days (e.g., "On this day, 1 year ago...").
- Be easy to deploy and run on **Replit**, requiring no extra server setup.

------

### 🧠 3. Core Features

#### 📝 Journal & Memory Entry

- Write text-based journal entries.
- Upload optional images (if supported by Replit file upload or URL-based).
- View past entries by calendar or timeline.

#### 💬 Emotion Analysis

- Analyze text with AI (OpenAI API or Hugging Face sentiment model).
- Show mood icons (happy, sad, stressed, neutral).
- Store mood per entry and show trends in a graph.

#### 📅 Memory Recap

- “On this day” logic to display past entries on anniversaries.
- AI-generated summaries: “Two years ago, you felt hopeful about your new journey…”

#### 🔐 Privacy & UX

- Simple login/signup (username + password with hashed storage).
- Private journal storage per user (no public access, but the user can choose to make it public on the public journal place.).
- Anonymous journaling supported using browser LocalStorage for quick starts without login.

### -  modern looking and fancy  UI

- "We should improve the UI to make it more user-friendly and visually appealing."
- "The current interface could benefit from a more modern and responsive design."
- "Let’s refine the UI to enhance usability and overall user experience."
- "Let’s use a better font and more coherent color palette to modernize the look."
- "Consider adding smoother transitions and consistent spacing to elevate the UI."



------

### 🛠️ 4. Tech Stack (Optimized for Replit)

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | HTML5 + CSS3 + JavaScript (or React.js if needed) |
| Backend    | Python (Flask + python-dotenv                     |
| Database   | Replit's built-in DB                              |
| AI/NLP     | OpenAI API (GPT for summaries, emotion detection) |
| Deployment | Replit web server                                 |
| Auth       | Google auth                                       |

### 

```

```



```sql

```

------

### 🔄 7. User Flow (Simplified)

1. Visit `/register` → Create account (no need if already registered)
2. Visit `/login` → Access journal dashboard (no need to login again if already logged in in the past 14 days)
3. Create a new entry → Text submitted → AI analyzes mood
4. Entry saved with timestamp and mood
5. On future visits → "On this day" entries are shown
6. Optionally view mood trends (line chart)



------

### 📌 9. Environment Variables (.env)

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

- also support Chart.js integration for mood visualization
- support : Export data as PDF
- Dark mode toggle

------

