# AquaGuard backend

FastAPI service for the prototype. The `/api/telemetry` POST endpoint is the hardware boundary: ESP32 can later send the same JSON contract.

Run:
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
