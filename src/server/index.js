import dotenv from 'dotenv';
import express from 'express';
import { AccessToken } from 'livekit-server-sdk';

dotenv.config();

/**
 * Token Server for LiveKit
 *
 * This server generates secure access tokens for clients to connect
 * to LiveKit rooms. It's required for the frontend to establish
 * a connection to the voice agent.
 *
 * Security Notes:
 * - API keys/secrets should never be exposed to the client
 * - Tokens are short-lived and scoped to specific rooms
 * - Each participant gets a unique identity
 */

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for frontend access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Voice Weather Agent Token Server',
    timestamp: new Date().toISOString()
  });
});

/**
 * Token Generation Endpoint
 *
 * Generates a LiveKit access token for a client to join a room
 *
 * Request body:
 * - roomName: (optional) Name of the room to join, defaults to 'weather-room'
 * - identity: (optional) Participant identity, defaults to random ID
 *
 * Response:
 * - token: JWT token for LiveKit connection
 * - url: LiveKit server URL
 */
app.post('/token', async (req, res) => {
  try {
    const { roomName = 'weather-room', identity } = req.body;

    // Validate environment variables
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      console.error('[Token Server] Missing LiveKit configuration');
      return res.status(500).json({
        error: 'Server configuration error. Please check LiveKit environment variables.'
      });
    }

    // Generate unique identity if not provided
    const participantIdentity = identity || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const participantName = `Guest ${participantIdentity.substr(-4)}`;

    console.log(`[Token Server] Generating token for ${participantIdentity} in room ${roomName}`);

    // Create access token with appropriate permissions
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
      // Token valid for 6 hours
      ttl: '6h',
    });

    // Grant permissions for the room
    at.addGrant({
      room: roomName,
      roomJoin: true, // Allow joining the room
      canPublish: true, // Allow publishing audio/video
      canSubscribe: true, // Allow subscribing to other participants
      canPublishData: true, // Allow publishing data messages
    });

    // Generate the JWT token
    const token = await at.toJwt();

    console.log(`[Token Server] Token generated successfully for ${participantIdentity}`);

    // Return token and connection info to client
    res.json({
      token,
      url: livekitUrl,
      roomName,
      identity: participantIdentity
    });

  } catch (error) {
    console.error('[Token Server] Error generating token:', error);
    res.status(500).json({
      error: 'Failed to generate access token',
      message: error.message
    });
  }
});

/**
 * GET endpoint for token generation (for simple browser testing)
 */
app.get('/token', async (req, res) => {
  const roomName = req.query.room || 'weather-room';
  const identity = req.query.identity;

  // Forward to POST handler
  req.body = { roomName, identity };
  return app._router.handle(req, res);
});

/**
 * Start the server
 */
app.listen(PORT, () => {
  console.log(`[Token Server] Running on http://localhost:${PORT}`);
  console.log(`[Token Server] Health check: http://localhost:${PORT}/health`);
  console.log(`[Token Server] Token endpoint: http://localhost:${PORT}/token`);
});

export default app;
