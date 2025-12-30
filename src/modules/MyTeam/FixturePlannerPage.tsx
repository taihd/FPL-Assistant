import { useEffect, useState, useMemo, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamContext } from '@/context/TeamContext';
import { useFPLData } from '@/context/FPLDataContext';
import { getPlayerSummary } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Player } from '@/types/fpl';
import type { PlayerFixture } from '@/types/player';

interface PlayerFixtureData {
  player: Player;
  fixtures: Map<number, PlayerFixture>;
}

const getDifficultyColor = (difficulty: number): string => {
  switch (difficulty) {
    case 1: return 'bg-lime-500 text-white';
    case 2: return 'bg-emerald-500 text-white';
    case 3: return 'bg-yellow-500 text-black';
    case 4: return 'bg-orange-500 text-white';
    case 5: return 'bg-red-500 text-white';
    default: return 'bg-slate-600 text-white';
  }
};

const getPositionName = (type: number): string => ['', 'GK', 'DEF', 'MID', 'FWD'][type] || 'UNK';
const getPositionColor = (type: number): string => {
  switch (type) {
    case 1: return 'bg-yellow-500 text-black';
    case 2: return 'bg-blue-500 text-white';
    case 3: return 'bg-emerald-500 text-white';
    case 4: return 'bg-red-500 text-white';
    default: return 'bg-slate-500 text-white';
  }
};

const getFormation = (selected: Player[]): string => {
  const def = selected.filter(p => p.element_type === 2).length;
  const mid = selected.filter(p => p.element_type === 3).length;
  const fwd = selected.filter(p => p.element_type === 4).length;
  return `${def}-${mid}-${fwd}`;
};

interface PlayerCardProps {
  player: Player;
  fixture: { opponent: string; venue: string; difficulty: number } | null;
  isSelected: boolean;
  onDragStart: (e: DragEvent, playerId: number) => void;
  onClick: () => void;
}

function PlayerCard({ player, fixture, isSelected, onDragStart, onClick }: PlayerCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, player.id)}
      onClick={onClick}
      className={`cursor-grab rounded-lg p-2 text-center transition-all active:cursor-grabbing ${
        isSelected 
          ? 'bg-violet-500/30 border-2 border-violet-500' 
          : 'bg-[#2A2A35] border-2 border-transparent hover:border-slate-600'
      }`}
    >
      <div className={`mx-auto mb-1 h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold ${getPositionColor(player.element_type)}`}>
        {getPositionName(player.element_type)}
      </div>
      <div className="text-xs font-medium text-white truncate">{player.web_name}</div>
      {fixture && (
        <div className={`mt-1 rounded px-1 py-0.5 text-[10px] font-medium ${getDifficultyColor(fixture.difficulty)}`}>
          {fixture.opponent} ({fixture.venue})
        </div>
      )}
    </div>
  );
}

