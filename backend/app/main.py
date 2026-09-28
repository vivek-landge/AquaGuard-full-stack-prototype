from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import pandas as pd
import numpy as np
import json

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data"
df = pd.read_csv(DATA / "demo_telemetry.csv", parse_dates=["timestamp"])
status = json.loads((DATA / "pump_status_summary.json").read_text())
meta = json.loads((DATA / "dataset_meta.json").read_text())

app = FastAPI(title="AquaGuard API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

def row_json(frame):
    out = frame.copy()
    out["timestamp"] = out["timestamp"].dt.strftime("%Y-%m-%dT%H:%M:%S")
    return out.replace({np.nan: None}).to_dict("records")

def diagnostics(frame):
    if frame.empty:
        return {"state":"NO_DATA","confidence":0,"message":"No telemetry available","reasons":[]}
    latest=frame.iloc[-1]
    reasons=[]
    score=0
    if float(latest["anomaly_label"]) > 0:
        score += 45; reasons.append("Dataset anomaly flag is active.")
    if float(latest["pressure"]) < float(frame["pressure"].quantile(.15)):
        score += 20; reasons.append("Pressure is below the recent baseline.")
    if float(latest["pump_current"]) > float(frame["pump_current"].quantile(.85)):
        score += 20; reasons.append("Pump current is above the recent baseline.")
    if float(latest["loss_percentage"]) > 8:
        score += 20; reasons.append("Flow balance indicates elevated unexplained loss.")
    if score >= 55:
        state="INVESTIGATE"
        message="Multiple signals are abnormal; inspect pump and pipeline."
    elif score >= 25:
        state="WATCH"
        message="A deviation is visible; continue monitoring."
    else:
        state="NORMAL"
        message="Signals are within the demo baseline."
    return {"state":state,"confidence":min(score,95),"message":message,"reasons":reasons}

@app.get("/api/health")
def health():
    return {"ok":True,"rows":len(df),"dataset":"SKAB + Pump Sensor Data"}

@app.get("/api/meta")
def get_meta():
    return meta

@app.get("/api/telemetry")
def telemetry(limit:int=Query(120,ge=10,le=1400), scenario:str|None=None):
    frame=df if not scenario else df[df["scenario"]==scenario]
    return {"rows":row_json(frame.tail(limit))}

@app.get("/api/overview")
def overview():
    recent=df.tail(120)
    latest=recent.iloc[-1]
    return {
      "latest": row_json(recent.tail(1))[0],
      "anomaly_count": int(df["anomaly_label"].sum()),
      "anomaly_rate": round(float(df["anomaly_label"].mean()*100),2),
      "avg_flow": round(float(recent["flow_out"].mean()),2),
      "avg_pressure": round(float(recent["pressure"].mean()),2),
      "avg_current": round(float(recent["pump_current"].mean()),2),
      "water_loss": round(float(recent["water_loss"].sum()),2),
      "loss_rate": round(float(recent["loss_percentage"].mean()),2),
      "pump_status": status
    }

@app.get("/api/diagnosis")
def diagnosis():
    return diagnostics(df.tail(120))

@app.get("/api/scenarios")
def scenarios():
    return {"scenarios":df["scenario"].value_counts().to_dict()}

@app.post("/api/telemetry")
def ingest(payload:dict):
    # Hardware-ready endpoint: accepts the same project schema.
    required=["timestamp","flow_out","pressure","pump_current","pump_voltage"]
    missing=[x for x in required if x not in payload]
    if missing:
        return {"accepted":False,"missing":missing}
    return {"accepted":True,"message":"Payload matches the hardware-ready telemetry contract.","payload":payload}
