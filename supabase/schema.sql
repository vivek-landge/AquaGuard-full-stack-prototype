create extension if not exists pgcrypto;

create table if not exists public.telemetry (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null,
  water_level double precision,
  rainfall double precision,
  flow_in double precision,
  flow_out double precision,
  pressure double precision,
  pump_current double precision,
  pump_voltage double precision,
  pump_status boolean,
  tank_level double precision,
  water_loss double precision,
  loss_percentage double precision,
  anomaly_label integer default 0,
  scenario text,
  diagnosis text,
  source text default 'esp32',
  created_at timestamptz not null default now()
);

create index if not exists telemetry_timestamp_idx on public.telemetry(timestamp desc);
create index if not exists telemetry_scenario_idx on public.telemetry(scenario);

alter table public.telemetry enable row level security;

create policy "authenticated read telemetry" on public.telemetry
for select to authenticated using (true);

create policy "authenticated insert telemetry" on public.telemetry
for insert to authenticated with check (true);

-- For a public competition demo, keep ingestion behind your FastAPI service
-- rather than exposing unrestricted INSERT access to anon clients.
