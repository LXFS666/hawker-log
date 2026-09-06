# Hawker Log

A private log of every hawker stall I've tried in Singapore, shown as pins on a map.

## Stack

- Vite + React + TypeScript
- react-leaflet (OpenStreetMap tiles)
- Supabase (Postgres, auth, storage)
- Netlify (deploy)

## Development

```bash
npm install
cp .env.example .env   # fill in your Supabase URL + anon key
npm run dev
```

## Environment variables

Set these in `.env` locally and in Netlify's environment variable settings for deploys:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The anon key is safe to expose in the frontend — Row Level Security in Postgres is what protects the data.