export function FixturePlannerPage() {
  const navigate = useNavigate();
  const { teamPlayers, managerId, teamPicks } = useTeamContext();
  const { allTeams, currentGameweek, events, isLoading: fplLoading } = useFPLData();

  const [numGameweeks, setNumGameweeks] = useState(3);
  const [playerData, setPlayerData] = useState<PlayerFixtureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGW, setActiveGW] = useState<number | null>(null);
  const [selections, setSelections] = useState<Map<number, Set<number>>>(new Map());
  const [step, setStep] = useState<'setup' | 'select' | 'review'>('setup');
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);

  const nextGameweek = useMemo(() => {
    if (!events.length) return null;
    const next = events.find(e => !e.finished);
    return next?.id || currentGameweek || null;
  }, [events, currentGameweek]);

  const upcomingGWs = useMemo(() => {
    if (!nextGameweek) return [];
    return Array.from({ length: numGameweeks }, (_, i) => nextGameweek + i);
  }, [nextGameweek, numGameweeks]);

  useEffect(() => {
    if (!teamPlayers?.length || !nextGameweek) return;
    setLoading(true);

    const fetchAll = async () => {
      const data: PlayerFixtureData[] = [];
      for (const player of teamPlayers) {
        try {
          const summary = await getPlayerSummary(player.id);
          const fixtureMap = new Map<number, PlayerFixture>();
          summary.fixtures
            .filter((f: PlayerFixture) => !f.finished && f.event)
            .forEach((f: PlayerFixture) => fixtureMap.set(f.event!, f));
          data.push({ player, fixtures: fixtureMap });
        } catch {
          data.push({ player, fixtures: new Map() });
        }
      }
      data.sort((a, b) => a.player.element_type - b.player.element_type);
      setPlayerData(data);
      
      if (teamPicks) {
        const starting11Ids = new Set(
          teamPicks.picks.filter(p => p.position <= 11).map(p => p.element)
        );
        const initial = new Map<number, Set<number>>();
        for (let i = 0; i < 5; i++) {
          initial.set(nextGameweek + i, new Set(starting11Ids));
        }
        setSelections(initial);
      }
      
      setLoading(false);
    };
    fetchAll();
  }, [teamPlayers, nextGameweek, teamPicks]);

  const getTeamName = (teamId: number): string => 
    allTeams.find(t => t.id === teamId)?.short_name || `T${teamId}`;

  const getFixtureInfo = (playerId: number, gw: number) => {
    const pd = playerData.find(p => p.player.id === playerId);
    if (!pd) return null;
    const fixture = pd.fixtures.get(gw);
    if (!fixture) return null;
    const opponent = fixture.is_home ? getTeamName(fixture.team_a) : getTeamName(fixture.team_h);
    return { opponent, venue: fixture.is_home ? 'H' : 'A', difficulty: fixture.difficulty };
  };

  const handleDragStart = (e: DragEvent, playerId: number) => {
    setDraggedPlayer(playerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropToStarting = (e: DragEvent) => {
    e.preventDefault();
    if (!draggedPlayer || !activeGW) return;
    
    const player = playerData.find(p => p.player.id === draggedPlayer)?.player;
    if (!player) return;

    setSelections(prev => {
      const newMap = new Map(prev);
      const gwSet = new Set(newMap.get(activeGW) || []);
      
      if (!gwSet.has(draggedPlayer) && gwSet.size < 11) {
        const selectedPlayers = playerData.filter(p => gwSet.has(p.player.id)).map(p => p.player);
        const posCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
        selectedPlayers.forEach(p => posCount[p.element_type as 1|2|3|4]++);
        const maxPerPos = { 1: 1, 2: 5, 3: 5, 4: 3 };
        
        if (posCount[player.element_type as 1|2|3|4] < maxPerPos[player.element_type as 1|2|3|4]) {
          gwSet.add(draggedPlayer);
        }
      }
      
      newMap.set(activeGW, gwSet);
      return newMap;
    });
    setDraggedPlayer(null);
  };

  const handleDropToBench = (e: DragEvent) => {
    e.preventDefault();
    if (!draggedPlayer || !activeGW) return;
    
    setSelections(prev => {
      const newMap = new Map(prev);
      const gwSet = new Set(newMap.get(activeGW) || []);
      gwSet.delete(draggedPlayer);
      newMap.set(activeGW, gwSet);
      return newMap;
    });
    setDraggedPlayer(null);
  };

  const togglePlayer = (playerId: number) => {
    if (!activeGW) return;
    const isSelected = selections.get(activeGW)?.has(playerId);
    
    if (isSelected) {
      setSelections(prev => {
        const newMap = new Map(prev);
        const gwSet = new Set(newMap.get(activeGW) || []);
        gwSet.delete(playerId);
        newMap.set(activeGW, gwSet);
        return newMap;
      });
    } else {
      const player = playerData.find(p => p.player.id === playerId)?.player;
      if (!player) return;
      
      setSelections(prev => {
        const newMap = new Map(prev);
        const gwSet = new Set(newMap.get(activeGW) || []);
        
        if (gwSet.size >= 11) return prev;
        
        const selectedPlayers = playerData.filter(p => gwSet.has(p.player.id)).map(p => p.player);
        const posCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
        selectedPlayers.forEach(p => posCount[p.element_type as 1|2|3|4]++);
        const maxPerPos = { 1: 1, 2: 5, 3: 5, 4: 3 };
        
        if (posCount[player.element_type as 1|2|3|4] >= maxPerPos[player.element_type as 1|2|3|4]) return prev;
        
        gwSet.add(playerId);
        newMap.set(activeGW, gwSet);
        return newMap;
      });
    }
  };

  const getSelectedPlayers = (gw: number): Player[] => {
    const ids = selections.get(gw) || new Set();
    return playerData.filter(p => ids.has(p.player.id)).map(p => p.player);
  };

  const getBenchPlayers = (gw: number): Player[] => {
    const ids = selections.get(gw) || new Set();
    return playerData.filter(p => !ids.has(p.player.id)).map(p => p.player);
  };

  const isValidSelection = (gw: number): boolean => {
    const selected = getSelectedPlayers(gw);
    if (selected.length !== 11) return false;
    const gk = selected.filter(p => p.element_type === 1).length;
    const def = selected.filter(p => p.element_type === 2).length;
    const fwd = selected.filter(p => p.element_type === 4).length;
    return gk === 1 && def >= 3 && fwd >= 1;
  };

  const startPlanning = () => {
    setStep('select');
    setActiveGW(upcomingGWs[0]);
  };

  const nextGW = () => {
    const idx = upcomingGWs.indexOf(activeGW!);
    if (idx < upcomingGWs.length - 1) {
      setActiveGW(upcomingGWs[idx + 1]);
    } else {
      setStep('review');
    }
  };

  const prevGW = () => {
    const idx = upcomingGWs.indexOf(activeGW!);
    if (idx > 0) {
      setActiveGW(upcomingGWs[idx - 1]);
    } else {
      setStep('setup');
    }
  };

  if (!managerId) {
    return (
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-white">Fixture Planner</h1>
        <p className="text-slate-400">Please set up your team first.</p>
        <button onClick={() => navigate('/my-team')} className="mt-4 rounded-md bg-violet-500 px-4 py-2 text-white">
          Go to My Team
        </button>
      </div>
    );
  }

  if (fplLoading || loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-white">Fixture Planner</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (!nextGameweek) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-white">Fixture Planner</h1>
        <p className="text-slate-400">Unable to determine current gameweek. Please try again.</p>
      </div>
    );
  }

  // Step 1: Setup
  if (step === 'setup') {
    return (
      <div>
        <button onClick={() => navigate('/my-team')} className="mb-4 text-sm text-slate-400 hover:text-white">
          ← Back to My Team
        </button>
        <h1 className="mb-2 text-2xl font-bold text-white">Fixture Planner</h1>
        <p className="mb-6 text-slate-400">Plan your starting 11 for upcoming gameweeks based on fixtures.</p>

        <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">How many gameweeks to plan?</h2>
          <p className="mb-4 text-sm text-slate-400">Next upcoming gameweek: GW{nextGameweek}</p>
          
          <div className="mb-6 flex gap-2">
            {[2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setNumGameweeks(n)}
                className={`rounded-md px-6 py-3 text-lg font-medium transition-all ${
                  numGameweeks === n ? 'bg-violet-500 text-white' : 'bg-[#2A2A35] text-slate-400 hover:bg-[#35353F]'
                }`}
              >
                {n} GWs
              </button>
            ))}
          </div>

          <p className="mb-4 text-sm text-slate-400">
            Planning: GW{upcomingGWs[0]} → GW{upcomingGWs[upcomingGWs.length - 1]}
          </p>

          <button onClick={startPlanning} className="rounded-md bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700">
            Start Planning →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Select (Drag & Drop)
  if (step === 'select' && activeGW) {
    const selected = getSelectedPlayers(activeGW);
    const bench = getBenchPlayers(activeGW);
    const formation = getFormation(selected);
    const gwIndex = upcomingGWs.indexOf(activeGW);

    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button onClick={prevGW} className="text-sm text-slate-400 hover:text-white">
            ← {gwIndex === 0 ? 'Back to Setup' : `GW${upcomingGWs[gwIndex - 1]}`}
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">GW{activeGW} Selection</h1>
            <p className="text-sm text-slate-400">Step {gwIndex + 1} of {upcomingGWs.length} • Drag players or click to toggle</p>
          </div>
          <div className="w-24" />
        </div>

        {/* Progress bar */}
        <div className="mb-6 flex gap-1">
          {upcomingGWs.map((gw, i) => (
            <button
              key={gw}
              onClick={() => setActiveGW(gw)}
              className={`h-2 flex-1 rounded transition-colors ${
                gw === activeGW ? 'bg-violet-500' : i < gwIndex ? 'bg-emerald-500' : 'bg-[#2A2A35]'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-4">
          {/* Starting 11 */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDropToStarting}
            className={`flex-1 rounded-lg border-2 border-dashed p-4 transition-colors ${
              draggedPlayer && !selections.get(activeGW)?.has(draggedPlayer)
                ? 'border-violet-500 bg-violet-500/10'
                : 'border-dark-border bg-[#25252B]'
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-white">Starting 11</h2>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${selected.length === 11 ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {selected.length}/11
                </span>
                <span className="text-lg font-bold text-violet-400">{selected.length === 11 ? formation : '-'}</span>
              </div>
            </div>

            <div className="space-y-3">
              {[4, 3, 2, 1].map(pos => {
                const posPlayers = selected.filter(p => p.element_type === pos);
                if (posPlayers.length === 0) return null;
                return (
                  <div key={pos} className="flex items-center justify-center gap-2">
                    {posPlayers.map(player => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        fixture={getFixtureInfo(player.id, activeGW)}
                        isSelected={true}
                        onDragStart={handleDragStart}
                        onClick={() => togglePlayer(player.id)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bench */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDropToBench}
            className={`w-32 rounded-lg border-2 border-dashed p-3 transition-colors ${
              draggedPlayer && selections.get(activeGW)?.has(draggedPlayer)
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-dark-border bg-[#1E1E24]'
            }`}
          >
            <h3 className="mb-3 text-xs font-semibold text-slate-400 text-center">Bench ({bench.length})</h3>
            <div className="space-y-2">
              {bench.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  fixture={getFixtureInfo(player.id, activeGW)}
                  isSelected={false}
                  onDragStart={handleDragStart}
                  onClick={() => togglePlayer(player.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={nextGW}
            disabled={!isValidSelection(activeGW)}
            className="rounded-md bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {gwIndex === upcomingGWs.length - 1 ? 'Review All →' : `Next: GW${upcomingGWs[gwIndex + 1]} →`}
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Review
  return (
    <div>
      <button onClick={() => { setStep('select'); setActiveGW(upcomingGWs[upcomingGWs.length - 1]); }} className="mb-4 text-sm text-slate-400 hover:text-white">
        ← Back to Selection
      </button>
      <h1 className="mb-2 text-2xl font-bold text-white">Review All Selections</h1>
      <p className="mb-6 text-slate-400">Your planned starting 11 for each gameweek</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {upcomingGWs.map(gw => {
          const selected = getSelectedPlayers(gw);
          const formation = getFormation(selected);
          const avgDiff = selected.reduce((sum, p) => {
            const f = getFixtureInfo(p.id, gw);
            return sum + (f?.difficulty || 3);
          }, 0) / selected.length;

          return (
            <div key={gw} className="rounded-lg border border-dark-border bg-[#25252B] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-white">GW{gw}</h3>
                <span className="text-lg font-bold text-violet-400">{formation}</span>
              </div>
              
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-slate-400">Avg Difficulty:</span>
                <span className={avgDiff <= 2.5 ? 'text-emerald-400' : avgDiff >= 3.5 ? 'text-red-400' : 'text-yellow-400'}>
                  {avgDiff.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1">
                {selected.map(p => {
                  const f = getFixtureInfo(p.id, gw);
                  return (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="text-white">{p.web_name}</span>
                      {f && (
                        <span className={`rounded px-2 py-0.5 text-xs ${getDifficultyColor(f.difficulty)}`}>
                          {f.opponent} ({f.venue})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => { setStep('select'); setActiveGW(gw); }}
                className="mt-3 w-full rounded bg-[#2A2A35] py-1 text-xs text-slate-400 hover:bg-[#35353F]"
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <button onClick={() => navigate('/my-team')} className="rounded-md bg-violet-500 px-6 py-2 text-white hover:bg-violet-600">
          Done
        </button>
      </div>
    </div>
  );
}
