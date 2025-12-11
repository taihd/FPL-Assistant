// Player summary types from FPL API

export interface PlayerHistory {
  element: number; // Player ID
  fixture: number; // Fixture ID
  opponent_team: number; // Opponent team ID
  total_points: number;
  was_home: boolean;
  kickoff_time: string;
  team_h_score: number | null;
  team_a_score: number | null;
  round: number; // Gameweek
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  value: number;
  transfers_balance: number;
  selected: number;
  transfers_in: number;
  transfers_out: number;
  defensive_contribution?: number; // Optional field that may exist in API
  expected_goals?: string;
  expected_assists?: string;
  expected_goal_involvements?: string;
  expected_goals_conceded?: string;
  starts?: number;
}

export interface PlayerFixture {
  id: number;
  code: number;
  team_h: number; // Home team ID
  team_h_score: number | null;
  team_a: number; // Away team ID
  team_a_score: number | null;
  event: number | null; // Gameweek
  finished: boolean;
  minutes: number;
  provisional_start_time: boolean;
  kickoff_time: string | null;
  event_name: string;
  is_home: boolean;
  difficulty: number; // 1-5 difficulty rating
}

export interface PlayerSummary {
  id: number;
  history: PlayerHistory[];
  history_past: Array<{
    season_name: string;
    element_code: number;
    start_cost: number;
    end_cost: number;
    total_points: number;
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    own_goals: number;
    penalties_saved: number;
    penalties_missed: number;
    yellow_cards: number;
    red_cards: number;
    saves: number;
    bonus: number;
    bps: number;
    influence: string;
    creativity: string;
    threat: string;
    ict_index: string;
    starts: number;
    expected_goals: string;
    expected_assists: string;
    expected_goal_involvements: string;
    expected_goals_conceded: string;
    transfers_in: number;
    transfers_out: number;
    selected: number;
  }>;
  fixtures: PlayerFixture[];
}

