# RoamAI ✈️ - Premium AI Trip Planner (Groq Llama-3 & Refinement Loop)

RoamAI is a premium, interactive, and responsive web application that generates structured, day-by-day travel itineraries from a simple, free-form text description. 

This version is powered by **Groq (Llama-3.3-70b-versatile)**, which enables blazing-fast sub-second generation speeds. It features a luxury glassmorphism dark-themed design and supports a stateful **Refinement Loop** allowing users to modify existing plans.

---

## 🌟 Key Features

- **Free-Form Trip Inputs**: Describe your trip naturally (e.g., *"3 days in Goa, beach hopping, budget-friendly"*).
- **🆕 AI Refinement Loop**: Edit your itinerary on the fly using follow-up text instructions (e.g., *"Make Day 2 more relaxed"* or *"Add vegetarian restaurants to Day 1"*). The backend handles editing the structured JSON and merges changes seamlessly, preserving client-side UI states.
- **Stateful Trip Modifications**: Reorder stops (using up/down arrow buttons) or remove stops entirely. All updates are handled instantly via local React state without hitting rate limits.
- **Luxury UI Aesthetics**: Custom dark glassmorphic design featuring floating ambient glow blobs, linear border gradients, custom category markers (food, lodging, transit, activities), and micro-animations.
- **Theme Toggling**: Seamless support for both Dark Mode and Light Mode.
- **Local Storage Persistence**: Automatically saves your active itinerary, allowing your trip to survive browser refreshes.
- **Robust Validation**: Server-side parsing and verification using Zod schemas.
- **Race Condition Protection**: Request tracking ignores stale responses if multiple requests are made concurrently.

---

## 🏗️ Architecture & Tech Stack

### Frontend (React + Vite)
- Built with **React** functional components and hooks (`useState`, `useEffect`, `useRef`).
- Styling: Plain **Vanilla CSS** with custom variables, smooth transitions, and keyframe animations.
- Icons: **Lucide React**.

### Backend (Node.js + Express)
- Proxy server that holds API keys securely.
- API Connection: Uses `groq-sdk` communicating with the **Llama-3.3-70b-versatile** model.
- **JSON Mode**: Employs Groq's native structured JSON mode (`response_format: { type: "json_object" }`).
- **Validation**: Server-side parsing and verification using **Zod**.

---

## 🚀 Setup & Local Execution

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended, developed on v22.21.0)
- **npm** (developed on v10.9.4)
- A **Groq API Key** (Get one for free from [Groq Console](https://console.groq.com/))

### 2. Environment Configuration
Navigate to the `backend/` directory and open the `.env` file (or create it if it doesn't exist):
```env
PORT=3001
GROQ_API_KEY=your_actual_groq_api_key_here
```

### 3. Installation
From the root directory, run the following command to install all dependencies:
```bash
npm run install:all
```

### 4. Running the App
From the root directory, start both the frontend and backend servers concurrently:
```bash
npm run dev
```
- **Frontend** will be running at: [http://localhost:5173](http://localhost:5173)
- **Backend** will be running at: [http://localhost:3001](http://localhost:3001)

---

## 🤖 AI Usage Note & Development Process
This internship assignment was pair-programmed with **Antigravity**, an advanced AI coding assistant developed by Google DeepMind.
- **AI Assist**: Used to draft the initial code scaffolding, write components, configure Zod schemas, write CSS transition keyframes, and set up the Express routing logic.
- **Human Oversight**: Refined prompt structures, reviewed CORS configurations, validated edge cases in client-side reordering boundaries, and verified mobile styling breakpoints.

---

## ⚠️ Known Limitations
- **API Limits**: The Groq API free tier might return rate limit errors during heavy usage. The backend attempts a retry before surfacing a friendly retry prompt.
- **Refinement Context**: Since it edits JSON directly, extremely complex or contradictory instructions might result in major restructuring.

---

## ⏱️ Time Spent
- **Total Development Time**: ~4 hours.
  - Initial planning & Gemini implementation: 3 hours.
  - Groq migration, Refinement Loop feature, & CSS Luxury styling Overhaul: 1 hour.
