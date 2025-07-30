from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import json

app = FastAPI()

API_KEY = 'some secret key' # from .env file

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('healthcheck')
async def healthcheck():
    return {"message": "pong"}

@app.post('/api/receive-categories/')
async def receive_categories(payload:Request, Authorization: str = API_KEY):
    if Authorization != API_KEY:
        raise HTTPException(status_code=401, detail={'message': 'You are not allowed to do this.'})
    raw_body = await payload.body()
    json_body = json.loads(raw_body)
    print(json.dumps(json_body, ensure_ascii=False, indent=4))
    return {"message": "success"}

@app.post('/api/receive-items/')
async def receive_items(payload:Request, Authorization: str = API_KEY):
    if Authorization != API_KEY:
        raise HTTPException(status_code=401, detail={'message': 'You are not allowed to do this.'})
    raw_body = await payload.body()
    json_body = json.loads(raw_body)
    print(json.dumps(json_body, ensure_ascii=False, indent=4))
    return {"message": "success"}