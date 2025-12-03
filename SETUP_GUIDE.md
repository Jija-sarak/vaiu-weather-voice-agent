# Quick Setup Guide

## Complete Project Structure

```
vaiu-weather-voice-agent/
├── src/                          # Backend source code
│   ├── agent/
│   │   └── index.js             # Main voice agent (STT/LLM/TTS)
│   ├── server/
│   │   └── index.js             # Token generation server
│   └── utils/
│       └── weather.js           # Weather API integration
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceAgent.jsx   # Voice UI component
│   │   │   └── VoiceAgent.css
│   │   ├── App.jsx              # Main app
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json                  # Backend dependencies
├── .env.example                  # Environment template
└── README.md                     # Full documentation

```

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 2. Configure API Keys

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your keys:
# - LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET (from livekit.io)
# - OPENAI_API_KEY (from platform.openai.com)
# - OPENWEATHER_API_KEY (from openweathermap.org)
```

### 3. Run the Application

Open 3 terminals:

```bash
# Terminal 1: Backend Agent
npm start

# Terminal 2: Token Server
node src/server/index.js

# Terminal 3: Frontend
cd frontend && npm run dev
```

### 4. Test It

1. Open http://localhost:5173
2. Click "Connect to Agent"
3. Allow microphone access
4. Say: "What's the weather in London?"

## ✅ What's Included

### Backend Features
- ✅ LiveKit Agents Framework integration
- ✅ OpenAI Whisper for Speech-to-Text
- ✅ GPT-4 with function calling
- ✅ OpenAI TTS for natural voice responses
- ✅ OpenWeatherMap API integration
- ✅ Comprehensive error handling
- ✅ Detailed logging throughout
- ✅ Token generation server

### Frontend Features
- ✅ React 18 + Vite
- ✅ LiveKit React Components
- ✅ Real-time connection status
- ✅ Microphone controls (mute/unmute)
- ✅ Visual listening animations
- ✅ Responsive design
- ✅ Error handling with user feedback

### Code Quality
- ✅ **All files include detailed comments** explaining:
  - Function purposes
  - Error handling strategies
  - API integration details
  - Component functionality
- ✅ Clean architecture with separation of concerns
- ✅ Production-ready error handling
- ✅ Modern ES6+ JavaScript

## 📝 Key Implementation Details

### Function Calling Mechanism

The agent uses OpenAI's function calling to detect weather queries:

```javascript
// Tool definition exposed to LLM
const weatherTool = {
  name: 'get_weather',
  description: 'Get current weather for a specific city',
  parameters: {
    type: 'object',
    properties: {
      location: { type: 'string' }
    }
  }
};

// Handler called by LLM when weather is requested
async function handleWeatherTool(args) {
  const weatherData = await getWeather(args.location);
  return formatWeatherResponse(weatherData);
}
```

### Voice Pipeline

```
User Speech
  → OpenAI Whisper (STT)
  → GPT-4 (LLM + Function Calling)
  → Weather API
  → Response Formatting
  → OpenAI TTS
  → User Hears Response
```

### Error Handling Strategy

1. **City Not Found**: User-friendly message suggesting to check spelling
2. **API Timeout**: 10-second timeout with retry suggestion
3. **Invalid API Keys**: Clear configuration error messages
4. **Network Failures**: Graceful degradation with error reporting

## 🧪 Testing Examples

Try these phrases:
- "What's the weather in London?"
- "Tell me about the weather in Tokyo"
- "How's the temperature in Paris?"
- "Weather in New York City"
- "What's the weather like in xyz123?" (tests error handling)

## 📚 Full Documentation

See `README.md` for:
- Complete architecture overview
- Detailed setup instructions
- Troubleshooting guide
- Deployment instructions
- API integration details

## 🎯 Assignment Requirements Met

✅ **Voice Input/Output**: LiveKit Agents with STT + TTS
✅ **Weather Function**: `getWeather(location)` with OpenWeatherMap
✅ **City Extraction**: GPT-4 function calling extracts city names
✅ **Natural Voice Response**: OpenAI TTS with conversational formatting
✅ **Error Handling**: Comprehensive handling for all failure modes
✅ **Full Code**: Backend + Frontend complete and functional
✅ **Comments**: Every major function and logic block documented
✅ **README**: Professional documentation with setup guide
✅ **.env.example**: Complete environment template
✅ **Clean Code**: Modern JavaScript with best practices

## 🔑 Required API Keys

1. **LiveKit** (Free): https://cloud.livekit.io/
2. **OpenAI** (Paid): https://platform.openai.com/api-keys
3. **OpenWeatherMap** (Free tier available): https://openweathermap.org/api

## 💡 Tips

- Use Chrome/Edge for best WebRTC support
- Speak clearly and mention the city name
- Check console logs for detailed debugging info
- All API keys must be valid before starting

---

**Project Status**: ✅ Complete and Production-Ready

For detailed information, see `README.md`
