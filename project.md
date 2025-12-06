# 🧠 Cursor Project Plan: Fantasy Premier League (FPL) Assistant

## 🎯 Overview

Build an **AI-powered Fantasy Premier League (FPL) web app** that helps users analyze fixtures, players, clubs, and managers for the current season using **official FPL public APIs**.  
The app will include a **context-aware AI assistant** that can understand what page the user is on and answer questions accordingly.

---

## 🧩 Tech Stack

### Frontend

- React + TypeScript
- TailwindCSS (styling)
- shadcn/ui (modern UI components)
- Recharts (charts)
- React Router (navigation)

### Backend / Data

- Direct API calls to FPL endpoints (no backend needed initially)
- Optional caching layer with Node.js + Express (future phase)

### AI Integration

- Use Google Gemini or OpenAI GPT for the contextual assistant
- AI Agent understands the "current screen" and related data

---

## ⚙️ Core Features

| Module | Description | Endpoints |
|--------|-------------|-----------|
| **Fixtures** | Show fixtures by gameweek, filter by club, display difficulty | `/api/fixtures/`, `/api/bootstrap-static/` |
| **Clubs** | Team info, past & upcoming fixtures, comparison | `/api/bootstrap-static/`, `/api/fixtures/` |
| **Players** | Player profile, points breakdown, stats, comparison | `/api/bootstrap-static/`, `/api/element-summary/{player_id}/` |
| **Manager** | Manager info, history, transfers, chips | `/api/entry/{manager_id}/`, `/api/entry/{manager_id}/history/`, `/api/entry/{manager_id}/transfers/` |
| **Leagues** | League info, standings | `/api/leagues-classic/{league_id}/standings/` |
| **AI Agent** | Answers contextual FPL questions based on screen + data | Uses Gemini/OpenAI API |

---

## 🧱 Project Structure

```
src/
├── components/
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── AIChat.tsx
│   └── LoadingSpinner.tsx
│
├── modules/
│   ├── Fixtures/
│   │   ├── FixturesPage.tsx
│   │   └── FixtureCard.tsx
│   ├── Clubs/
│   │   ├── ClubsPage.tsx
│   │   └── ClubCompare.tsx
│   ├── Players/
│   │   ├── PlayersPage.tsx
│   │   └── PlayerCompare.tsx
│   ├── Managers/
│   │   ├── ManagerPage.tsx
│   │   └── ManagerHistoryChart.tsx
│   └── Leagues/
│       ├── LeaguePage.tsx
│       └── LeagueTable.tsx
│
├── hooks/
│   ├── useFPLApi.ts
│   └── useContextData.ts
│
├── context/
│   └── AppContext.tsx
│
├── services/
│   ├── api.ts
│   └── aiAgent.ts
│
├── App.tsx
└── main.tsx
```

---

## 🌐 API Layer

Create a reusable service file for all FPL endpoints.

```ts
// src/services/api.ts
const BASE_URL = "https://fantasy.premierleague.com/api";

export const getBootstrapData = async () => fetch(`${BASE_URL}/bootstrap-static/`).then(r => r.json());
export const getFixtures = async () => fetch(`${BASE_URL}/fixtures/`).then(r => r.json());
export const getPlayerSummary = async (id: number) => fetch(`${BASE_URL}/element-summary/${id}/`).then(r => r.json());
export const getManagerInfo = async (id: number) => fetch(`${BASE_URL}/entry/${id}/`).then(r => r.json());
export const getManagerHistory = async (id: number) => fetch(`${BASE_URL}/entry/${id}/history/`).then(r => r.json());
export const getManagerTransfers = async (id: number) => fetch(`${BASE_URL}/entry/${id}/transfers/`).then(r => r.json());
export const getLeagueStandings = async (id: number) => fetch(`${BASE_URL}/leagues-classic/${id}/standings/`).then(r => r.json());
```

---

## 🧠 Global Context (for AI Awareness)

This context keeps track of what screen the user is on, what data is loaded, and what entity (player/club/manager) is selected.

