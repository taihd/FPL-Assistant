# FPL Assistant

AI-powered Fantasy Premier League web app that helps users analyze fixtures, players, clubs, and managers using official FPL public APIs.

## Tech Stack

- React 18 + TypeScript
- TailwindCSS + shadcn/ui
- React Router v6
- Recharts for visualizations
- Google Gemini / OpenAI for AI features
- FPL Public API

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
# Optional: Specify Gemini model (default: gemini-2.5-pro)
# VITE_GEMINI_MODEL=gemini-2.5-pro
# Optional: Enable Google Search grounding (requires Gemini API with grounding enabled)
# VITE_ENABLE_GROUNDING=true
# OR use OpenAI instead
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features & Performance

### Caching
The app automatically caches API responses in localStorage for faster subsequent loads:
- Bootstrap data: 10 minutes
- Fixtures: 5 minutes
- Player data: 5 minutes
- Manager data: 2 minutes

Cache is automatically cleared when expired.

### Mobile Responsive
- Hamburger menu on mobile devices
- Responsive grid layouts
- Touch-friendly interface
- Optimized AI chat for mobile screens

### AI Grounding Search
The AI Assistant includes intelligent grounding search that:
- **Automatic Data Retrieval**: Analyzes questions and fetches relevant player, team, and fixture data
- **Player Name Recognition**: Extracts player names from questions and fetches their detailed stats
- **Team Name Recognition**: Identifies teams mentioned and includes their data
- **Fixture Context**: Automatically loads fixture data for fixture-related questions
- **Google Search Grounding**: Optional integration with Google Search for real-time information (set `VITE_ENABLE_GROUNDING=true`)

**To verify grounding is working**: Check the browser console for `[Grounding]` and `[AI Agent]` log messages. See `GROUNDING.md` for detailed troubleshooting.

## Project Structure

```
src/
├── components/       # Shared UI components
├── modules/         # Feature modules
├── hooks/           # Custom React hooks
├── context/         # React Context providers
├── services/        # API and external service integrations
├── lib/             # Utility functions
└── types/           # TypeScript type definitions
```

## Features

- **Fixtures Module**: View fixtures by gameweek, filter by team, see difficulty ratings
- **Clubs Module**: Browse all Premier League clubs, view upcoming fixtures, compare teams
- **Players Module**: Search and filter players, compare stats, view detailed player information
- **Managers Module**: View manager statistics, points history charts, transfer history, chip usage
- **Leagues Module**: (Coming soon)
- **AI Assistant**: Context-aware AI chat with grounding search that fetches real-time FPL data
- **Caching**: Automatic localStorage caching for faster page loads
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## Development Roadmap

- [x] Phase 1: Project Setup
- [x] Phase 2: Fixtures Module
- [x] Phase 3: Clubs Module
- [x] Phase 4: Players Module
- [x] Phase 5: Managers Module
- [x] Phase 6: AI Assistant
- [x] Phase 7: Polish (Caching, Responsiveness, Enhanced Charts)

## License

ISC

