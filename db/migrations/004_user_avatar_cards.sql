-- Keep old application versions able to create users during a rolling deploy:
-- they receive the default card, while the new writer explicitly chooses one at random.
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_card TEXT;

-- Give existing accounts a stable, evenly distributed card without changing any user identity.
UPDATE users
SET avatar_card = CASE mod(abs(hashtext(id::text)), 6)
  WHEN 0 THEN 'birch'
  WHEN 1 THEN 'roe-deer'
  WHEN 2 THEN 'european-hare'
  WHEN 3 THEN 'oak'
  WHEN 4 THEN 'red-fox'
  ELSE 'tawny-owl'
END
WHERE avatar_card IS NULL;

ALTER TABLE users ALTER COLUMN avatar_card SET DEFAULT 'birch';
ALTER TABLE users ALTER COLUMN avatar_card SET NOT NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_avatar_card_check;
ALTER TABLE users
  ADD CONSTRAINT users_avatar_card_check
  CHECK (avatar_card IN ('birch', 'roe-deer', 'european-hare', 'oak', 'red-fox', 'tawny-owl'));

-- Rollback: ALTER TABLE users DROP CONSTRAINT IF EXISTS users_avatar_card_check;
--           ALTER TABLE users DROP COLUMN IF EXISTS avatar_card;
