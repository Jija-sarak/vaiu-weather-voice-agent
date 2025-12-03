# Voice Weather Assistant 🌤️

A real-time voice-enabled weather assistant built with LiveKit Agents Framework, OpenAI, and React. Users can speak naturally to ask about weather conditions in any city worldwide, and receive spoken responses with up-to-date weather information.

## 🎯 Features

- **Natural Voice Interaction**: Speak naturally to the agent using your microphone
- **Real-time Weather Data**: Fetches current weather from OpenWeatherMap API
- **Intelligent Function Calling**: Uses OpenAI's GPT-4 with function calling to extract city names and respond appropriately
- **Voice Synthesis**: Natural-sounding speech responses using OpenAI's TTS
- **Error Handling**: Gracefully handles invalid cities, network issues, and unclear speech
- **Modern Web Interface**: Clean, responsive React frontend with visual feedback
- **Production Ready**: Comprehensive error handling and logging throughout

## 🏗️ Architecture

### Backend (Node.js + LiveKit Agents)
```
src/
├── agent/
│   └── index.js          # Main agent logic with STT/LLM/TTS pipeline
├── server/
│   └── index.js          # Token generation server for frontend
└── utils/
    └── weather.js        # Weather API integration
```

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/
│   │   ├── VoiceAgent.jsx      # Voice interaction UI
│   │   └── VoiceAgent.css
│   ├── App.jsx                 # Main app component
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
└── vite.config.js
```

## 🛠️ Tech Stack

- **Voice Processing**: LiveKit Agents Framework
- **Speech-to-Text**: OpenAI Whisper
- **Language Model**: OpenAI GPT-4 with function calling
- **Text-to-Speech**: OpenAI TTS (Alloy voice)
- **Weather API**: OpenWeatherMap
- **Frontend**: React 18 + Vite
- **UI Components**: LiveKit React Components
- **Server**: Express.js

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **OpenAI API Key** - [Get it here](https://platform.openai.com/api-keys)
4. **LiveKit Account** - [Sign up here](https://cloud.livekit.io/)
5. **OpenWeatherMap API Key** - [Get it here](https://openweathermap.org/api)

## 🚀 Setup Instructions

### Step 1: Clone and Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# LiveKit Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Weather API Configuration
OPENWEATHER_API_KEY=your_openweather_api_key

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Step 3: Get Your API Keys

#### LiveKit Setup
1. Go to [LiveKit Cloud](https://cloud.livekit.io/)
2. Create a new project or select an existing one
3. Navigate to **Settings** → **Keys**
4. Copy your **URL**, **API Key**, and **API Secret**

#### OpenAI Setup
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

#### OpenWeatherMap Setup
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Generate and copy your API key

## 🎮 Running the Application

### Option 1: Run Everything Together

```bash
# Terminal 1: Start the backend agent
npm start

# Terminal 2: Start the token server
node src/server/index.js

# Terminal 3: Start the frontend
cd frontend
npm run dev
```

### Option 2: Development Mode

```bash
# Terminal 1: Backend with auto-reload
npm run dev

# Terminal 2: Token server
node src/server/index.js

# Terminal 3: Frontend dev server
npm run frontend
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Token Server**: http://localhost:3000
- **Agent**: Running in background, connected to LiveKit

## 🎤 How to Use

1. **Open the Frontend**: Navigate to http://localhost:5173 in your browser

2. **Connect**: Click the "Connect to Agent" button

3. **Allow Microphone**: Grant microphone permissions when prompted

4. **Start Speaking**: Once connected, simply speak your question naturally:
   - "What's the weather in London?"
   - "Tell me the weather in Tokyo"
   - "How's the weather in Paris, France?"
   - "What's the temperature in New York?"

5. **Listen**: The agent will process your request and respond with voice

6. **Controls**:
   - Click the microphone icon to mute/unmute
   - Click the X button to disconnect

## 🔧 How It Works

### Voice Pipeline

```
User Speech → STT (Whisper) → LLM (GPT-4) → Function Call → Weather API
                                    ↓
                            TTS (OpenAI) ← Response Text
```

### Function Calling Flow

1. **User speaks**: "What's the weather in Paris?"

2. **Speech-to-Text**: OpenAI Whisper transcribes the audio

3. **LLM Processing**: GPT-4 analyzes the request and decides to call `get_weather`

4. **Function Execution**:
   ```javascript
   get_weather({ location: "Paris" })
   ```

5. **Weather Fetch**: Agent calls OpenWeatherMap API

