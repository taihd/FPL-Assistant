// Team-related types for My Team feature

export interface TeamPick {
  element: number; // Player ID
  position: number; // Position in team (1-15)
  is_captain: boolean;
  is_vice_captain: boolean;
  multiplier: number; // Usually 1, 2 for captain, 3 for triple captain
}

export interface TeamPicks {
  active_chip: string | null; // e.g., "bboost", "3xc", "freehit"
  automatic_subs: Array<{
    entry: number;
    element_in: number;
    element_out: number;
    event: number;
  }>;
  entry_history: {
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
  };
  picks: TeamPick[];
}

export interface MyTeamData {
  managerId: number;
  managerInfo: import('./fpl').ManagerInfo;
  currentGameweek: number;
  teamPicks: TeamPicks | null;
  lastUpdated: string;
}

