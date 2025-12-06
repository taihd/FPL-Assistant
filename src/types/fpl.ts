// FPL API Types

export interface Team {
  id: number;
  name: string;
  short_name: string;
  code: number;
  strength: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

export interface Event {
  id: number;
  name: string;
  deadline_time: string;
  average_entry_score: number;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_entry: number | null;
  deadline_time_epoch: number;
  deadline_time_game_offset: number;
  highest_score: number | null;
  is_previous: boolean;
  is_current: boolean;
  is_next: boolean;
  cup_leagues_created: boolean;
  h2h_ko_matches_created: boolean;
  chip_plays: unknown[];
  most_selected: number | null;
  most_transferred_in: number | null;
  top_element: number | null;
  top_element_info: unknown | null;
  transfers_made: number;
  most_captained: number | null;
  most_vice_captained: number | null;
}

export interface Fixture {
  id: number;
  code: number;
  event: number | null; // Gameweek number
  finished: boolean;
  finished_provisional: boolean;
  kickoff_time: string | null;
  minutes: number;
  provisional_start_time: boolean;
  started: boolean | null;
  team_a: number; // Team ID
  team_a_score: number | null;
  team_h: number; // Team ID
  team_h_score: number | null;
  stats: unknown[];
  team_h_difficulty: number; // 1-5 difficulty rating
  team_a_difficulty: number; // 1-5 difficulty rating
  pulse_id: number;
}

export interface Player {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number; // Team ID
  element_type: number; // Position ID (1=GK, 2=DEF, 3=MID, 4=FWD)
  now_cost: number; // Price in tenths (e.g., 100 = £10.0m)
  total_points: number;
  points_per_game: string;
  selected_by_percent: string;
  form: string;
  transfers_in: number;
  transfers_out: number;
  value_form: string;
  value_season: string;
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
  news: string;
  news_added: string | null;
  chance_of_playing_this_round: number | null;
  chance_of_playing_next_round: number | null;
  value: number;
  transfers_in_event: number;
  transfers_out_event: number;
  photo: string;
}

export interface ElementType {
  id: number;
  plural_name: string;
  plural_name_short: string;
  singular_name: string;
  singular_name_short: string;
  squad_select: number;
  squad_min_play: number;
  squad_max_play: number;
  ui_shirt_specific: boolean;
  sub_positions_locked: number[];
  element_count: number;
}

export interface BootstrapData {
  events: Event[];
  teams: Team[];
  total_players: number;
  elements: Player[]; // Players
  element_types: ElementType[];
  element_stats: unknown[];
  game_settings: unknown;
  phases: unknown[];
  teams_fixtures: unknown[];
  current_event: number;
}

export interface ManagerInfo {
  id: number;
  joined_time: string;
  started_event: number;
  favourite_team: number | null;
  player_first_name: string;
  player_last_name: string;
  player_region_id: number;
  player_region_name: string;
  player_region_iso_code_short: string;
  player_region_iso_code_long: string;
  summary_overall_points: number;
  summary_overall_rank: number | null;
  summary_event_points: number | null;
  summary_event_rank: number | null;
  current_event: number;
  leagues: {
    classic: Array<{
      id: number;
      name: string;
      short_name: string;
      created: string;
      closed: boolean;
      rank: number | null;
      max_entries: number | null;
      league_type: string;
      scoring: string;
      admin_entry: number | null;
      start_event: number;
      entry_can_leave: boolean;
      entry_can_admin: boolean;
      entry_can_invite: boolean;
      has_cup: boolean;
      cup_league: number | null;
      cup_qualified: boolean | null;
      entry_rank: number;
      entry_last_rank: number;
      entry_can_be_deleted: boolean;
      entry_can_be_updated: boolean;
      entry_can_be_updated_by_admin: boolean;
    }>;
    h2h: unknown[];
    cup: unknown[];
  };
  name: string;
  name_change_blocked: boolean;
  kit: string | null;
  last_deadline_bank: number;
  last_deadline_value: number;
  last_deadline_total_transfers: number;
}

export interface ManagerHistory {
  current: Array<{
    event: number;
    points: number;
    total_points: number;
    rank: number;
    rank_sort: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  }>;
  past: Array<{
    season_name: string;
    total_points: number;
    rank: number;
  }>;
  chips: Array<{
    name: string;
    time: string;
    event: number;
  }>;
}

export interface ManagerTransfer {
  element_in: number;
  element_in_cost: number;
  element_out: number;
  element_out_cost: number;
  entry: number;
  event: number;
  time: string;
}

