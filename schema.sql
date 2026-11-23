-- Cloudflare D1 schema for VetConnect bookings.
--
-- Apply with:
--   npx wrangler d1 create vetconnect
--   npx wrangler d1 execute vetconnect --remote --file=./schema.sql
--
-- Then bind it in the Pages project as DB
-- (Settings -> Functions -> D1 database bindings).

CREATE TABLE IF NOT EXISTS bookings (
  id          TEXT PRIMARY KEY,          -- uuid we generate
  order_id    TEXT NOT NULL,             -- Razorpay order id
  payment_id  TEXT,                      -- Razorpay payment id, once paid
  status      TEXT NOT NULL,             -- pending | paid | failed
  amount      INTEGER NOT NULL,          -- paise

  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,

  pet         TEXT,
  gender      TEXT,
  age         TEXT,
  language    TEXT,

  slot_date   TEXT,
  slot_time   TEXT,
  issue       TEXT,

  created_at  TEXT NOT NULL,
  paid_at     TEXT
);

-- The webhook looks bookings up by order_id, so keep that fast and unique.
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_order ON bookings (order_id);

-- For the "today's bookings" view an operator will want.
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings (slot_date, status);
