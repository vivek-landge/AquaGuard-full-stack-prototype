# AquaGuard — IoT Underground Water Management

A full-stack prototype built from the uploaded SKAB and Pump Sensor datasets.

## Stack
- Frontend: React + Vite + Recharts
- Backend: FastAPI + Pandas
- Database-ready: Supabase/Postgres schema included
- Hardware boundary: `POST /api/telemetry`

## Dataset handling
- SKAB is parsed from semicolon-separated files and used for flow/pressure/current anomaly behavior.
- Pump Sensor Data is used for machine-status distribution. `sensor_00`–`sensor_51` are deliberately not assigned physical meanings.
- Demo-only water-level/rainfall/tank/inflow fields are explicitly marked as derived/proxy fields. Replace them with real ESP32 measurements.

## Run
Terminal 1:
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Terminal 2:
```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Hardware later
Send JSON to `POST http://localhost:8000/api/telemetry` using the schema shown in the Hardware Bridge screen.
