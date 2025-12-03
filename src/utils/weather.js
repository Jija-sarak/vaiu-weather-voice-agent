import dotenv from 'dotenv';
dotenv.config();

/**
 * Weather utility module for fetching real-time weather data
 * Uses OpenWeatherMap API to retrieve current weather conditions
 */

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetches current weather data for a specified location
 *
 * @param {string} location - City name or "City, Country Code" (e.g., "London" or "London, UK")
 * @returns {Promise<Object>} Weather data object containing temperature, conditions, humidity, etc.
 * @throws {Error} If API key is missing, city not found, or network request fails
 */
export async function getWeather(location) {
  // Validate API key exists
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key is not configured. Please add OPENWEATHER_API_KEY to your .env file.');
  }

  // Validate location parameter
  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    throw new Error('Location parameter is required and must be a non-empty string.');
  }

  try {
    // Build API request URL with query parameters
    const url = new URL(OPENWEATHER_BASE_URL);
    url.searchParams.append('q', location.trim());
    url.searchParams.append('appid', OPENWEATHER_API_KEY);
    url.searchParams.append('units', 'metric'); // Use Celsius for temperature

    console.log(`[Weather API] Fetching weather for: ${location}`);

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url.toString(), {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    // Handle HTTP error responses
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`City "${location}" not found. Please check the spelling and try again.`);
      } else if (response.status === 401) {
        throw new Error('Invalid OpenWeather API key. Please check your configuration.');
      } else if (response.status === 429) {
        throw new Error('Weather API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }
    }

    // Parse JSON response
    const data = await response.json();

    // Validate response structure
    if (!data || !data.main || !data.weather || data.weather.length === 0) {
      throw new Error('Unexpected weather API response format.');
    }

    // Extract and format weather information
    const weatherInfo = {
      location: data.name,
      country: data.sys?.country || 'Unknown',
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      timestamp: new Date(data.dt * 1000).toISOString()
    };

    console.log(`[Weather API] Successfully retrieved weather for ${weatherInfo.location}, ${weatherInfo.country}`);

    return weatherInfo;

  } catch (error) {
    // Handle network errors (timeout, connection issues, etc.)
    if (error.name === 'AbortError') {
      throw new Error('Weather API request timed out. Please check your internet connection and try again.');
    }

    // Re-throw custom errors
    if (error.message.includes('not found') ||
        error.message.includes('API key') ||
        error.message.includes('rate limit')) {
      throw error;
    }

    // Handle unexpected errors
    console.error('[Weather API] Unexpected error:', error);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
}

/**
 * Formats weather data into a natural, conversational response
 *
 * @param {Object} weatherData - Weather data object from getWeather()
 * @returns {string} Human-readable weather description
 */
export function formatWeatherResponse(weatherData) {
  const { location, country, temperature, feelsLike, condition, humidity, windSpeed } = weatherData;

  // Create natural language response
  let response = `The current weather in ${location}, ${country} is ${condition}. `;
  response += `The temperature is ${temperature} degrees Celsius`;

  if (Math.abs(temperature - feelsLike) > 2) {
    response += `, but it feels like ${feelsLike} degrees`;
  }

  response += `. Humidity is at ${humidity} percent`;

  if (windSpeed > 5) {
    response += `, with winds at ${windSpeed} meters per second`;
  }

  response += `.`;

  return response;
}
