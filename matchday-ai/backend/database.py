import os
import json
import hashlib
from typing import Any, Optional
from google.cloud import firestore
import redis

REDIS_HOST = os.environ.get("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))
CACHE_TTL = 3600

db = firestore.Client(project="matchday-ai-502517")

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5,
)


def _cache_key(collection: str, doc_id: str) -> str:
    return f"matchday:{collection}:{doc_id}"


def get_document(collection: str, doc_id: str) -> Optional[dict]:
    cache = _cache_key(collection, doc_id)
    try:
        cached = redis_client.get(cache)
        if cached:
            return json.loads(cached)
    except redis.RedisError:
        pass

    doc_ref = db.collection(collection).document(doc_id)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        data["id"] = doc.id
        try:
            redis_client.setex(cache, CACHE_TTL, json.dumps(data))
        except redis.RedisError:
            pass
        return data
    return None


def get_collection(collection: str) -> list[dict]:
    cache = _cache_key(collection, "__all__")
    try:
        cached = redis_client.get(cache)
        if cached:
            return json.loads(cached)
    except redis.RedisError:
        pass

    docs = db.collection(collection).stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)

    try:
        redis_client.setex(cache, CACHE_TTL, json.dumps(results))
    except redis.RedisError:
        pass
    return results


def set_document(collection: str, doc_id: str, data: dict) -> None:
    db.collection(collection).document(doc_id).set(data)
    try:
        redis_client.delete(_cache_key(collection, doc_id))
        redis_client.delete(_cache_key(collection, "__all__"))
    except redis.RedisError:
        pass


def cache_set(key: str, value: Any, ttl: int = CACHE_TTL) -> None:
    try:
        redis_client.setex(key, ttl, json.dumps(value))
    except redis.RedisError:
        pass


def cache_get(key: str) -> Optional[Any]:
    try:
        cached = redis_client.get(key)
        if cached:
            return json.loads(cached)
    except redis.RedisError:
        pass
    return None


def query_cache(normalized_query: str, stadium_id: str, lang: str) -> Optional[str]:
    qhash = hashlib.sha256(f"{stadium_id}:{lang}:{normalized_query}".encode()).hexdigest()
    return cache_get(f"chat:cache:{qhash}")


def store_chat_cache(normalized_query: str, stadium_id: str, lang: str, response: str) -> None:
    qhash = hashlib.sha256(f"{stadium_id}:{lang}:{normalized_query}".encode()).hexdigest()
    cache_set(f"chat:cache:{qhash}", response, ttl=86400)


def get_stadium_metadata(stadium_id: str) -> Optional[dict]:
    return get_document("stadiums", stadium_id)


def get_all_stadiums() -> list[dict]:
    return get_collection("stadiums")


def get_translation(text: str, target_lang: str) -> Optional[str]:
    key = f"translate:{target_lang}:{hashlib.sha256(text.encode()).hexdigest()}"
    return cache_get(key)


def store_translation(text: str, target_lang: str, translated: str) -> None:
    key = f"translate:{target_lang}:{hashlib.sha256(text.encode()).hexdigest()}"
    cache_set(key, translated, ttl=86400)


def get_match_config() -> Optional[dict]:
    return get_document("config", "matchday")


def get_language_list() -> list[dict]:
    return get_collection("languages")
