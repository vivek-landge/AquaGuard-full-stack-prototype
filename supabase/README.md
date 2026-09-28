# Supabase setup

No Supabase project was connected when this bundle was generated, so no cloud database was modified.

1. Create/open your Supabase project.
2. Run `schema.sql` in the SQL editor (or turn it into a migration).
3. Put the project URL and publishable key in `frontend/.env`.
4. Keep the service-role key only on the server; never ship it to the browser.
5. The FastAPI `/api/telemetry` endpoint is the recommended ESP32 ingestion boundary.
