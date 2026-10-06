CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code CHAR(6) NOT NULL UNIQUE,
  host_user_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'finished', 'abandoned')),
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
  max_players SMALLINT NOT NULL CHECK (max_players BETWEEN 2 AND 5),
  expansions JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INTEGER NOT NULL DEFAULT 0,
  turn INTEGER NOT NULL DEFAULT 0,
  current_player_id UUID,
  state JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  guest_id UUID REFERENCES guests(id),
  seat SMALLINT NOT NULL CHECK (seat BETWEEN 0 AND 4),
  display_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((user_id IS NULL) <> (guest_id IS NULL)),
  UNIQUE (game_id, seat),
  UNIQUE (game_id, user_id),
  UNIQUE (game_id, guest_id)
);

CREATE TABLE game_events (
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  actor_player_id UUID NOT NULL REFERENCES game_players(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (game_id, version)
);

CREATE TABLE game_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  author_player_id UUID NOT NULL REFERENCES game_players(id),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1_000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX games_public_waiting_idx ON games (created_at DESC)
  WHERE status = 'waiting' AND visibility = 'public';
CREATE INDEX game_events_replay_idx ON game_events (game_id, version);
CREATE INDEX game_messages_timeline_idx ON game_messages (game_id, created_at);
