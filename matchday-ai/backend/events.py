import asyncio, json
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from knowledge import build_knowledge_panel, fetch_live_scores

router = APIRouter()

@router.get('/api/events/live')
async def sse_live_data(request: Request):
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            try:
                data = await fetch_live_scores()
                yield f'data: {json.dumps(data)}\n\n'
            except:
                yield 'data: {"error":"fetch_failed"}\n\n'
            await asyncio.sleep(15)
    return StreamingResponse(event_generator(), media_type='text/event-stream')

@router.get('/api/events/panel')
async def sse_full_panel(request: Request):
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            try:
                data = await build_knowledge_panel()
                yield f'data: {json.dumps(data)}\n\n'
            except:
                yield 'data: {"error":"fetch_failed"}\n\n'
            await asyncio.sleep(30)
    return StreamingResponse(event_generator(), media_type='text/event-stream')
