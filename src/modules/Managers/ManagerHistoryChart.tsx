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
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="gameweek"
          stroke="#9ca3af"
          tick={{ fill: '#9ca3af' }}
          label={{ value: 'Gameweek', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
        />
        <YAxis
          yAxisId="left"
          stroke="#9ca3af"
          tick={{ fill: '#9ca3af' }}
          label={{ value: 'Points', angle: -90, position: 'left', fill: '#9ca3af' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '6px',
            color: '#fff',
          }}
          labelStyle={{ color: '#fff' }}
        />
        <Legend wrapperStyle={{ color: '#9ca3af' }} />
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

  const formatRankValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const renderRankChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="gameweek"
          stroke="#9ca3af"
          tick={{ fill: '#9ca3af' }}
          label={{ value: 'Gameweek', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
        />
        <YAxis
          yAxisId="left"
          stroke="#9ca3af"
          tick={{ fill: '#9ca3af' }}
          reversed
          tickFormatter={formatRankValue}
          label={{ value: 'Rank', angle: -90, position: 'left', fill: '#9ca3af' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '6px',
            color: '#fff',
          }}
          labelStyle={{ color: '#fff' }}
          formatter={(value: number) => `#${value.toLocaleString()}`}
        />
        <Legend wrapperStyle={{ color: '#9ca3af' }} />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="rank"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.2}
          name="Overall Rank"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="rank"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 4 }}
          hide
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderValueChart = () => {
    // Calculate min and max values to create a focused domain
    const values = chartData.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    // Add 5% padding above and below
    const padding = range * 0.05;
    const domainMin = Math.max(0, minValue - padding);
    const domainMax = maxValue + padding;

    // Format y-axis values - round to 1 decimal place
    const formatValue = (value: number): string => {
      return value.toFixed(1);
    };

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="gameweek"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            label={{ value: 'Gameweek', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
          />
          <YAxis
            yAxisId="left"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            domain={[domainMin, domainMax]}
            tickFormatter={formatValue}
            label={{ value: 'Team Value (£m)', angle: -90, position: 'left', fill: '#9ca3af' }}
          />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '6px',
            color: '#fff',
          }}
          labelStyle={{ color: '#fff' }}
          formatter={(value: number) => `£${value.toFixed(1)}m`}
        />
        <Legend wrapperStyle={{ color: '#9ca3af' }} />
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
  };

  return (
    <div className="rounded-lg border border-dark-border bg-[#25252B] p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-white">Manager History</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('points')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'points'
                ? 'bg-violet-500 text-white'
                : 'bg-[#2A2A35] text-slate-300 hover:bg-[#2A2A35]/80'
            }`}
          >
            Points
          </button>
          <button
            onClick={() => setActiveTab('rank')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'rank'
                ? 'bg-violet-500 text-white'
                : 'bg-[#2A2A35] text-slate-300 hover:bg-[#2A2A35]/80'
            }`}
          >
            Rank
          </button>
          <button
            onClick={() => setActiveTab('value')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'value'
                ? 'bg-violet-500 text-white'
                : 'bg-[#2A2A35] text-slate-300 hover:bg-[#2A2A35]/80'
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
