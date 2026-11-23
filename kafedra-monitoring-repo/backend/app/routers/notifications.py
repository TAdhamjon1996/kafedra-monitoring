import asyncio
import json
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
from app.core.security import get_current_user_payload

router = APIRouter(prefix="/notifications", tags=["Bildirishnomalar"])

# In-memory subscriber queues
subscribers = []

@router.get("/stream")
async def notifications_stream(request: Request, payload: dict = Depends(get_current_user_payload)):
    """Server-Sent Events (SSE) orqali real vaqt bildirishnomalari"""
    queue = asyncio.Queue()
    subscribers.append(queue)

    async def event_generator():
        try:
            # Send initial connected message
            initial_msg = {
                "event": "connected",
                "message": "Real-vaqt bildirishnomalari tizimiga ulandingiz.",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            yield f"data: {json.dumps(initial_msg)}\n\n"

            while True:
                # Disconnection check
                if await request.is_disconnected():
                    break

                try:
                    # Wait for message with timeout for heartbeat ping
                    msg = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {json.dumps(msg)}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat ping
                    yield f": ping\n\n"
        finally:
            if queue in subscribers:
                subscribers.remove(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

async def broadcast_notification(event_type: str, message: str, data: dict = None):
    msg = {
        "event": event_type,
        "message": message,
        "data": data or {},
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    for q in subscribers:
        await q.put(msg)
