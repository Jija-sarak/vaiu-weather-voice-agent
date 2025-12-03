import dotenv from 'dotenv';
import { WorkerOptions, defineAgent, llm, multimodal } from '@livekit/agents';
import { openai } from '@livekit/agents-plugin-openai';
import { getWeather, formatWeatherResponse } from '../utils/weather.js';

dotenv.config();

/**
 * Voice Weather Agent - Main Entry Point
 *
 * This agent uses LiveKit's multimodal capabilities to:
 * 1. Listen to user voice input (Speech-to-Text)
 * 2. Process requests using LLM with function calling
 * 3. Fetch weather data when requested
 * 4. Respond naturally via voice (Text-to-Speech)
 *
 * Architecture:
 * - STT: OpenAI Whisper (via LiveKit)
 * - LLM: OpenAI GPT-4 with function calling
 * - TTS: OpenAI TTS (natural voice synthesis)
 */

/**
 * Weather Tool Definition
 * This tool is exposed to the LLM, allowing it to fetch weather data
 * when users ask about weather conditions in any location
 */
const weatherTool = {
  name: 'get_weather',
  description: 'Get the current weather for a specific city or location. Use this when users ask about weather conditions, temperature, or climate in any place.',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'The city name or location (e.g., "London", "Paris, France", "New York")'
      }
    },
    required: ['location']
  }
};

/**
 * Weather Tool Handler
 * Executes when the LLM decides to call the weather function
 *
 * @param {Object} args - Function arguments from LLM
 * @param {string} args.location - City/location to fetch weather for
 * @returns {Promise<string>} Formatted weather information
 */
async function handleWeatherTool(args) {
  const { location } = args;

  console.log(`[Agent] Weather tool called for location: ${location}`);

  try {
    // Fetch weather data from OpenWeatherMap API
    const weatherData = await getWeather(location);

    // Format into natural language response
    const response = formatWeatherResponse(weatherData);

    console.log(`[Agent] Weather retrieved successfully: ${response}`);

    return response;

  } catch (error) {
    // Handle errors gracefully with user-friendly messages
    console.error(`[Agent] Weather tool error:`, error.message);

    // Return error message that will be spoken to the user
    if (error.message.includes('not found')) {
      return `I couldn't find weather information for ${location}. Could you please check the city name and try again?`;
    } else if (error.message.includes('API key')) {
      return `I'm having trouble connecting to the weather service. The API configuration may need attention.`;
    } else if (error.message.includes('timed out')) {
      return `The weather service is taking too long to respond. Please try again in a moment.`;
    } else {
      return `I encountered an issue while fetching the weather for ${location}. Please try again.`;
    }
  }
}

/**
 * Main Agent Definition
 * Configures the voice agent with multimodal capabilities
 */
export default defineAgent({
  /**
   * Agent Entry Point
   * Called when a participant joins the LiveKit room
   */
  async entry(ctx) {
    console.log('[Agent] Starting voice weather agent...');

    // Wait for participant to connect
    await ctx.connect();
    console.log('[Agent] Connected to room, waiting for participant...');

    // Get the first participant (user) in the room
    const participant = await ctx.waitForParticipant();
    console.log(`[Agent] Participant joined: ${participant.identity}`);

    // Initialize the LLM with function calling capabilities
    const model = new openai.realtime.RealtimeModel({
      apiKey: process.env.OPENAI_API_KEY,
      instructions: `You are a friendly and helpful weather assistant. Your job is to help users get weather information for any city they ask about.

When a user asks about weather, use the get_weather function to fetch real-time data.

Guidelines:
- Be conversational and natural in your responses
- If the user's request is unclear, politely ask them to specify the city name
- Always provide helpful information about temperature, conditions, and other relevant details
- If there's an error, explain it clearly and offer to help with another city
- Keep responses concise but informative
- Use a warm, friendly tone

Remember: You can only provide weather information. If users ask about other topics, politely redirect them to weather-related questions.`,
      modalities: ['text', 'audio'], // Support both text and voice
      voice: 'alloy', // OpenAI TTS voice (natural sounding)
      temperature: 0.7, // Slightly creative but mostly factual
      tools: [weatherTool], // Register the weather function
    });

    // Create the multimodal agent session
    const agent = new multimodal.MultimodalAgent({
      model,
      // Function call handler - routes tool calls to appropriate handlers
      onFunctionCall: async (functionName, args) => {
        console.log(`[Agent] Function called: ${functionName}`, args);

        if (functionName === 'get_weather') {
          return await handleWeatherTool(args);
        }

        // Fallback for unknown functions
        console.error(`[Agent] Unknown function: ${functionName}`);
        return 'Sorry, I encountered an error processing your request.';
      }
    });

    // Start the agent session with the participant
    const session = await agent
      .start(ctx.room, participant)
      .catch(error => {
        console.error('[Agent] Failed to start agent:', error);
        throw error;
      });

    console.log('[Agent] Voice weather agent is now active and listening...');

    // Send initial greeting
    await session.response.create({
      modalities: ['text', 'audio']
    });

    // Keep the session alive
    await session.waitForDisconnection();
    console.log('[Agent] Participant disconnected, session ended.');
  }
});

/**
 * Worker Configuration
 * Specifies which agent to run and resource requirements
 */
export const workerOptions = {
  agent: 'voice-weather-agent',
  // Configure resource limits if needed
  maxConcurrentSessions: 5,
};

// Start the agent worker
console.log('[Agent] Voice Weather Agent initialized and ready');
