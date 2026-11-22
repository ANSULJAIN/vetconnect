-- 1. Close out test bookings where the vet and the customer are the same
--    account (made before 0002). Unassigning in the same update keeps the
--    row valid, then the self-assignment rule is checked for every row.
with fixed as (
  update public.consultations
     set doctor_id = null, status = 'closed', closed_at = now(), chat_expires_at = now()
   where doctor_id = customer_id
  returning id
)
insert into public.messages (consultation_id, sender_role, body)
select id, 'system', 'This test consultation was closed automatically (the vet and the customer were the same account).'
  from fixed;

alter table public.consultations validate constraint consultations_not_self_assigned;

-- 2. Google Meet link per consultation (created by /api/meet).
alter table public.consultations add column if not exists meet_link text;

-- 3. Private settings for connected services (e.g. the Google account that
--    owns Meet rooms). RLS on with no policies: only the backend's secret key
--    can read or write it — never a browser.
create table if not exists public.integrations (
  name        text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
alter table public.integrations enable row level security;
