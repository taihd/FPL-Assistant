// Grounding search service for AI Assistant
// Fetches additional FPL data when needed to ground AI responses

import {
  getBootstrapData,
  getFixtures,
  getPlayerSummary,
} from './api';
import type {
  Fixture,
  Player,
  Team,
} from '@/types/fpl';

interface GroundingContext {
  question: string;
  screen: string;
  dataSnapshot?: unknown;
}

interface GroundedData {
  additionalData?: unknown;
  searchTerms?: string[];
  relevantPlayers?: Player[];
  relevantTeams?: Team[];
  relevantFixtures?: Fixture[];
}

/**
 * Analyzes the question and fetches additional relevant data to ground the AI response
 */
export async function groundSearch({
  question,
  screen,
  dataSnapshot: _dataSnapshot,
}: GroundingContext): Promise<GroundedData> {
  const questionLower = question.toLowerCase();
  const result: GroundedData = {};

  console.log('[Grounding] Starting grounding search for question:', question);

  try {
    // Get bootstrap data for reference
    const bootstrap = await getBootstrapData();
    console.log('[Grounding] Bootstrap data loaded');

    // Extract player names from question
    const playerMatches = extractPlayerNames(questionLower, bootstrap.elements);
    if (playerMatches.length > 0) {
      result.relevantPlayers = playerMatches.slice(0, 5); // Limit to 5 players
      console.log('[Grounding] Found players:', result.relevantPlayers.map(p => p.web_name));
    }

    // Extract team names from question
    const teamMatches = extractTeamNames(questionLower, bootstrap.teams);
    if (teamMatches.length > 0) {
      result.relevantTeams = teamMatches;
      console.log('[Grounding] Found teams:', result.relevantTeams.map(t => t.name));
    }

    // Check if question is about fixtures
    if (
      questionLower.includes('fixture') ||
      questionLower.includes('gameweek') ||
      questionLower.includes('match') ||
      questionLower.includes('upcoming') ||
      questionLower.includes('schedule')
    ) {
      const fixtures = await getFixtures();
      result.relevantFixtures = fixtures.slice(0, 20); // Limit to 20 fixtures
      console.log('[Grounding] Loaded fixtures:', result.relevantFixtures.length);
    }

    // Always try to get player summaries if players are mentioned OR if question is about player stats
    const isPlayerRelated = 
      questionLower.includes('player') ||
      questionLower.includes('points') ||
      questionLower.includes('price') ||
      questionLower.includes('form') ||
      questionLower.includes('stat') ||
      questionLower.includes('score') ||
      questionLower.includes('goal') ||
      questionLower.includes('assist') ||
      (result.relevantPlayers && result.relevantPlayers.length > 0);

    if (isPlayerRelated) {
      // If we found specific players, get their detailed summaries
      if (result.relevantPlayers && result.relevantPlayers.length > 0) {
        console.log('[Grounding] Fetching player summaries for:', result.relevantPlayers.map(p => p.web_name));
        const playerSummaries = await Promise.allSettled(
          result.relevantPlayers.slice(0, 3).map((player) =>
            getPlayerSummary(player.id).catch(() => null)
          )
        );
        result.additionalData = {
          playerSummaries: playerSummaries
            .filter((p) => p.status === 'fulfilled' && p.value)
            .map((p) => (p.status === 'fulfilled' ? p.value : null)),
        };
        const summaries = result.additionalData as { playerSummaries?: unknown[] };
        console.log('[Grounding] Loaded player summaries:', summaries?.playerSummaries?.length || 0);
      } else {
        // If no specific players found but question is player-related, get top players
        console.log('[Grounding] No specific players found, fetching top players');
        const topPlayers = bootstrap.elements
          .sort((a, b) => b.total_points - a.total_points)
          .slice(0, 5);
        result.relevantPlayers = topPlayers;
      }
    }

    // Generate search terms for web search (if needed)
    result.searchTerms = generateSearchTerms(question, screen, {
      players: result.relevantPlayers,
      teams: result.relevantTeams,
    });

    console.log('[Grounding] Grounding search completed:', {
      hasPlayers: !!result.relevantPlayers?.length,
      hasTeams: !!result.relevantTeams?.length,
      hasFixtures: !!result.relevantFixtures?.length,
      hasAdditionalData: !!result.additionalData,
      searchTerms: result.searchTerms?.length || 0,
    });

    return result;
  } catch (error) {
    console.error('[Grounding] Grounding search error:', error);
    return result;
  }
}

function extractPlayerNames(question: string, players: Player[]): Player[] {
  const matches: Player[] = [];
  
  for (const player of players) {
    const playerName = player.web_name.toLowerCase();
    const firstName = player.first_name.toLowerCase();
    const lastName = player.second_name.toLowerCase();
    
    if (
      question.includes(playerName) ||
      question.includes(firstName) ||
      question.includes(lastName) ||
      question.includes(`${firstName} ${lastName}`)
    ) {
      matches.push(player);
    }
  }
  
  return matches;
}

function extractTeamNames(question: string, teams: Team[]): Team[] {
  const matches: Team[] = [];
  
  for (const team of teams) {
    const teamName = team.name.toLowerCase();
    const shortName = team.short_name.toLowerCase();
    
    if (question.includes(teamName) || question.includes(shortName)) {
      matches.push(team);
    }
  }
  
  return matches;
}

function generateSearchTerms(
  question: string,
  screen: string,
  context: { players?: Player[]; teams?: Team[] }
): string[] {
  const terms: string[] = [];
  
  // Add FPL context
  terms.push('Fantasy Premier League');
  
  // Add screen context
  if (screen !== 'fixtures') {
    terms.push(screen);
  }
  
  // Add player/team context
  if (context.players && context.players.length > 0) {
    terms.push(...context.players.map((p) => p.web_name));
  }
  
  if (context.teams && context.teams.length > 0) {
    terms.push(...context.teams.map((t) => t.name));
  }
  
  // Extract key terms from question
  const questionTerms = question
    .toLowerCase()
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 3 &&
        !['what', 'which', 'when', 'where', 'why', 'how', 'the', 'and', 'for', 'are', 'is'].includes(word)
    )
    .slice(0, 3);
  
  terms.push(...questionTerms);
  
  return [...new Set(terms)]; // Remove duplicates
}

