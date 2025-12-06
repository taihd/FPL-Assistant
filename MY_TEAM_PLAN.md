# My Team Feature - Implementation Plan

## 🎯 Overview

Add a personal team management feature that allows FPL managers to:
- Save their FPL team (via Manager ID or manual selection)
- View their team's players
- See detailed player information with historical data and fixtures
- Compare players in the same position
- Get AI-powered insights about their team

---

## 🏗️ Architecture & Design Decisions

### Option 1: Manager ID Based (Recommended for MVP)
**Approach**: User enters their FPL Manager ID, we fetch their team from FPL API
- ✅ **Pros**: 
  - Always up-to-date with real FPL data
  - No manual team management needed
  - Can see actual team value, bank, chips used
  - Integrates with existing Manager module
- ❌ **Cons**: 
  - Requires user to know their Manager ID
  - Can't create hypothetical teams

### Option 2: Manual Team Selection
**Approach**: User manually selects 15 players to build their team
- ✅ **Pros**: 
  - Can create hypothetical teams
  - No need for Manager ID
  - More flexible
- ❌ **Cons**: 
  - Manual work to maintain
  - Not synced with actual FPL team
  - More complex UI

### Option 3: Hybrid Approach (Best Long-term)
**Approach**: Support both Manager ID and manual team selection
- ✅ **Pros**: 
  - Best of both worlds
  - Flexible for different use cases
- ❌ **Cons**: 
  - More complex implementation

**Recommendation**: Start with **Option 1 (Manager ID)** for MVP, add Option 2 later if needed.

---

## 📋 Feature Requirements

### Phase 1: Team Setup & Storage
1. **Team Login/Save**
   - Input field for Manager ID
   - Fetch team from FPL API (`/api/entry/{id}/`)
   - Store Manager ID in localStorage
   - Auto-load team on app start if saved

2. **Team Storage**
   - Store Manager ID in localStorage
   - Cache team data (with TTL)
   - Handle team updates (refresh button)

### Phase 2: My Team Dashboard
1. **Team Overview Page** (`/my-team`)
   - Display current team (11 starters + 4 bench)
   - Show formation (e.g., 3-4-3, 4-4-2)
   - Team value, bank, total points
   - Quick stats (captain, vice-captain)
   - "Refresh Team" button

2. **Team Player List**
   - Grid/list view of all 15 players
   - Show: Name, Position, Team, Price, Points, Form
   - Clickable cards to view player details
   - Filter by position (GK, DEF, MID, FWD)
   - Sort by points, price, form, etc.

### Phase 3: Player Detail View
1. **Player Detail Page** (`/my-team/player/{id}`)
   - **Player Info Card**
     - Name, position, team, price
     - Current points, form, ownership %
     - ICT index (Influence, Creativity, Threat)
   
   - **Historical Points Chart**
     - Gameweek-by-gameweek points
     - Total points progression
     - Use Recharts (similar to ManagerHistoryChart)
   
   - **Upcoming Fixtures**
     - Next 5 fixtures with difficulty ratings
     - Color-coded difficulty (1-5)
     - Home/Away indicators
   
   - **Recent Performance**
     - Last 5 gameweeks stats
     - Goals, assists, bonus points
     - Minutes played

2. **Position Comparison Section**
   - Show top 5-10 players in same position
   - Comparison table: Points, Price, Form, Goals, Assists
   - "Compare" button to open comparison modal
   - Highlight current player in comparison

### Phase 4: Player Comparison
1. **Comparison Modal/Page**
   - Side-by-side comparison of 2-3 players
   - Stats comparison table
   - Fixture difficulty comparison
   - Price vs Points analysis
   - AI recommendation ("Based on fixtures, Player X is better...")

### Phase 5: AI Integration
1. **Team-Specific AI Insights**
   - "Analyze my team"
   - "Who should I captain this week?"
   - "Should I transfer out [Player]?"
   - "Compare my forwards"
   - Context-aware: AI knows your team

---

## 🗂️ File Structure

```
src/
├── modules/
│   └── MyTeam/
│       ├── MyTeamPage.tsx          # Main team dashboard
│       ├── TeamSetup.tsx            # Manager ID input / team save
│       ├── TeamOverview.tsx        # Team summary card
│       ├── TeamPlayerList.tsx       # List of team players
│       ├── TeamPlayerCard.tsx       # Individual player card
│       ├── PlayerDetailPage.tsx    # Detailed player view
│       ├── PlayerHistoryChart.tsx   # Player points history chart
│       ├── PlayerFixtures.tsx       # Upcoming fixtures for player
│       ├── PositionComparison.tsx   # Top players in same position
│       └── PlayerCompare.tsx        # Player comparison modal
│
├── context/
│   └── TeamContext.tsx              # Team state management
│
├── services/
│   └── teamService.ts               # Team data fetching & storage
│
├── types/
│   └── team.ts                      # Team-related TypeScript types
│
└── lib/
    └── teamStorage.ts               # localStorage utilities for team
```

---

## 🔧 Technical Implementation

### 1. Team Context (`src/context/TeamContext.tsx`)

```typescript
interface TeamContextType {
  managerId: number | null;
  teamData: ManagerInfo | null;
  teamPlayers: Player[] | null;
  isLoading: boolean;
  error: Error | null;
  setManagerId: (id: number | null) => void;
  loadTeam: (id: number) => Promise<void>;
  refreshTeam: () => Promise<void>;
  clearTeam: () => void;
}
```

### 2. Team Storage (`src/lib/teamStorage.ts`)

