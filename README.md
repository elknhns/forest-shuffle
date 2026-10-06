# Forest Shuffle Online

An async-first, self-hostable Forest Shuffle client. It supports the base game plus Alpine, Woodland Edge, and Exploration; promotional cards are intentionally excluded.

## Current slice

The project includes a responsive Next.js lobby shell and a tested domain foundation for registered hosts, guest joins, table capacity, host-controlled starts, versioned turns, and immutable action history. Registered players can create an account or sign in to access the protected host route; guests remain able to join games when the lobby is implemented.

Official card artwork and text are not included. The UI is designed to accept assets that the operator has permission to use.

## Run locally

```sh
cp .env.example .env.local
docker compose up -d database
npm install
npm run dev
```

Apply every migration once Postgres is healthy:

```sh
for migration in db/migrations/*.sql; do
  psql "$DATABASE_URL" -f "$migration"
done
```

## Quality gates

```sh
npm test
npm run typecheck
npm run build
```
