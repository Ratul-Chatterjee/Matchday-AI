import os
from google import genai
from database import (
    get_stadium_metadata,
    query_cache,
    store_chat_cache,
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM_INSTRUCTIONS_TEMPLATE = """You are Matchday AI, a sharp, friendly, and multilingual stadium guide for the FIFA World Cup 2026.

You help fans navigate stadiums, find amenities, understand seat locations, and get real-time match information.

STADIUM GROUND TRUTH (do NOT hallucinate beyond this data):
{stadium_metadata}

SEAT CONTEXT:
- Gate: {gate}
- Section: {section}
- Row: {row}
- Seat: {seat}

MATCH CONTEXT:
- Match: {match_name}

RULES:
1. Only answer based on the stadium metadata provided above.
2. If you don't have data about something, say so honestly.
3. Keep answers concise and helpful — fans are at the stadium and need quick info.
4. Respond in the same language as the user's query unless told otherwise.
5. For navigation, describe directions relative to the user's gate and section.
6. Mention nearby amenities (food, restrooms, merch) relative to their seat.
7. Be enthusiastic but efficient — this is live event support.
"""


def normalize_query(query: str) -> str:
    return " ".join(query.lower().strip().split())


def build_system_prompt(stadium_id: str, seat_context: dict, match_name: str) -> str:
    metadata = get_stadium_metadata(stadium_id)
    if metadata:
        import json
        stadium_text = json.dumps(metadata, indent=2)
    else:
        stadium_text = f"No detailed metadata available for stadium '{stadium_id}' yet. Answer generally based on FIFA World Cup 2026 venue knowledge."

    return SYSTEM_INSTRUCTIONS_TEMPLATE.format(
        stadium_metadata=stadium_text,
        gate=seat_context.get("gate", "Unknown"),
        section=seat_context.get("section", "Unknown"),
        row=seat_context.get("row", "Unknown"),
        seat=seat_context.get("seat", "Unknown"),
        match_name=match_name or "Current Match",
    )


async def chat_with_rag(
    user_query: str,
    stadium_id: str,
    seat_context: dict,
    match_name: str,
    language: str = "en",
) -> str:
    normalized = normalize_query(user_query)

    cached = query_cache(normalized, stadium_id, language)
    if cached:
        return cached

    system_prompt = build_system_prompt(stadium_id, seat_context, match_name)

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=user_query,
        config=genai.types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.4,
            max_output_tokens=1024,
        ),
    )

    result_text = response.text

    store_chat_cache(normalized, stadium_id, language, result_text)

    return result_text
