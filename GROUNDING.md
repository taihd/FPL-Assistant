# Grounding Search Guide

## What is Grounding Search?

Grounding search enhances the AI Assistant by:
1. **Local Grounding**: Automatically fetches relevant FPL data (players, teams, fixtures) based on your question
2. **Google Search Grounding**: Uses Google Search to find real-time information (optional, requires special API access)

## How to Enable

### Local Grounding (Always Active)
Local grounding is **always enabled** and automatically fetches FPL data when you ask questions.

### Google Search Grounding (Optional)
Add to your `.env` file:
```env
VITE_ENABLE_GROUNDING=true
```

**Note**: Google Search grounding requires:
- Gemini API with grounding/search capabilities enabled
- May require special API access or enterprise plan
- If not available, the app will fall back to local grounding only

## How to Verify Grounding is Working

### Method 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Ask a question in the AI Assistant
4. Look for log messages starting with `[Grounding]` and `[AI Agent]`

You should see:
```
[Grounding] Starting grounding search for question: ...
[Grounding] Bootstrap data loaded
[Grounding] Found players: ...
[AI Agent] Grounding data retrieved: { hasPlayers: true, ... }
```

### Method 2: Ask Specific Questions
Try asking questions that should trigger grounding:

**Player Questions:**
- "What are Haaland's stats?"
- "How many points does Salah have?"
- "Compare Son and Kane"

**Team Questions:**
- "What are Arsenal's upcoming fixtures?"
- "How strong is Manchester City?"

**Fixture Questions:**
- "What are the fixtures for gameweek 10?"
- "Show me upcoming matches"

### Method 3: Check the Response
If grounding is working, the AI should:
- Provide specific data (points, prices, stats)
- Reference actual player/team names from FPL
- Give detailed information instead of saying "I don't have that data"

## Troubleshooting

### AI says "current available data doesn't contain the information"

This could mean:
1. **Grounding didn't find relevant data** - Check console logs to see if grounding ran
2. **Question doesn't match any players/teams** - Try using exact player names (e.g., "Haaland" not "that Norwegian striker")
3. **Data not in FPL API** - Some information might not be available in the public FPL API

### Google Search Grounding Not Working

If `VITE_ENABLE_GROUNDING=true` but Google Search grounding doesn't work:
- The `googleSearchRetrieval` tool might not be available in your Gemini API plan
- This is normal - local grounding will still work
- Check console for errors about Google Search retrieval

### No Logs in Console

If you don't see any `[Grounding]` logs:
1. Make sure you're looking at the Console tab (not Network or Elements)
2. Refresh the page and try again
3. Check if there are any JavaScript errors

## What Gets Grounded?

### Automatically Fetched:
- **Player Data**: When player names are mentioned
  - Basic stats (points, price, goals, assists)
  - Detailed summaries (if available)
- **Team Data**: When team names are mentioned
  - Team strength ratings
  - Upcoming fixtures
- **Fixture Data**: For fixture-related questions
  - Gameweek fixtures
  - Difficulty ratings

### Not Grounded (Requires Google Search):
- News and recent events
- Injury updates
- Transfer rumors
- Real-time match results (if not in FPL API)

## Example Questions That Should Work

✅ "What are Haaland's points and price?"
✅ "Show me Arsenal's fixtures"
✅ "Compare Son and Kane's stats"
✅ "Who are the top 5 players by points?"
✅ "What is Manchester City's strength rating?"

## Improving Grounding

If grounding isn't finding what you need:
1. Use exact player/team names from FPL
2. Be specific in your questions
3. Check console logs to see what data was found
4. Try rephrasing your question

