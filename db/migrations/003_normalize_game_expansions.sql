-- Earlier table creation encoded the expansion array as a JSON string.
-- This upgrade is idempotent: it only converts string values that contain an array.
UPDATE games
SET expansions = (expansions #>> '{}')::jsonb
WHERE jsonb_typeof(expansions) = 'string'
  AND expansions #>> '{}' ~ '^\s*\[';

-- Rollback: UPDATE games SET expansions = to_jsonb(expansions::text)
--           WHERE jsonb_typeof(expansions) = 'array';
