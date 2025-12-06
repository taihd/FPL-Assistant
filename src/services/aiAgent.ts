import { GoogleGenerativeAI } from '@google/generative-ai';
import { groundSearch } from './grounding';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AskFPLAssistantParams {
  screen: string;
  dataSnapshot: unknown;
  question: string;
  conversationHistory?: Message[];
}

export async function askFPLAssistant({
  screen,
  dataSnapshot,
  question,
  conversationHistory = [],
}: AskFPLAssistantParams): Promise<string> {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!geminiKey && !openaiKey) {
    throw new Error(
      'Please set either VITE_GEMINI_API_KEY or VITE_OPENAI_API_KEY in your environment variables'
    );
  }

  // Prefer Gemini, fallback to OpenAI
  if (geminiKey) {
    return askWithGemini({ screen, dataSnapshot, question, conversationHistory, apiKey: geminiKey });
  } else if (openaiKey) {
    return askWithOpenAI({ screen, dataSnapshot, question, conversationHistory, apiKey: openaiKey });
  }
  
  throw new Error('No AI API key configured');
}

async function askWithGemini({
  screen,
  dataSnapshot,
  question,
  conversationHistory = [],
  apiKey,
}: AskFPLAssistantParams & { apiKey: string }): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-pro (latest model) or allow override via env var
    // Alternative models: gemini-pro, gemini-1.5-flash, gemini-1.5-pro-latest
    const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-pro';
    
    // Perform grounding search to fetch additional relevant data
    let groundedData = null;
    const isGoogleGroundingEnabled = import.meta.env.VITE_ENABLE_GROUNDING === 'true';
    
    console.log('[AI Agent] Google Search Grounding enabled:', isGoogleGroundingEnabled);
    
    try {
      groundedData = await groundSearch({ question, screen, dataSnapshot });
      console.log('[AI Agent] Grounding data retrieved:', {
        hasPlayers: !!groundedData?.relevantPlayers?.length,
        hasTeams: !!groundedData?.relevantTeams?.length,
        hasFixtures: !!groundedData?.relevantFixtures?.length,
        hasAdditionalData: !!groundedData?.additionalData,
      });
    } catch (groundingError) {
      console.warn('[AI Agent] Grounding search failed, continuing without it:', groundingError);
    }

    const modelConfig: {
      model: string;
      tools?: Array<{ googleSearchRetrieval: { dynamicRetrievalConfig: { mode: string; dynamicThreshold: number } } }>;
    } = {
      model: modelName,
    };

    // Enable grounding with Google Search if available
    if (isGoogleGroundingEnabled) {
      modelConfig.tools = [{
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            mode: 'MODE_DYNAMIC',
            dynamicThreshold: 0.3,
          },
        },
      }];
      console.log('[AI Agent] Google Search grounding tool configured');
    }

    const model = genAI.getGenerativeModel(modelConfig);

    // Format context based on screen
    let contextDescription = '';
    if (dataSnapshot) {
      try {
        const snapshot = dataSnapshot as Record<string, unknown>;
        
        switch (screen) {
          case 'fixtures':
            contextDescription = `The user is viewing fixtures. Available data includes gameweeks, teams, and fixture details.`;
            break;
          case 'clubs':
            contextDescription = `The user is viewing clubs/teams. Available data includes team information, fixtures, and strength ratings.`;
            break;
          case 'players':
            contextDescription = `The user is viewing players. Available data includes player statistics, prices, points, and performance metrics.`;
            break;
          case 'managers':
            contextDescription = `The user is viewing manager information. Available data includes manager stats, history, transfers, and chip usage.`;
            break;
          case 'leagues':
            contextDescription = `The user is viewing leagues. Available data includes league standings and rankings.`;
            break;
          default:
            contextDescription = `The user is on the ${screen} page.`;
        }
        
        // Add relevant data summary
        const dataSummary = JSON.stringify(snapshot).slice(0, 3000);
        if (dataSummary && dataSummary !== '{}') {
          contextDescription += `\n\nRelevant data: ${dataSummary}`;
        }
      } catch (e) {
        contextDescription = `The user is on the ${screen} page.`;
      }
    } else {
      contextDescription = `The user is on the ${screen} page.`;
    }

    // Add grounded data to context with detailed information
    if (groundedData) {
      let groundedContext = '\n\n=== GROUNDED DATA (Use this information to answer the question) ===\n';
      
      if (groundedData.relevantPlayers && groundedData.relevantPlayers.length > 0) {
        groundedContext += `\nRelevant Players Found:\n`;
        for (const player of groundedData.relevantPlayers) {
          groundedContext += `- ${player.web_name} (${player.first_name} ${player.second_name}): ${player.total_points} total points, £${(player.now_cost/10).toFixed(1)}m, ${player.goals_scored} goals, ${player.assists} assists, ${player.form} form, ${player.selected_by_percent}% ownership\n`;
        }
      }
      
      if (groundedData.relevantTeams && groundedData.relevantTeams.length > 0) {
        groundedContext += `\nRelevant Teams Found:\n`;
        for (const team of groundedData.relevantTeams) {
          groundedContext += `- ${team.name} (${team.short_name}): Strength ${team.strength}, ${team.strength_attack_home} attack home, ${team.strength_attack_away} attack away\n`;
        }
      }
      
      if (groundedData.relevantFixtures && groundedData.relevantFixtures.length > 0) {
        groundedContext += `\nRelevant Fixtures (${groundedData.relevantFixtures.length} fixtures):\n`;
        for (const fixture of groundedData.relevantFixtures.slice(0, 5)) {
          groundedContext += `- GW ${fixture.event}: ${fixture.team_h} vs ${fixture.team_a} (${fixture.team_h_difficulty} vs ${fixture.team_a_difficulty} difficulty)\n`;
        }
      }
      
      if (groundedData.additionalData && (groundedData.additionalData as { playerSummaries?: unknown[] }).playerSummaries) {
        const summaries = (groundedData.additionalData as { playerSummaries: unknown[] }).playerSummaries;
        if (summaries && summaries.length > 0) {
          groundedContext += `\nDetailed Player Summaries Available (${summaries.length} players)\n`;
          // Include key stats from summaries
          for (const summary of summaries.slice(0, 3)) {
            if (summary && typeof summary === 'object') {
              const s = summary as Record<string, unknown>;
              groundedContext += `- Player ID ${s.id || 'unknown'}: Recent form and history data available\n`;
            }
          }
        }
      }
      
      groundedContext += '\n=== END GROUNDED DATA ===\n';
      contextDescription += groundedContext;
    } else {
      contextDescription += '\n\nNote: No additional grounded data was found. You may need to search for information or ask the user for clarification.\n';
    }

    // Build conversation history context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\n\nPrevious Conversation:\n';
      // Include last 5 messages for context (to avoid token limits)
      const recentHistory = conversationHistory.slice(-5);
      for (const msg of recentHistory) {
        conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      }
    }

    const prompt = `You are an expert Fantasy Premier League (FPL) assistant. Your role is to help users make informed decisions about their FPL teams.

Current Context:
- Current Page: ${screen}
${contextDescription}${conversationContext}

Current User Question: ${question}

Instructions:
1. Provide accurate, helpful answers based on the context, grounded data, and conversation history
2. If the question relates to the current page, use the available data to give specific insights
3. Use the grounded data (players, teams, fixtures) to provide precise, factual answers
4. Reference previous conversation if the current question relates to it (e.g., "As I mentioned before...", "Following up on...")
5. Be concise but informative
6. If you don't have enough information in the context, say so but still try to help
7. Use FPL terminology correctly (gameweeks, transfers, chips, etc.)
8. Format your response in a clear, readable way
9. When referencing players or teams, use the exact data from the grounded context

Answer:`;

    // For Gemini, we can use startChat for conversation history, but for now use generateContent with history in prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Unable to get AI response. Please try again.');
  }
}

