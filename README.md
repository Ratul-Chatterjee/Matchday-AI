# Matchday AI — FIFA World Cup 2026 Stadium Companion

> Your AI-powered guide to every stadium, every match, every moment.

**Live Demo:** [matchday-ai-21525.web.app](https://matchday-ai-21525.web.app)

| 16 Stadiums | 48 Teams | 104 Matches | 3 Countries |
|:-----------:|:--------:|:-----------:|:-----------:|
| | | | |

Matchday AI is a mobile-first, AI-powered web application built for fans attending the 2026 FIFA World Cup. It combines smart ticket scanning, real-time stadium navigation, an AI chatbot, live match data, and multi-language voice translation — all in a single app with no account required.

---

## UI Overview

### Landing Page
The app opens with a FIFA World Cup 2026 branded landing page featuring a hero image slider of stadium atmospheres, a feature showcase grid, tournament statistics (16 stadiums, 48 teams, 104 matches, 3 host countries), and a carousel of host city highlights. The design uses a deep navy-to-blue gradient with gold accents, animated glowing cards, and smooth scroll transitions.

### 5-Tab App Layout
Once inside, fans navigate between five core tabs:

| Tab | Icon | Purpose |
|-----|------|---------|
| **Ticket** | Ticket | Scan or paste ticket data, extract seat info via AI |
| **Map** | MapPin | Interactive stadium map with gate markers and route guidance |
| **Chat** | Chat | AI stadium assistant for amenities, food, directions |
| **Live** | Chart | Scores, group standings, knockout brackets |
| **Voice** | Globe | Real-time voice and text translation in 12 languages |

---

## Features

### 1. Smart Ticket Scanner
Scan your ticket's QR code directly from your phone camera, or paste raw ticket text. Gemini 1.5 Flash parses the input using structured schema mode and instantly extracts your stadium, gate, section, row, and seat — no manual entry needed. The parsed data flows directly into the map for turn-by-turn navigation to your seat.

- **Camera mode:** Real-time QR code scanning via `jsQR`
- **Manual mode:** Paste any ticket text (email, PDF copy, screenshot OCR)
- **AI extraction:** Gemini schema mode returns structured `{stadium, gate, section, row, seat}` JSON

### 2. Interactive Stadium Map
Leaflet-powered OpenStreetMap view centered on your selected stadium. The map displays gate markers, section polygons, amenities (restrooms, food stalls, ATMs, first aid), and a computed route from your entry gate to your seat. Each of the 16 stadiums has pre-loaded metadata including gate layouts, capacity, and amenity locations.

- **16 stadiums** with GPS coordinates, gate lists, and amenity data
- **Gate markers** with color-coded entry points
- **Route guidance** from gate to seat with walking path overlay
- **Amenity overlay** showing restrooms, food, ATMs, and first aid stations

### 3. AI Stadium Assistant (RAG Chatbot)
Ask anything about your stadium or the match — "Where's the nearest restroom?", "What food options are near Gate B?", "What time does the match start?". The chatbot uses Retrieval-Augmented Generation (Gemini 1.5 Flash) with stadium-specific metadata grounded into each query. Frequently asked questions are cached via Redis for instant responses.

- **RAG pipeline:** Stadium metadata + match context injected into Gemini prompts
- **Semantic caching:** Redis-based query cache reduces latency for repeated questions
- **Context-aware:** Responses reference your specific stadium, section, and match

### 4. Live Match Center
Track the entire tournament from a single tab. View real-time scores for the current match, browse all 12 group standings (Groups A–L) with points and goal difference, and follow the full knockout bracket from Round of 32 through to the Final. Data is refreshed via the backend's Firestore-backed match feed.

- **Live scores** for the active match
- **Group standings** — 12 groups of 4 teams each (48 teams total)
- **Knockout bracket** — Round of 32 → Round of 16 → Quarter-Finals → Semi-Finals → Final
- **Match schedule** with dates, times, and venues

### 5. Multi-Language Voice Translator
Break language barriers in real-time. Speak in your language, and the app transcribes your speech, translates it via Google Cloud Translation API, and reads the translation aloud in the target language. Supports 12 languages covering all FIFA World Cup 2026 participating nations.

| | | | |
|:---:|:---:|:---:|:---:|
| English | Spanish | French | German |
| Portuguese | Arabic | Chinese | Japanese |
| Korean | Hindi | Italian | Russian |

- **Speech-to-text** via Web Speech API
- **Translation** via Google Cloud Translation API
- **Text-to-speech** output in target language
- **12 languages** supported

---

## Architecture

```
Frontend (React + Vite + Tailwind CSS)
  └── Static hosting (Firebase / Nginx)
        │
Backend (FastAPI + Uvicorn)
  ├── Google Cloud Firestore (Native Mode) — persistent stadium & match data
  ├── Google Cloud Memorystore (Redis) — semantic query caching
  ├── Google GenAI (Gemini 1.5 Flash) — ticket parsing + RAG chatbot
  └── Google Cloud Translation API — live UI / speech translation
```

**Frontend → Backend communication:** REST API over HTTPS. The frontend sends parsed ticket data, chat queries, and translation requests. The backend returns structured JSON responses.

**Data flow for ticket scanning:**
1. User scans QR code or pastes ticket text
2. Frontend sends raw text to `POST /api/parse-ticket`
3. Backend forwards to Gemini 1.5 Flash with structured schema
4. Gemini returns `{stadium, gate, section, row, seat}`
5. Frontend populates the map with the parsed location

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3 |
| Backend | Python 3.12, FastAPI, Uvicorn |
| Database | Firestore Native (primary) + Redis (cache) |
| AI | Gemini 1.5 Flash (schema mode + RAG) |
| Translation | Google Cloud Translation API |
| Maps | Leaflet + OpenStreetMap |
| QR Scanner | jsQR (client-side barcode decoding) |
| Voice | Web Speech API (browser-native STT/TTS) |
| Infra | Cloud Run, VPC, Serverless VPC Access Connector |
| Hosting | Firebase Hosting (static frontend) |

---

## Project Structure

```
Matchday-AI/
├── backend/
│   ├── main.py              # FastAPI server with all API endpoints
│   ├── database.py          # Firestore + Redis abstraction layer
│   ├── chatbot.py           # Gemini RAG chatbot with semantic caching
│   ├── knowledge.py         # Stadium metadata and knowledge base
│   ├── events.py            # Match event data and scheduling
│   ├── seed_firestore.py    # Database seeding script
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Root app with React Router & tab navigation
│   │   ├── main.tsx             # Entry point
│   │   ├── index.css            # Global styles & Tailwind directives
│   │   ├── components/
│   │   │   ├── LandingPage.tsx  # FIFA 2026 branded landing page
│   │   │   ├── DesktopBanner.tsx# Desktop detection & redirect banner
│   │   │   ├── TicketScanner.tsx# QR scanner + manual ticket input
│   │   │   ├── MapLayout.tsx    # Leaflet stadium map with routing
│   │   │   ├── Chatbot.tsx      # AI stadium assistant UI
│   │   │   ├── KnowledgePanel.tsx# Live scores, standings, brackets
│   │   │   ├── SpeechTranslator.tsx # Voice & text translation
│   │   │   ├── Icons.tsx        # 35+ custom SVG icon components
│   │   │   └── ErrorBoundary.tsx# Error fallback UI
│   │   ├── data/
│   │   │   └── matchData.ts     # Stadiums, standings, bracket data
│   │   ├── i18n/
│   │   │   ├── translations.ts  # 12-language translation keys
│   │   │   └── useTranslation.ts# Translation hook
│   │   └── utils/
│   │       ├── groqClient.ts    # Groq API client (env-configured)
│   │       └── localStorage.ts  # Browser storage helpers
│   ├── public/
│   │   ├── logo.svg             # App favicon (soccer ball)
│   │   ├── manifest.json        # PWA manifest
│   │   └── sw.js               # Service worker for offline support
│   ├── .env.example             # API key template
│   ├── firebase.json            # Firebase hosting config
│   ├── index.html               # HTML entry point
│   ├── package.json             # NPM dependencies
│   ├── tailwind.config.js       # FIFA theme colors & animations
│   ├── vite.config.ts           # Vite build configuration
│   └── tsconfig.json            # TypeScript config
├── Dockerfile                   # Multi-stage production build
├── cloudbuild.yaml              # Google Cloud Build config
├── deploy.sh                    # Full GCP deployment script
├── .gitignore                   # Git ignore rules
└── README.md
```

---

## Host Cities & Stadiums

The 2026 FIFA World Cup spans **16 stadiums** across **3 countries**:

### United States (11 stadiums)
| City | Stadium | Capacity |
|------|---------|----------|
| New York/New Jersey | MetLife Stadium | 82,500 |
| Los Angeles | SoFi Stadium | 70,240 |
| Dallas | AT&T Stadium | 80,000 |
| Miami | Hard Rock Stadium | 65,326 |
| San Francisco Bay Area | Levi's Stadium | 71,500 |
| Seattle | Lumen Field | 68,740 |
| Atlanta | Mercedes-Benz Stadium | 71,000 |
| Houston | NRG Stadium | 72,220 |
| Philadelphia | Lincoln Financial Field | 69,176 |
| Kansas City | Arrowhead Stadium | 76,416 |
| Boston | Gillette Stadium | 65,878 |

### Mexico (3 stadiums)
| City | Stadium | Capacity |
|------|---------|----------|
| Mexico City | Estadio Azteca | 87,000 |
| Guadalajara | Estadio Akron | 49,850 |
| Monterrey | Estadio BBVA | 53,500 |

### Canada (2 stadiums)
| City | Stadium | Capacity |
|------|---------|----------|
| Toronto | BMO Field | 45,500 |
| Vancouver | BC Place | 54,500 |

---

## Features at a Glance

| Feature | Description | Tech |
|---------|-------------|------|
| Ticket Scanner | QR code camera + text paste → AI seat extraction | jsQR, Gemini 1.5 Flash |
| Stadium Map | Interactive map with gate markers & seat routing | Leaflet, OpenStreetMap |
| AI Chatbot | Stadium-aware assistant with RAG & semantic caching | Gemini 1.5 Flash, Redis |
| Live Center | Scores, 12 group standings, knockout brackets | Firestore, React |
| Voice Translator | Speech → translate → speak in 12 languages | Web Speech API, Google Translation |
| Landing Page | FIFA 2026 branded hero, features, host cities | React, Tailwind CSS |
| PWA Ready | Service worker for offline caching | Workbox |
| Mobile-First | Optimized for phone use in-stadium | Tailwind CSS, responsive |
| Privacy-First | All data in localStorage, no auth required | Browser Storage API |
| Multi-Language | 12 languages with full UI translation | i18n system |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/initialize` | Return match config, stadiums, languages, maps key |
| POST | `/api/parse-ticket` | Parse raw ticket text via Gemini schema mode |
| POST | `/api/chat` | RAG chatbot query with stadium context |
| POST | `/api/translate` | Translate text via Cloud Translation API |
| GET | `/api/stadiums` | List all 16 host stadiums |
| GET | `/api/stadiums/{id}` | Get single stadium metadata |
| GET | `/api/health` | Health check |
