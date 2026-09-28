import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  Droplets,
  Gauge,
  Radio,
  ShieldCheck,
  Zap,
  RefreshCw,
} from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const fmt = (n, d = 1) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: d });
function Card({ icon: Icon, label, value, sub, tone = "" }) {
  return (
    <div className="card metric">
      <div className={"icon " + tone}>
        <Icon size={19} />
      </div>
      <div>
        <div className="muted">{label}</div>
        <div className="metricValue">{value}</div>
        <div className="muted small">{sub}</div>
      </div>
    </div>
  );
}
function App() {
  const [overview, setOverview] = useState(null),
    [rows, setRows] = useState([]),
    [diag, setDiag] = useState(null),
    [tab, setTab] = useState("overview"),
    [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    const [o, t, d] = await Promise.all([
      fetch(API + "/api/overview").then((r) => r.json()),
      fetch(API + "/api/telemetry?limit=120").then((r) => r.json()),
      fetch(API + "/api/diagnosis").then((r) => r.json()),
    ]);
    setOverview(o);
    setRows(t.rows);
    setDiag(d);
    setLoading(false);
  }
  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);
  const chart = useMemo(
    () =>
      rows.map((r, i) => ({
        ...r,
        time: new Date(r.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    [rows],
  );
  if (loading && !overview)
    return (
      <div className="splash">
        <div className="orb">💧</div>
        <h1>AquaGuard</h1>
        <p>Loading telemetry intelligence…</p>
      </div>
    );
  const latest = overview?.latest || {};
  return (
    <div className="app">
      <aside>
        <div className="brand">
          <div className="brandMark">💧</div>
          <div>
            <b>AquaGuard</b>
            <span>Underground Water OS</span>
          </div>
        </div>
        <nav>
          {[
            ["overview", "Overview"],
            ["anomalies", "Anomaly Radar"],
            ["water", "Water Budget"],
            ["hardware", "Hardware Bridge"],
          ].map(([id, n]) => (
            <button
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
              key={id}
            >
              {n}
            </button>
          ))}
        </nav>
        <div className="sideBottom">
          <div className="live">
            <span></span> Demo telemetry live
          </div>
          <div className="muted small">SKAB + pump sensor data</div>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <div className="eyebrow">
              IoT-BASED UNDERGROUND WATER MANAGEMENT
            </div>
            <h1>
              {tab === "overview"
                ? "Water intelligence at a glance"
                : tab === "anomalies"
                  ? "Anomaly radar"
                  : tab === "water"
                    ? "Water budget"
                    : "Hardware bridge"}
            </h1>
            <p className="muted">
              Prototype software layer — ready for ESP32 telemetry.
            </p>
          </div>
          <button className="refresh" onClick={load}>
            <RefreshCw size={16} /> Refresh
          </button>
        </header>
        {tab === "overview" && (
          <>
            <div className="grid metrics">
              <Card
                icon={Droplets}
                label="Flow out"
                value={fmt(latest.flow_out, 1) + " L/min"}
                sub="SKAB volume-flow proxy"
                tone="blue"
              />
              <Card
                icon={Gauge}
                label="Pressure"
                value={fmt(latest.pressure, 2)}
                sub="dataset units"
                tone="violet"
              />
              <Card
                icon={Zap}
                label="Pump current"
                value={fmt(latest.pump_current, 2) + " A"}
                sub="motor current signal"
                tone="amber"
              />
              <Card
                icon={Activity}
                label="Anomaly rate"
                value={fmt(overview.anomaly_rate, 1) + "%"}
                sub={overview.anomaly_count + " flagged rows"}
                tone="red"
              />
            </div>
            <div className="grid two">
              <section className="card chartCard">
                <div className="sectionHead">
                  <div>
                    <b>Flow & pressure</b>
                    <span className="muted">Recent telemetry window</span>
                  </div>
                  <span className="pill">LIVE</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" minTickGap={35} />
                    <YAxis yAxisId="l" />
                    <YAxis yAxisId="r" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="l"
                      type="monotone"
                      dataKey="flow_out"
                      strokeWidth={2.5}
                      dot={false}
                      name="Flow"
                    />
                    <Line
                      yAxisId="r"
                      type="monotone"
                      dataKey="pressure"
                      strokeWidth={2}
                      dot={false}
                      name="Pressure"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </section>
              <section className="card diagnosis">
                <div className="sectionHead">
                  <div>
                    <b>AI-style diagnostic engine</b>
                    <span className="muted">
                      Rule fusion over recent signals
                    </span>
                  </div>
                  <span
                    className={
                      "status " + (diag?.state === "NORMAL" ? "good" : "warn")
                    }
                  >
                    {diag?.state}
                  </span>
                </div>
                <div className="diagnosisMain">
                  <div className="score">
                    {diag?.confidence || 0}
                    <small>/100</small>
                  </div>
                  <div>
                    <h2>{diag?.message}</h2>
                    <p className="muted">
                      Confidence is a prototype signal score, not a certified
                      prediction.
                    </p>
                  </div>
                </div>
                <ul>
                  {(diag?.reasons || ["No abnormal signals."]).map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </section>
            </div>
            <div className="grid two">
              <section className="card">
                <div className="sectionHead">
                  <b>System pulse</b>
                  <span className="muted">latest sample</span>
                </div>
                <div className="pulse">
                  <div>
                    <span>Tank level</span>
                    <b>{fmt(latest.tank_level, 1)}%</b>
                  </div>
                  <div>
                    <span>Water loss</span>
                    <b>{fmt(overview.water_loss, 1)} L</b>
                  </div>
                  <div>
                    <span>Avg current</span>
                    <b>{fmt(overview.avg_current, 2)} A</b>
                  </div>
                  <div>
                    <span>Pump</span>
                    <b>{latest.pump_status ? "ON" : "OFF"}</b>
                  </div>
                </div>
              </section>
              <section className="card">
                <div className="sectionHead">
                  <b>Machine status dataset</b>
                  <span className="muted">uploaded pump CSV</span>
                </div>
                <div className="bars">
                  {overview.pump_status.map((x) => (
                    <div className="barRow" key={x.machine_status}>
                      <span>{x.machine_status}</span>
                      <div>
                        <i
                          style={{ width: Math.min(100, x.rows / 2200) + "%" }}
                        ></i>
                      </div>
                      <b>{x.rows.toLocaleString()}</b>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
        {tab === "anomalies" && (
          <section className="card pageCard">
            <div className="heroIcon">
              <AlertTriangle />
            </div>
            <h2>Signal anomalies</h2>
            <p className="muted">
              The SKAB files include point-anomaly labels. The dashboard
              surfaces them without pretending they are groundwater-specific
              labels.
            </p>
            <div className="bigNumber">
              {overview.anomaly_count}
              <span>flagged observations</span>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" minTickGap={35} />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="anomaly_label"
                  fillOpacity={0.22}
                  strokeWidth={2}
                  name="Anomaly label"
                />
              </AreaChart>
            </ResponsiveContainer>
          </section>
        )}
        {tab === "water" && (
          <div className="grid two">
            <section className="card pageCard">
              <div className="heroIcon">
                <Droplets />
              </div>
              <h2>Prototype water budget</h2>
              <p className="muted">
                This view is wired to the project schema. Water-level, rainfall
                and inflow values in this demo are derived/proxy fields and must
                be replaced by hardware measurements.
              </p>
              <div className="budget">
                <div>
                  <span>Flow in</span>
                  <b>{fmt(latest.flow_in)} L/min</b>
                </div>
                <div>
                  <span>Flow out</span>
                  <b>{fmt(latest.flow_out)} L/min</b>
                </div>
                <div>
                  <span>Estimated loss</span>
                  <b>{fmt(overview.loss_rate, 1)}%</b>
                </div>
                <div>
                  <span>Water level</span>
                  <b>{fmt(latest.water_level, 2)} m</b>
                </div>
              </div>
            </section>
            <section className="card pageCard">
              <h2>What becomes real with hardware?</h2>
              <div className="steps">
                <div>
                  <b>01</b>
                  <span>
                    Ultrasonic/pressure level sensor →{" "}
                    <strong>water_level</strong>
                  </span>
                </div>
                <div>
                  <b>02</b>
                  <span>
                    Flow meters → <strong>flow_in / flow_out</strong>
                  </span>
                </div>
                <div>
                  <b>03</b>
                  <span>
                    Current/voltage sensing →{" "}
                    <strong>pump_current / pump_voltage</strong>
                  </span>
                </div>
                <div>
                  <b>04</b>
                  <span>
                    ESP32 POSTs the same telemetry contract to FastAPI.
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}
        {tab === "hardware" && (
          <section className="card pageCard">
            <div className="heroIcon">
              <Radio />
            </div>
            <h2>ESP32 connection contract</h2>
            <p className="muted">
              The software is intentionally decoupled from the hardware. POST a
              JSON payload to <code>/api/telemetry</code>.
            </p>
            <pre>{`{
  "timestamp": "2026-10-01T10:30:00",
  "water_level": 18.4,
  "rainfall": 0,
  "flow_in": 20.1,
  "flow_out": 19.2,
  "pressure": 2.1,
  "pump_current": 4.3,
  "pump_voltage": 230,
  "tank_level": 72,
  "pump_status": 1
}`}</pre>
            <div className="notice">
              <ShieldCheck size={18} />
              <span>
                Supabase is prepared as the production persistence layer via the
                included SQL migration and environment variables. No Supabase
                project was connected in this session, so the demo runs locally
                from processed dataset data.
              </span>
            </div>
          </section>
        )}
        <footer>
          Prototype data layer • Hardware-ready API • Supabase-ready schema
        </footer>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
