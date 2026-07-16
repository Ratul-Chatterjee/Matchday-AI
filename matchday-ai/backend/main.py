import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from google import genai
from google.cloud import translate_v2 as translate

from database import (
    get_match_config,
    get_language_list,
    get_all_stadiums,
    get_stadium_metadata,
    get_translation,
    store_translation,
)
from chatbot import chat_with_rag
from knowledge import fetch_live_scores, fetch_news, fetch_standings, build_knowledge_panel
from events import router as events_router

app = FastAPI(title="Matchday AI", version="1.0.0")

app.include_router(events_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
MAPS_API_KEY = os.environ.get("MAPS_API_KEY", "")

genai_client = genai.Client(api_key=GEMINI_API_KEY)
translate_client = translate.Client()


class TicketScanRequest(BaseModel):
    raw_text: str


class ChatRequest(BaseModel):
    user_query: str
    stadium_id: str
    seat_context: dict
    match_name: Optional[str] = ""
    language: Optional[str] = "en"


class TranslateRequest(BaseModel):
    text: str
    target_lang: str
    source_lang: Optional[str] = "en"


STADIUM_COORDINATES = {
    "atlanta": {"name": "Mercedes-Benz Stadium", "lat": 33.7554, "lng": -84.4010, "city": "Atlanta", "country": "USA"},
    "boston": {"name": "Gillette Stadium", "lat": 42.0909, "lng": -71.2643, "city": "Boston", "country": "USA"},
    "dallas": {"name": "AT&T Stadium", "lat": 32.7473, "lng": -97.0945, "city": "Dallas", "country": "USA"},
    "houston": {"name": "NRG Stadium", "lat": 29.6847, "lng": -95.4107, "city": "Houston", "country": "USA"},
    "kansas-city": {"name": "Arrowhead Stadium", "lat": 39.0489, "lng": -94.4839, "city": "Kansas City", "country": "USA"},
    "los-angeles": {"name": "SoFi Stadium", "lat": 33.9534, "lng": -118.3391, "city": "Los Angeles", "country": "USA"},
    "miami": {"name": "Hard Rock Stadium", "lat": 25.958, "lng": -80.2389, "city": "Miami", "country": "USA"},
    "new-york": {"name": "MetLife Stadium", "lat": 40.8128, "lng": -74.0742, "city": "New York/New Jersey", "country": "USA"},
    "philadelphia": {"name": "Lincoln Financial Field", "lat": 39.9008, "lng": -75.1675, "city": "Philadelphia", "country": "USA"},
    "san-francisco": {"name": "Levi's Stadium", "lat": 37.4033, "lng": -121.9694, "city": "San Francisco Bay Area", "country": "USA"},
    "seattle": {"name": "Lumen Field", "lat": 47.5952, "lng": -122.3316, "city": "Seattle", "country": "USA"},
    "mexico-city": {"name": "Estadio Azteca", "lat": 19.3029, "lng": -99.1505, "city": "Mexico City", "country": "Mexico"},
    "guadalajara": {"name": "Estadio Akron", "lat": 20.6820, "lng": -103.4625, "city": "Guadalajara", "country": "Mexico"},
    "monterrey": {"name": "Estadio BBVA", "lat": 25.6700, "lng": -100.2444, "city": "Monterrey", "country": "Mexico"},
    "toronto": {"name": "BMO Field", "lat": 43.6332, "lng": -79.4186, "city": "Toronto", "country": "Canada"},
    "vancouver": {"name": "BC Place", "lat": 49.2768, "lng": -123.1107, "city": "Vancouver", "country": "Canada"},
}


@app.get("/api/initialize")
async def initialize():
    config = get_match_config()
    languages = get_language_list()

    if not config:
        config = {
            "match": {
                "home_team": "TBD",
                "away_team": "TBD",
                "date": "2026-06-11",
                "time": "TBD",
                "stage": "Group Stage",
            },
            "stadiums": list(STADIUM_COORDINATES.keys()),
        }

    if not languages:
        languages = [
            {"code": "en", "name": "English"},
            {"code": "es", "name": "Spanish"},
            {"code": "fr", "name": "French"},
            {"code": "de", "name": "German"},
            {"code": "pt", "name": "Portuguese"},
            {"code": "ar", "name": "Arabic"},
            {"code": "zh", "name": "Chinese"},
            {"code": "ja", "name": "Japanese"},
            {"code": "ko", "name": "Korean"},
            {"code": "hi", "name": "Hindi"},
        ]

    stadiums = get_all_stadiums()
    if not stadiums:
        stadiums = []
        for sid, sdata in STADIUM_COORDINATES.items():
            stadiums.append({"id": sid, **sdata})

    return {
        "match": config.get("match", config) if isinstance(config, dict) else config,
        "languages": languages,
        "stadiums": stadiums,
        "maps_api_key": MAPS_API_KEY,
    }


@app.post("/api/parse-ticket")
async def parse_ticket(req: TicketScanRequest):
    if not req.raw_text.strip():
        raise HTTPException(status_code=400, detail="Raw ticket text is empty.")

    schema = {
        "type": "object",
        "properties": {
            "stadium": {"type": "string", "description": "Stadium name or ID"},
            "gate": {"type": "string", "description": "Gate number or letter"},
            "section": {"type": "string", "description": "Section number or letter"},
            "row": {"type": "string", "description": "Row number"},
            "seat": {"type": "string", "description": "Seat number"},
            "match": {"type": "string", "description": "Match description e.g. Team A vs Team B"},
        },
        "required": ["stadium", "gate", "section", "row", "seat", "match"],
    }

    prompt = f"""Parse the following raw ticket scan text into structured fields.
Return ONLY the JSON object matching the schema provided.

RAW TICKET TEXT:
{req.raw_text}"""

    try:
        response = genai_client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema,
                temperature=0.1,
            ),
        )
        import json
        parsed = json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ticket parsing failed: {str(e)}")

    stadium_key = parsed.get("stadium", "").lower().replace(" ", "-").replace("'", "")
    coords = STADIUM_COORDINATES.get(stadium_key, None)

    if not coords:
        for key, val in STADIUM_COORDINATES.items():
            if parsed.get("stadium", "").lower() in val["name"].lower():
                coords = val
                stadium_key = key
                break

    parsed["stadium_id"] = stadium_key
    parsed["coordinates"] = coords

    return parsed


