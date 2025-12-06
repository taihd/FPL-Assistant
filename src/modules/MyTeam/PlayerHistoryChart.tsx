import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { getBootstrapData } from '@/services/api';
import type { PlayerHistory } from '@/types/player';
import type { Team } from '@/types/fpl';

interface PlayerHistoryChartProps {
  history: PlayerHistory[];
}

interface ChartDataPoint {
  gameweek: number;
  points: number;
  goals: number;
  assists: number;
  bonus: number;
  opponent: string;
  isHome: boolean;
}

// Custom Tooltip component
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    value?: number;
    payload?: ChartDataPoint;
    color?: string;
  }>;
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length > 0 && payload[0].payload) {
    const data = payload[0].payload;
    const homeAway = data.isHome ? 'H' : 'A';
    
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <p className="mb-2 font-semibold text-slate-900">
          GW {label} vs {data.opponent} ({homeAway})
        </p>
        {payload.map((entry, index) => {
          if (!entry.payload || !entry.dataKey || entry.value === undefined) return null;
          
          let name = '';
          let color = entry.color || '#64748b';
          
          if (entry.dataKey === 'points') {
            name = 'Points';
            color = '#3b82f6';
          } else if (entry.dataKey === 'goals') {
            name = 'Goals';
            color = '#10b981';
          } else if (entry.dataKey === 'assists') {
            name = 'Assists';
            color = '#f59e0b';
          } else if (entry.dataKey === 'bonus') {
            name = 'Bonus';
            color = '#8b5cf6';
          }
          
          return (
            <p key={index} className="text-sm text-slate-600">
              <span style={{ color }}>●</span> {name}: {entry.value}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export function PlayerHistoryChart({ history }: PlayerHistoryChartProps) {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    getBootstrapData().then((data) => setTeams(data.teams));
  }, []);

  const getTeamName = (teamId: number): string => {
    if (teams.length === 0) return `Team ${teamId}`;
    const team = teams.find((t) => t.id === teamId);
    return team ? team.short_name : `Team ${teamId}`;
  };

  // Sort by gameweek, get last 10, and create chart data
  // Recalculate when teams load
  const chartData = useMemo(() => {
    if (teams.length === 0) return [];
    
    return history
      .filter((h) => h.round) // Only include entries with gameweek
      .sort((a, b) => a.round - b.round)
      .slice(-10) // Get last 10 gameweeks
      .map((h) => ({
        gameweek: h.round,
        points: h.total_points,
        goals: h.goals_scored,
        assists: h.assists,
        bonus: h.bonus,
        opponent: getTeamName(h.opponent_team),
        isHome: h.was_home,
      }));
  }, [history, teams]);

  if (chartData.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500">
        No history data available for this player.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="gameweek"
          stroke="#64748b"
          label={{ value: 'Gameweek', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          yAxisId="left"
          stroke="#64748b"
          label={{ value: 'Points', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="points"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Points"
          dot={{ r: 4 }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="goals"
          stroke="#10b981"
          strokeWidth={2}
          name="Goals"
          dot={{ r: 4 }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="assists"
          stroke="#f59e0b"
          strokeWidth={2}
          name="Assists"
          dot={{ r: 4 }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="bonus"
          stroke="#8b5cf6"
          strokeWidth={2}
          name="Bonus"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