```tsx
// src/context/AppContext.tsx
import { createContext, useContext, useState } from "react";

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [screen, setScreen] = useState("fixtures");
  const [entityId, setEntityId] = useState(null);
  const [dataSnapshot, setDataSnapshot] = useState(null);
  
  return (
    <AppContext.Provider value={{ screen, setScreen, entityId, setEntityId, dataSnapshot, setDataSnapshot }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
```

---

## 💬 AI Agent Service with Grounding Search

This service connects to Gemini or OpenAI and responds based on the current context. It includes **grounding search** to fetch additional relevant FPL data when needed.

### Grounding Search Features

- **Automatic Data Retrieval**: Analyzes questions and fetches relevant player, team, and fixture data
- **Player Name Recognition**: Extracts player names from questions and fetches their detailed stats
- **Team Name Recognition**: Identifies teams mentioned and includes their data
- **Fixture Context**: Automatically loads fixture data for fixture-related questions
- **Google Search Grounding**: Optional integration with Google Search for real-time information (when enabled)

```ts
// src/services/aiAgent.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { groundSearch } from "./grounding";

export async function askFPLAssistant({ screen, dataSnapshot, question }) {
  // Perform grounding search to fetch additional relevant data
  const groundedData = await groundSearch({ question, screen, dataSnapshot });
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-pro",
    // Optional: Enable Google Search grounding
    tools: [{ googleSearchRetrieval: { ... } }]
  });
  
  // Use grounded data in prompt for more accurate responses
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

---

## 🧭 Navigation

Use React Router for multi-page navigation.

```tsx
<Routes>
  <Route path="/" element={<FixturesPage />} />
  <Route path="/clubs" element={<ClubsPage />} />
  <Route path="/players" element={<PlayersPage />} />
  <Route path="/managers" element={<ManagerPage />} />
  <Route path="/leagues" element={<LeaguePage />} />
</Routes>
```

---

## 🪄 AI Context Sync Example

Each page updates the global context for AI.

```tsx
useEffect(() => {
  setScreen("player");
  const data = await getPlayerSummary(playerId);
  setDataSnapshot(data);
}, [playerId]);
```

---

## 💡 Example Prompts for the AI Assistant

- "Which teams have the easiest next 5 fixtures?"
- "Compare Haaland and Watkins for the next gameweeks."
- "What chips has my manager used?"
- "Show me Arsenal's next fixtures."

---

## 🚀 Development Roadmap

| Phase | Focus | Deliverables |
|-------|-------|--------------|
| 1 | Project Setup | React + Tailwind + Router setup |
| 2 | Fixtures Module | Gameweek selector, fixtures table |
| 3 | Clubs Module | Club overview, fixture list |
| 4 | Players Module | Player stats, history, comparison |
| 5 | Managers Module | Points, transfers, history |
| 6 | AI Assistant | Context-aware chat component |
| 7 | Polish | Charts, responsiveness, caching |
| 8 | **My Team** | **Personal team management, player details, position comparison** |

---

## ✨ Optional Enhancements

- LocalStorage caching for faster loads ✅ (Completed)
- Fixture difficulty color scale ✅ (Completed)
- "Recommended transfers" suggestions via AI
- Favorite clubs/players view
- Deployment on Vercel or Netlify
- Multiple team support
- Team history tracking

---

## 🏁 Example Kickoff Prompt for Cursor

Paste this into Cursor to begin the build:

Create a new React + TypeScript project named fpl-assistant.
Implement the folder structure described in cursor-plan.md.
Start with the Fixtures module using the /fixtures/ and /bootstrap-static/ endpoints.
Include navigation for Fixtures, Clubs, Players, Managers, and Leagues.
Add TailwindCSS and shadcn/ui for UI components.

---

## ✅ Deliverables at MVP

- Fully functional FPL dashboard (Fixtures → Managers)
- AI Chat Assistant integrated via Gemini/OpenAI
- Responsive UI, context-aware insights
- Ready for deployment on Google AI Studio or Vercel

## 🎯 Phase 8: My Team Feature

See `MY_TEAM_PLAN.md` for detailed implementation plan.

**Key Features:**
- Save team via Manager ID (localStorage)
- View team players with detailed stats
- Player detail pages with history and fixtures
- Position-based player comparison
- AI-powered team insights

**Status:** Planning phase - See MY_TEAM_PLAN.md for full details
