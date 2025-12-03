import React, { useState } from 'react';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import VoiceAgent from './components/VoiceAgent';
import './App.css';

/**
 * Main Application Component
 *
 * Manages the connection to LiveKit and renders the voice agent interface
 * Handles token fetching and room connection lifecycle
 */
function App() {
  // State for LiveKit connection
  const [token, setToken] = useState('');
  const [livekitUrl, setLivekitUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  // Token server endpoint (update this to match your backend URL)
  const TOKEN_SERVER_URL = 'http://localhost:3000/token';

  /**
   * Fetches access token from backend server
   * This token is required to connect to the LiveKit room
   */
  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');

    try {
      console.log('[App] Fetching access token from server...');

      const response = await fetch(TOKEN_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: 'weather-room',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.statusText}`);
      }

      const data = await response.json();

      console.log('[App] Token received, connecting to room...');

      // Set token and URL to trigger LiveKit connection
      setToken(data.token);
      setLivekitUrl(data.url);

    } catch (err) {
      console.error('[App] Connection error:', err);
      setError(err.message || 'Failed to connect. Please ensure the token server is running.');
      setIsConnecting(false);
    }
  };

  /**
   * Disconnects from the LiveKit room
   */
  const handleDisconnect = () => {
    setToken('');
    setLivekitUrl('');
    setIsConnecting(false);
    setError('');
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">Voice Weather Assistant</h1>
          <p className="subtitle">Ask me about the weather in any city!</p>
        </header>

        <main className="main">
          {!token ? (
            // Connection screen - shown when not connected
            <div className="connection-screen">
              <div className="info-card">
                <h2>How to Use</h2>
                <ol>
                  <li>Click the "Connect" button below</li>
                  <li>Allow microphone access when prompted</li>
                  <li>Start speaking to ask about weather</li>
                  <li>Example: "What's the weather in London?"</li>
                </ol>
              </div>

              {error && (
                <div className="error-message">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <button
                className="connect-button"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect to Agent'}
              </button>
            </div>
          ) : (
            // Voice agent interface - shown when connected
            <LiveKitRoom
              token={token}
              serverUrl={livekitUrl}
              connect={true}
              audio={true}
              video={false}
              onDisconnected={handleDisconnect}
              className="livekit-room"
            >
              <VoiceAgent onDisconnect={handleDisconnect} />
              <RoomAudioRenderer />
            </LiveKitRoom>
          )}
        </main>

        <footer className="footer">
          <p>Powered by LiveKit & OpenAI</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
