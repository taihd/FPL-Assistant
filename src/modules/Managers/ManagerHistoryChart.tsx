import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';
import type { ManagerHistory } from '@/types/fpl';
import { useState } from 'react';

interface ManagerHistoryChartProps {
  history: ManagerHistory;
}

export function ManagerHistoryChart({ history }: ManagerHistoryChartProps) {
  const [activeTab, setActiveTab] = useState<'points' | 'rank' | 'value'>('points');

  const chartData = history.current.map((event) => ({
    gameweek: event.event,
    points: event.points,
    totalPoints: event.total_points,
    rank: event.overall_rank,
    value: event.value / 10, // Convert to millions
  }));

  const renderPointsChart = () => (
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
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="points"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Gameweek Points"
          dot={{ r: 4 }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="totalPoints"
          stroke="#10b981"
          strokeWidth={2}
          name="Total Points"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderRankChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="gameweek"
          stroke="#64748b"
          label={{ value: 'Gameweek', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          yAxisId="left"
          stroke="#64748b"
          reversed
          label={{ value: 'Rank (lower is better)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
          }}
          formatter={(value: number) => `#${value.toLocaleString()}`}
        />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="rank"
          stroke="#ef4444"
          fill="#fecaca"
          fillOpacity={0.6}
          name="Overall Rank"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="rank"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderValueChart = () => (
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
          label={{ value: 'Team Value (£m)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
          }}
          formatter={(value: number) => `£${value.toFixed(1)}m`}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="value"
          stroke="#8b5cf6"
          strokeWidth={2}
          name="Team Value"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Manager History</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('points')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'points'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Points
          </button>
          <button
            onClick={() => setActiveTab('rank')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'rank'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Rank
          </button>
          <button
            onClick={() => setActiveTab('value')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'value'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Value
          </button>
        </div>
      </div>
      {activeTab === 'points' && renderPointsChart()}
      {activeTab === 'rank' && renderRankChart()}
      {activeTab === 'value' && renderValueChart()}
    </div>
  );
}
