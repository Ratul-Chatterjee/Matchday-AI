# Matchday AI — FIFA World Cup 2026 Stadium Companion

Serverless, mobile-first web app for optimizing the fan experience during the 2026 FIFA World Cup across 16 host stadiums in USA, Mexico, and Canada.

## Architecture

```
Frontend (React + Vite + Tailwind)
  └── Nginx (static serving)
        │
Backend (FastAPI + Uvicorn)
  ├── Google Cloud Firestore (Native Mode) — persistent stadium data
  ├── Google Cloud Memorystore (Redis) — caching layer
  ├── Google GenAI (Gemini 1.5 Flash) — ticket parsing + RAG chatbot
  └── Google Cloud Translation API — live UI / speech translation
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3 |
| Backend | Python 3.12, FastAPI, Uvicorn |
| Database | Firestore Native (primary) + Redis cache |
| AI | Gemini 1.5 Flash (schema mode + RAG) |
| Translation | Google Cloud Translation API |
| Maps | Google Maps JavaScript API |
| Infra | Cloud Run, VPC, Serverless VPC Access Connector |

## Project Structure

```
matchday-ai/
├── backend/
│   ├── main.py          # FastAPI server with all endpoints
│   ├── database.py      # Firestore + Redis abstraction layer
│   ├── chatbot.py       # Gemini RAG chatbot logic
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Root app with tab navigation
│   │   ├── components/       # 6 UI components
│   │   └── utils/            # localStorage helpers
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.js
├── Dockerfile          # Multi-stage production build
├── deploy.sh           # Full GCP deployment script
└── README.md
```

## Features

1. **Ticket Scanner** — Scan barcode/QRT text via camera or paste raw ticket text; Gemini extracts structured seat data
2. **Interactive Stadium Map** — Google Maps satellite view with gate/section markers and route guidance
3. **Live Knowledge Panel** — Real-time scores, standings, match schedule (via Gemini RAG)
4. **RAG Chatbot** — Stadium-aware AI assistant with grounded metadata and semantic query caching
5. **Voice Translator** — Speech-to-text → Cloud Translation → text-to-speech in 10+ languages
6. **Privacy-First** — All user data (ticket, language, chat) stored in browser localStorage — no auth required

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/initialize` | Return match config, stadiums, languages, maps key |
| POST | `/api/parse-ticket` | Parse raw ticket text via Gemini schema mode |
| POST | `/api/chat` | RAG chatbot query with stadium context |
| POST | `/api/translate` | Translate text via Cloud Translation API |
| GET | `/api/stadiums` | List all 16 host stadiums |
| GET | `/api/stadiums/{id}` | Get single stadium metadata |
| GET | `/api/health` | Health check |