```typescript
// Store Manager ID in localStorage
export function saveManagerId(id: number): void;
export function getManagerId(): number | null;
export function clearManagerId(): void;

// Cache team data
export function cacheTeamData(data: ManagerInfo): void;
export function getCachedTeamData(): ManagerInfo | null;
```

### 3. Team Service (`src/services/teamService.ts`)

```typescript
// Fetch team data from FPL API
export async function getMyTeam(managerId: number): Promise<ManagerInfo>;
export async function getTeamPlayers(managerId: number): Promise<Player[]>;
export function getPlayerPosition(player: Player): 'GK' | 'DEF' | 'MID' | 'FWD';
export function getTopPlayersByPosition(position: string, limit?: number): Promise<Player[]>;
```

### 4. API Endpoints Needed

- `/api/entry/{manager_id}/` - Get manager info (already exists)
- `/api/entry/{manager_id}/picks/{event_id}/` - Get team picks for specific gameweek
- `/api/element-summary/{player_id}/` - Get player details (already exists)
- `/api/bootstrap-static/` - Get all players (already exists)

---

## 🎨 UI/UX Design

### My Team Page Layout

```
┌─────────────────────────────────────────┐
│  My Team                    [Refresh]    │
├─────────────────────────────────────────┤
│  Team Overview Card                      │
│  ┌──────────┬──────────┬──────────┐    │
│  │ Value    │ Bank     │ Points   │    │
│  │ £100.5m  │ £0.5m    │ 1,234    │    │
│  └──────────┴──────────┴──────────┘    │
├─────────────────────────────────────────┤
│  Formation: 3-4-3                       │
│  [Filter: All | GK | DEF | MID | FWD]   │
├─────────────────────────────────────────┤
│  Team Players Grid                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │ P1 │ │ P2 │ │ P3 │ │ P4 │           │
│  └────┘ └────┘ └────┘ └────┘           │
│  ...                                     │
└─────────────────────────────────────────┘
```

### Player Detail Page Layout

```
┌─────────────────────────────────────────┐
│  ← Back to My Team                       │
├─────────────────────────────────────────┤
│  Player Info Card                        │
│  [Name, Position, Team, Price, Points]   │
├─────────────────────────────────────────┤
│  Points History Chart                    │
│  [Recharts line chart]                   │
├─────────────────────────────────────────┤
│  Upcoming Fixtures                      │
│  [Next 5 fixtures with difficulty]      │
├─────────────────────────────────────────┤
│  Top Players in Same Position            │
│  [Comparison table]                      │
│  [Compare Button]                        │
└─────────────────────────────────────────┘
```

---

## 🔄 Data Flow

1. **User enters Manager ID** → Save to localStorage → Fetch team from API
2. **Team loaded** → Store in TeamContext → Display on My Team page
3. **User clicks player** → Navigate to Player Detail → Fetch player summary
4. **Player detail loaded** → Show history, fixtures, comparison
5. **User clicks compare** → Fetch top players in position → Show comparison

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create TeamContext
- [ ] Implement teamStorage utilities
- [ ] Create TeamSetup component (Manager ID input)
- [ ] Add "My Team" route
- [ ] Basic team loading from Manager ID

### Phase 2: Team Dashboard (Week 1-2)
- [ ] MyTeamPage with team overview
- [ ] TeamPlayerList component
- [ ] TeamPlayerCard component
- [ ] Position filtering
- [ ] Team refresh functionality

### Phase 3: Player Details (Week 2)
- [ ] PlayerDetailPage
- [ ] PlayerHistoryChart component
- [ ] PlayerFixtures component
- [ ] Recent performance section

### Phase 4: Comparison (Week 2-3)
- [ ] PositionComparison component
- [ ] PlayerCompare modal/page
- [ ] Comparison table
- [ ] AI recommendations

### Phase 5: Polish & AI (Week 3)
- [ ] AI integration for team insights
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Error handling
- [ ] Testing

---

## 💡 Future Enhancements

1. **Transfer Suggestions**
   - AI-powered transfer recommendations
   - "Who should I bring in for [Player]?"

2. **Captain Suggestions**
   - Weekly captain recommendations
   - Based on fixtures and form

3. **Team Analysis**
   - Team strength analysis
   - Fixture difficulty for entire team
   - Coverage analysis (how many players per team)

4. **Multiple Teams**
   - Support multiple Manager IDs
   - Switch between teams

5. **Team History**
   - Track team changes over time
   - Transfer history visualization

---

## 🤔 Questions to Consider

1. **Authentication**: Do we need user accounts, or is localStorage enough?
   - For MVP: localStorage is fine
   - Future: Could add simple auth (email/password) or OAuth

2. **Team Sync**: How often should we refresh team data?
   - On page load (if cached)
   - Manual refresh button
   - Auto-refresh every X minutes (optional)

3. **Offline Support**: Should we support offline viewing?
   - Cache team data for offline access
   - Show cached data with "last updated" timestamp

4. **Team Validation**: Should we validate team structure?
   - Check 15 players (11 + 4 bench)
   - Validate formation
   - Check budget constraints

---

## 📝 Next Steps

1. **Review this plan** - Discuss and refine
2. **Decide on approach** - Manager ID vs Manual vs Hybrid
3. **Start Phase 1** - Foundation and team storage
4. **Iterate** - Build incrementally, test as we go

---

## 🎯 Success Criteria

- ✅ User can save their Manager ID
- ✅ Team loads automatically on app start
- ✅ User can view all team players
- ✅ User can see detailed player information
- ✅ User can compare players in same position
- ✅ AI can answer team-specific questions
- ✅ Mobile responsive
- ✅ Fast and performant

