# ✈️ RoamAI – AI-Powered Trip Planner

RoamAI is a full-stack AI-powered travel planning application that converts natural language trip descriptions into structured, interactive day-by-day travel itineraries.

Unlike a traditional chatbot, RoamAI requests structured JSON from an LLM (Groq Llama 3.3), validates the response using Zod, and renders it as an interactive itinerary that users can edit, refine, reorder, and save.

This project was built as part of a Frontend Internship Assignment with a focus on AI integration, structured data handling, and reliable UI rendering.

# 🚀 Live Demo

### Frontend
https://ai-trip-planner-eight-theta.vercel.app

### Backend
https://ai-trip-planner-backend-ve4g.onrender.com


# ✨ Features

- 🧠 AI-generated travel itineraries from free-form prompts
- 📅 Interactive day-by-day itinerary
- 🔄 AI Refinement Loop to modify existing itineraries
- 📂 Expand and collapse itinerary sections
- 📝 Remove itinerary stops
- ⬆️⬇️ Reorder itinerary stops
- 💾 Save itineraries locally using Local Storage
- 🌙 Dark Mode & ☀️ Light Mode
- 📱 Fully responsive design
- ⏳ Loading, Empty and Error states
- ✅ Zod validation for AI responses
- 🔒 Backend proxy keeps API keys secure
- 🚫 Protection against stale API responses (race condition handling)


# 🏗️ Tech Stack

## Frontend

- React
- Vite
- JavaScript (ES6+)
- React Hooks
- Vanilla CSS
- Lucide React Icons

## Backend

- Node.js
- Express.js
- Groq SDK
- Zod
- dotenv
- CORS

## AI

- Groq API
- Llama-3.3-70B-Versatile

# 📂 Project Structure

```text
ai-trip-planner/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── README.md
├── package.json
└── .gitignore
```


# ⚙️ Installation & Setup

## 1. Clone the repository

```bash
git clone https://github.com/Ravi-fcb/ai-trip-planner.git
```


## 2. Navigate to the project

```bash
cd ai-trip-planner
```


## 3. Install dependencies

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd ../backend
npm install
```


## 4. Configure Environment Variables

Create a `.env` file inside the **backend** folder.

```env
PORT=3001
GROQ_API_KEY=YOUR_GROQ_API_KEY
```


## 5. Start the backend

```bash
cd backend
npm start
```

Backend runs at:

```
http://localhost:3001
```


## 6. Start the frontend

Open another terminal.

```bash
cd frontend
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```


# 🤖 AI Usage

AI tools (including ChatGPT) were used during development for:

- Brainstorming application architecture
- React component scaffolding
- Backend API structure
- Debugging
- UI improvements
- Documentation assistance

All generated code was reviewed, modified, tested, and integrated manually.


# 🛡️ Handling AI Failures

The application is designed to gracefully handle unreliable LLM outputs.

It includes:

- Zod schema validation
- Safe JSON parsing
- Retry mechanism for failed requests
- Friendly error messages
- Loading indicators
- Prevention of stale responses replacing newer requests

These measures ensure the application remains stable even when AI responses are malformed or incomplete.

# ⚠️ Known Limitations

- Depends on the availability of the Groq API.
- Free-tier API rate limits may affect response times.
- Very complex refinement requests may significantly restructure the itinerary.
- Trips are stored using Local Storage and are not synchronized across devices.

---

# 🚀 Future Improvements

If given additional time, I would add:

- User Authentication
- Cloud Database (MongoDB/Supabase)
- Google Maps Integration
- Weather Forecasts
- Budget Estimation
- Hotel Recommendations
- Flight Suggestions
- PDF Export
- Shareable Trip Links
- Drag-and-Drop Reordering


# ⏱️ Time Spent

Approximately **6-7 hours**.


# 👨‍💻 Author

**Ravi Kiran**

GitHub:
https://github.com/Ravi-fcb



# 🙏 Acknowledgements

- Groq
- React
- Express.js
- Vite
- Zod
- Lucide React