6. **Response Generation**: Weather data is formatted into natural language

7. **Text-to-Speech**: OpenAI TTS converts response to speech

8. **Audio Playback**: User hears the response through their speakers

### Weather Tool Definition

The agent exposes a `get_weather` function to the LLM:

```javascript
{
  name: 'get_weather',
  description: 'Get current weather for a specific city',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'City name or location'
      }
    },
    required: ['location']
  }
}
```

When the LLM detects a weather query, it automatically calls this function with the extracted city name.

## 🛡️ Error Handling

The application handles various error scenarios:

### City Not Found
```
User: "What's the weather in Atlantis?"
Agent: "I couldn't find weather information for Atlantis. Could you please check the city name and try again?"
```

### Network Failures
- **API Timeout**: "The weather service is taking too long to respond. Please try again in a moment."
- **Connection Lost**: Automatic reconnection with visual feedback

### Invalid API Keys
- Clear error messages indicating configuration issues
- Prevents application from starting with missing credentials

### Unclear Speech
- Agent asks for clarification when speech is unintelligible
- Prompts user to speak more clearly

## 📁 Project Structure Details

### Backend Components

#### `src/agent/index.js`
Main agent implementation with:
- LiveKit room connection handling
- Multimodal agent setup (audio + text)
- Function calling configuration
- Error handling for all agent operations

#### `src/utils/weather.js`
Weather utility module featuring:
- OpenWeatherMap API integration
- Comprehensive error handling
- Request timeout management
- Response formatting

#### `src/server/index.js`
Token generation server:
- Secure JWT token creation
- CORS configuration
- Health check endpoint
- Connection management

### Frontend Components

#### `App.jsx`
Main application component:
- LiveKit connection management
- Token fetching logic
- Connection state handling

#### `VoiceAgent.jsx`
Voice interaction interface:
- Real-time connection status
- Microphone controls
- Visual feedback with animations
- Disconnect handling

## 🧪 Testing

### Test the Backend Independently

```bash
# Start the agent
npm start

# In another terminal, test the weather API
node -e "import('./src/utils/weather.js').then(m => m.getWeather('London').then(console.log))"
```

### Test the Token Server

```bash
# Start the server
node src/server/index.js

# Test token generation
curl -X POST http://localhost:3000/token \
  -H "Content-Type: application/json" \
  -d '{"roomName": "test-room"}'
```

### Test with Voice

1. Open the frontend
2. Connect to the agent
3. Try these test phrases:
   - "What's the weather in London?"
   - "Tell me about the weather in xyz123" (invalid city)
   - "How's the temperature?"
   - "Weather in Paris, France"

## 🐛 Troubleshooting

### "Failed to connect" Error
- Ensure all environment variables are set correctly
- Verify LiveKit credentials are valid
- Check that token server is running on port 3000

### "Microphone not working"
- Grant microphone permissions in browser
- Check browser console for permission errors
- Try a different browser (Chrome/Edge recommended)

### "Weather API error"
- Verify OpenWeatherMap API key is valid
- Check API key activation (may take a few minutes after creation)
- Ensure you haven't exceeded free tier limits

### "Agent not responding"
- Check OpenAI API key is valid
- Verify you have sufficient OpenAI credits
- Check backend console for error messages

### Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install
```

## 🔐 Security Notes

- **Never commit `.env` file** - Contains sensitive API keys
- **Token server** should be behind authentication in production
- **API keys** are only used server-side, never exposed to client
- **CORS** is configured for development; restrict origins in production

## 📦 Deployment

### Backend Deployment

The agent can be deployed to any Node.js hosting platform:

1. Set environment variables on your hosting platform
2. Deploy the backend code
3. Ensure the agent process stays running (use PM2 or similar)

### Frontend Deployment

Build and deploy the React frontend:

```bash
cd frontend
npm run build
# Deploy the 'dist' folder to any static hosting (Vercel, Netlify, etc.)
```

Update `TOKEN_SERVER_URL` in `App.jsx` to point to your deployed backend.

## 🤝 Contributing

This project was created for the Vaiu AI Software Developer Internship Assignment.

## 📄 License

MIT

## 🙏 Acknowledgments

- [LiveKit](https://livekit.io/) - Real-time communication platform
- [OpenAI](https://openai.com/) - AI models for STT, LLM, and TTS
- [OpenWeatherMap](https://openweathermap.org/) - Weather data API

---

**Built with ❤️ for Vaiu AI Internship**

For questions or issues, please refer to the troubleshooting section or check the inline code comments.