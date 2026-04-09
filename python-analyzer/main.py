from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 1. Define what data we expect to receive from Node.js
class RequestData(BaseModel):
    ip_address: str
    endpoint: str
    recent_visits: int

# 2. The Analysis Endpoint
@app.post("/analyze")
def analyze_traffic(data: RequestData):
    # Start with a base risk score of 0 (completely safe)
    risk_score = 0.0
    
    # --- RULE 1: Volume ---
    # If they hit the server a few times, slightly increase the score.
    # If they hit it a lot, increase it drastically.
    if data.recent_visits > 3:
        risk_score += 0.3
    if data.recent_visits > 6:
        risk_score += 0.5
        
    # --- RULE 2: High-Risk Endpoints ---
    # Scraping bots target /data. Credential stuffing bots target /login.
    # Let's add extra risk if they are hitting sensitive endpoints repeatedly.
    sensitive_endpoints = ["/api/login", "/api/register", "/api/data"]
    if data.endpoint in sensitive_endpoints and data.recent_visits > 2:
        risk_score += 0.4
        
    # Cap the maximum risk score at 1.0 (100% certainty it's a bot)
    final_score = min(risk_score, 1.0)
    
    print(f" BRAIN Analyzed IP: {data.ip_address} | Visits: {data.recent_visits} | Target: {data.endpoint} | SCORE: {final_score}")
    
    # Send the score back to Node.js
    return {"risk_score": final_score}

# A simple check to make sure the server is alive
@app.get("/")
def read_root():
    return {"status": "Brain is online and analyzing."}