@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not req.user_query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        response = await chat_with_rag(
            user_query=req.user_query,
            stadium_id=req.stadium_id,
            seat_context=req.seat_context,
            match_name=req.match_name or "",
            language=req.language or "en",
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.post("/api/translate")
async def translate_text(req: TranslateRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    cached = get_translation(req.text, req.target_lang)
    if cached:
        return {"translated_text": cached, "source_lang": req.source_lang, "target_lang": req.target_lang}

    try:
        result = translate_client.translate(
            req.text,
            target_language=req.target_lang,
            source_language=req.source_lang if req.source_lang != "auto" else None,
        )
        translated = result["translatedText"]
        store_translation(req.text, req.target_lang, translated)
        return {
            "translated_text": translated,
            "source_lang": result.get("detectedSourceLanguage", req.source_lang),
            "target_lang": req.target_lang,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@app.get("/api/stadiums")
async def list_stadiums():
    stadiums = get_all_stadiums()
    if not stadiums:
        stadiums = [{"id": k, **v} for k, v in STADIUM_COORDINATES.items()]
    return {"stadiums": stadiums}


@app.get("/api/stadiums/{stadium_id}")
async def get_stadium(stadium_id: str):
    meta = get_stadium_metadata(stadium_id)
    if not meta:
        coords = STADIUM_COORDINATES.get(stadium_id)
        if coords:
            meta = {"id": stadium_id, **coords}
        else:
            raise HTTPException(status_code=404, detail=f"Stadium '{stadium_id}' not found.")
    return meta


@app.get("/api/knowledge")
async def get_knowledge():
    panel = await build_knowledge_panel()
    return panel


@app.get("/api/knowledge/scores")
async def get_live_scores():
    scores = await fetch_live_scores()
    return scores


@app.get("/api/knowledge/news")
async def get_news():
    news = await fetch_news()
    return news


@app.get("/api/knowledge/standings")
async def get_standings():
    standings = await fetch_standings()
    return standings


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "matchday-ai"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