async function askWithOpenAI({
  screen,
  dataSnapshot,
  question,
  conversationHistory = [],
  apiKey,
}: AskFPLAssistantParams & { apiKey: string }): Promise<string> {
  // Format context based on screen
  let contextDescription = '';
  if (dataSnapshot) {
    try {
      const snapshot = dataSnapshot as Record<string, unknown>;
      
      switch (screen) {
        case 'fixtures':
          contextDescription = `The user is viewing fixtures. Available data includes gameweeks, teams, and fixture details.`;
          break;
        case 'clubs':
          contextDescription = `The user is viewing clubs/teams. Available data includes team information, fixtures, and strength ratings.`;
          break;
        case 'players':
          contextDescription = `The user is viewing players. Available data includes player statistics, prices, points, and performance metrics.`;
          break;
        case 'managers':
          contextDescription = `The user is viewing manager information. Available data includes manager stats, history, transfers, and chip usage.`;
          break;
        case 'leagues':
          contextDescription = `The user is viewing leagues. Available data includes league standings and rankings.`;
          break;
        default:
          contextDescription = `The user is on the ${screen} page.`;
      }
      
      // Add relevant data summary
      const dataSummary = JSON.stringify(snapshot).slice(0, 3000);
      if (dataSummary && dataSummary !== '{}') {
        contextDescription += `\n\nRelevant data: ${dataSummary}`;
      }
    } catch (e) {
      contextDescription = `The user is on the ${screen} page.`;
    }
  } else {
    contextDescription = `The user is on the ${screen} page.`;
  }

  // Build conversation history for OpenAI (uses messages format)
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: `You are an expert Fantasy Premier League (FPL) assistant. Your role is to help users make informed decisions about their FPL teams.

Current Context:
- Current Page: ${screen}
${contextDescription}

Instructions:
1. Provide accurate, helpful answers based on the context provided
2. If the question relates to the current page, use the available data to give specific insights
3. Reference previous conversation if the current question relates to it
4. Be concise but informative
5. If you don't have enough information in the context, say so but still try to help
6. Use FPL terminology correctly (gameweeks, transfers, chips, etc.)
7. Format your response in a clear, readable way`,
    },
  ];

  // Add conversation history (last 10 messages to stay within token limits)
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  }

  // Add current question
  messages.push({
    role: 'user',
    content: question,
  });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `OpenAI API error: ${response.status}`
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from AI';
  } catch (error) {
    console.error('OpenAI AI Error:', error);
    throw new Error('Unable to get AI response. Please try again.');
  }
}

