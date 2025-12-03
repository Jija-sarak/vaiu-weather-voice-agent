import React, { useState, useEffect } from 'react';
import { useRoomContext, useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import './VoiceAgent.css';

/**
 * Voice Agent Component
 *
 * Provides the main interface for interacting with the voice weather agent
 * Displays connection status and provides controls for the conversation
 */
function VoiceAgent({ onDisconnect }) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  /**
   * Monitor connection state changes
   */
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      console.log('[VoiceAgent] Connected to room successfully');
      setIsListening(true);
    } else if (connectionState === ConnectionState.Disconnected) {
      console.log('[VoiceAgent] Disconnected from room');
      setIsListening(false);
    }
  }, [connectionState]);

  /**
   * Toggle microphone mute state
   */
  const toggleMute = async () => {
    if (room && room.localParticipant) {
      const audioTrack = room.localParticipant.getTrackPublication('microphone');
      if (audioTrack) {
        const newMutedState = !isMuted;
        await room.localParticipant.setMicrophoneEnabled(!newMutedState);
        setIsMuted(newMutedState);
        console.log(`[VoiceAgent] Microphone ${newMutedState ? 'muted' : 'unmuted'}`);
      }
    }
  };

  /**
   * Handle disconnect button click
   */
  const handleDisconnect = () => {
    console.log('[VoiceAgent] Disconnecting from room...');
    if (room) {
      room.disconnect();
    }
    if (onDisconnect) {
      onDisconnect();
    }
  };

  /**
   * Get status indicator color based on connection state
   */
  const getStatusColor = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return '#48bb78'; // green
      case ConnectionState.Connecting:
      case ConnectionState.Reconnecting:
        return '#ed8936'; // orange
      case ConnectionState.Disconnected:
        return '#f56565'; // red
      default:
        return '#a0aec0'; // gray
    }
  };

  /**
   * Get status text based on connection state
   */
  const getStatusText = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return 'Connected';
      case ConnectionState.Connecting:
        return 'Connecting...';
      case ConnectionState.Reconnecting:
        return 'Reconnecting...';
      case ConnectionState.Disconnected:
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="voice-agent">
      {/* Status Indicator */}
      <div className="status-bar">
        <div className="status-indicator">
          <div
            className="status-dot"
            style={{ backgroundColor: getStatusColor() }}
          />
          <span className="status-text">{getStatusText()}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="agent-content">
        {connectionState === ConnectionState.Connected ? (
          <>
            {/* Listening Animation */}
            <div className={`listening-animation ${isListening && !isMuted ? 'active' : ''}`}>
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
            </div>

            {/* Instructions */}
            <div className="instructions">
              <h3>{isMuted ? 'Microphone Muted' : 'Listening...'}</h3>
              <p>
                {isMuted
                  ? 'Unmute to start speaking with the agent'
                  : 'Ask me about the weather in any city'}
              </p>
              <p className="example-text">
                Try: "What's the weather in Paris?" or "Tell me the weather in Tokyo"
              </p>
            </div>

            {/* Controls */}
            <div className="controls">
              <button
                className={`control-button ${isMuted ? 'muted' : ''}`}
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  // Muted microphone icon
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                ) : (
                  // Active microphone icon
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>

              <button
                className="control-button disconnect"
                onClick={handleDisconnect}
                title="Disconnect"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="connecting-state">
            <div className="spinner" />
            <p>Connecting to voice agent...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceAgent;
