-- VetConnect: accounts, doctors, paid consultations, chat, funnel events.
--
-- Security model, in one paragraph:
--   The browser talks to Supabase with the public anon key, so every table has
--   row-level security and the browser can only touch its own rows. Anything
--   that involves money or trust — creating a consultation at a price, marking
--   it paid, verifying a doctor — happens either in a Cloudflare Function using
--   the service-role key (which bypasses RLS) or in a SECURITY DEFINER function
--   below that checks the caller first. Clients never write status columns.

-- ---------------------------------------------------------------------------
-- profiles: one row per signed-in person
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'customer' check (role in ('customer', 'doctor', 'admin')),
  full_name   text check (char_length(full_name) <= 120),
  phone       text check (char_length(phone) <= 20),
  email       text,
  created_at  timestamptz not null default now()
);

-- Create the profile row the moment someone signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------------
-- doctors: registration + verification
-- ---------------------------------------------------------------------------
create table public.doctors (
  id                uuid primary key references public.profiles (id) on delete cascade,
  status            text not null default 'pending' check (status in ('pending', 'verified', 'rejected', 'suspended')),
  full_name         text not null check (char_length(full_name) between 2 and 120),
  phone             text not null check (char_length(phone) <= 20),
  qualification     text not null check (char_length(qualification) <= 120),
  registration_no   text not null check (char_length(registration_no) <= 60),
  council_state     text not null check (char_length(council_state) <= 60),
  experience_years  int check (experience_years between 0 and 70),
  species           text[] not null default '{}',
  languages         text[] not null default '{}',
  bio               text check (char_length(bio) <= 600),
  photo_path        text,
  certificate_path  text,
  is_online         boolean not null default false,
  review_note       text,
  created_at        timestamptz not null default now(),
  verified_at       timestamptz
);

create function public.is_verified_doctor() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.doctors where id = auth.uid() and status = 'verified');
$$;

-- ---------------------------------------------------------------------------
-- consultations: one paid booking = one chat room
-- ---------------------------------------------------------------------------
create table public.consultations (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,                 -- "VC-AB12", quoted to humans
  customer_id      uuid not null references public.profiles (id),
  doctor_id        uuid references public.doctors (id),
  status           text not null default 'awaiting_payment'
                   check (status in ('awaiting_payment', 'paid', 'active', 'closed', 'cancelled')),
  customer_name    text not null,
  customer_phone   text not null,
  pet_species      text not null,
  pet_gender       text,
  pet_age          text,
  language         text not null default 'English',
  issue            text not null,
  slot_date        date,
  slot_label       text,
  price_paise      int not null,
  intake           jsonb,          -- AI intake: summary, urgency, category, red flags
  urgency          text check (urgency in ('routine', 'soon', 'emergency')),
  visitor_id       text,           -- links back to anonymous funnel events
  created_at       timestamptz not null default now(),
  paid_at          timestamptz,
  assigned_at      timestamptz,
  closed_at        timestamptz,
  chat_expires_at  timestamptz     -- messaging closes after the follow-up window
);
create index consultations_customer_idx on public.consultations (customer_id, created_at desc);
create index consultations_doctor_idx   on public.consultations (doctor_id, status);
create index consultations_queue_idx    on public.consultations (status) where doctor_id is null;

create function public.is_participant(c_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.consultations
    where id = c_id and (customer_id = auth.uid() or doctor_id = auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- payments: written only by Cloudflare Functions (service role)
-- ---------------------------------------------------------------------------
create table public.payments (
  id                   uuid primary key default gen_random_uuid(),
  consultation_id      uuid not null references public.consultations (id) on delete cascade,
  razorpay_order_id    text not null unique,
  razorpay_payment_id  text,
  amount_paise         int not null,
  status               text not null default 'created' check (status in ('created', 'paid', 'failed')),
  created_at           timestamptz not null default now(),
  paid_at              timestamptz
);

-- ---------------------------------------------------------------------------
-- messages: the chat
-- ---------------------------------------------------------------------------
create table public.messages (
  id               bigint generated always as identity primary key,
  consultation_id  uuid not null references public.consultations (id) on delete cascade,
  sender_id        uuid references public.profiles (id),   -- null = system message
  sender_role      text not null check (sender_role in ('customer', 'doctor', 'system')),
  body             text check (char_length(body) <= 4000),
  attachment_path  text,
  created_at       timestamptz not null default now(),
  check (body is not null or attachment_path is not null)
);
create index messages_consultation_idx on public.messages (consultation_id, id);

-- ---------------------------------------------------------------------------
-- events: anonymous funnel tracking
-- ---------------------------------------------------------------------------
create table public.events (
  id          bigint generated always as identity primary key,
  visitor_id  text not null check (char_length(visitor_id) <= 64),
  user_id     uuid,
  name        text not null check (char_length(name) <= 40),
  path        text check (char_length(path) <= 200),
  props       jsonb check (pg_column_size(props) <= 2000),
  created_at  timestamptz not null default now()
);
create index events_name_time_idx on public.events (name, created_at);

-- ===========================================================================
-- Row-level security
-- ===========================================================================
alter table public.profiles      enable row level security;
alter table public.doctors       enable row level security;
alter table public.consultations enable row level security;
alter table public.payments      enable row level security;
alter table public.messages      enable row level security;
alter table public.events        enable row level security;

-- profiles ------------------------------------------------------------------
create policy "read own profile, participants, admin" on public.profiles for select
  using (
    id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.consultations c
      where (c.customer_id = profiles.id and c.doctor_id = auth.uid())
         or (c.doctor_id = profiles.id and c.customer_id = auth.uid())
    )
  );
create policy "update own profile" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy "admin updates profiles" on public.profiles for update
  using (public.is_admin());

-- Column grants stop a user promoting themselves: they may only edit these.
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- doctors -------------------------------------------------------------------
create policy "verified doctors are public" on public.doctors for select
  using (status = 'verified' or id = auth.uid() or public.is_admin());
create policy "register self as pending doctor" on public.doctors for insert
  with check (id = auth.uid() and status = 'pending');
create policy "doctor edits own profile" on public.doctors for update
  using (id = auth.uid()) with check (id = auth.uid());

revoke update on public.doctors from authenticated;
grant update (full_name, phone, qualification, registration_no, council_state,
              experience_years, species, languages, bio, photo_path,
              certificate_path, is_online)
  on public.doctors to authenticated;
-- Admin status changes go through review_doctor() below.

-- consultations -------------------------------------------------------------
create policy "customer, assigned doctor, admin read" on public.consultations for select
  using (customer_id = auth.uid() or doctor_id = auth.uid() or public.is_admin());
create policy "verified doctors see the open queue" on public.consultations for select
  using (doctor_id is null and status = 'paid' and public.is_verified_doctor());
-- No insert/update policies: created by /api/create-order, changed via RPCs.

-- payments ------------------------------------------------------------------
create policy "customer reads own payments" on public.payments for select
  using (
    public.is_admin() or exists (
      select 1 from public.consultations c
      where c.id = payments.consultation_id and c.customer_id = auth.uid()
    )
  );

-- messages ------------------------------------------------------------------
create policy "participants read messages" on public.messages for select
  using (public.is_participant(consultation_id) or public.is_admin());

-- The paid-chat gate. You can only post into a consultation you are part of,
-- as yourself, while it is paid/active and inside the follow-up window.
create policy "participants post while chat is open" on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.consultations c
      where c.id = messages.consultation_id
        and c.status in ('paid', 'active')
        and (c.chat_expires_at is null or c.chat_expires_at > now())
        and (
          (c.customer_id = auth.uid() and messages.sender_role = 'customer')
          or (c.doctor_id = auth.uid() and messages.sender_role = 'doctor')
        )
    )
  );

-- events --------------------------------------------------------------------
-- Anyone may append an event; only admins read them.
create policy "anyone logs events" on public.events for insert
  with check (user_id is null or user_id = auth.uid());
create policy "admin reads events" on public.events for select
  using (public.is_admin());

-- ===========================================================================
-- RPCs: the only way status changes happen from a browser
-- ===========================================================================

-- A verified doctor takes an unassigned paid consultation from the queue.
create function public.claim_consultation(c_id uuid) returns public.consultations
language plpgsql security definer set search_path = '' as $$
declare result public.consultations;
begin
  if not public.is_verified_doctor() then raise exception 'not a verified doctor'; end if;
  update public.consultations
     set doctor_id = auth.uid(), status = 'active', assigned_at = now()
   where id = c_id and doctor_id is null and status = 'paid'
  returning * into result;
  if result.id is null then raise exception 'already taken'; end if;
  insert into public.messages (consultation_id, sender_role, body)
  values (c_id, 'system', 'A veterinarian has joined the chat.');
  return result;
end $$;

-- Admin assigns (or reassigns) a doctor.
create function public.assign_consultation(c_id uuid, d_id uuid) returns public.consultations
language plpgsql security definer set search_path = '' as $$
declare result public.consultations;
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  if not exists (select 1 from public.doctors where id = d_id and status = 'verified') then
    raise exception 'doctor is not verified';
  end if;
  update public.consultations
     set doctor_id = d_id, status = 'active', assigned_at = now()
   where id = c_id and status in ('paid', 'active')
  returning * into result;
  if result.id is null then raise exception 'consultation not open'; end if;
  insert into public.messages (consultation_id, sender_role, body)
  values (c_id, 'system', 'A veterinarian has joined the chat.');
  return result;
end $$;

-- The assigned doctor (or admin) closes the consultation. Chat becomes read-only.
create function public.close_consultation(c_id uuid) returns public.consultations
language plpgsql security definer set search_path = '' as $$
declare result public.consultations;
begin
  update public.consultations
     set status = 'closed', closed_at = now(), chat_expires_at = now()
   where id = c_id and status = 'active'
     and (doctor_id = auth.uid() or public.is_admin())
  returning * into result;
  if result.id is null then raise exception 'cannot close'; end if;
  insert into public.messages (consultation_id, sender_role, body)
  values (c_id, 'system', 'The veterinarian has closed this consultation.');
  return result;
end $$;

-- Admin approves or rejects a doctor registration.
create function public.review_doctor(d_id uuid, new_status text, note text default null)
returns public.doctors
language plpgsql security definer set search_path = '' as $$
declare result public.doctors;
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  if new_status not in ('verified', 'rejected', 'suspended', 'pending') then
    raise exception 'bad status';
  end if;
  update public.doctors
     set status = new_status, review_note = note,
         verified_at = case when new_status = 'verified' then now() else verified_at end,
         is_online = case when new_status = 'verified' then is_online else false end
   where id = d_id
  returning * into result;
  update public.profiles
     set role = case when new_status = 'verified' then 'doctor' else 'customer' end
   where id = d_id and role <> 'admin';
  return result;
end $$;

-- Funnel counts for the admin page, without exposing raw rows to the client.
create function public.funnel(days int default 30)
returns table (name text, visitors bigint, events bigint)
language sql stable security definer set search_path = '' as $$
  select e.name, count(distinct e.visitor_id), count(*)
    from public.events e
   where public.is_admin() and e.created_at > now() - make_interval(days => days)
   group by e.name;
$$;

revoke execute on function public.claim_consultation, public.assign_consultation,
  public.close_consultation, public.review_doctor, public.funnel from anon;

-- ===========================================================================
-- Realtime: chat messages and status changes push to subscribed browsers.
-- RLS applies, so each browser only receives rows it is allowed to read.
-- ===========================================================================
alter publication supabase_realtime add table public.messages, public.consultations;

-- ===========================================================================
-- Storage
-- ===========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('doctor-photos',    'doctor-photos',    true,  2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('doctor-documents', 'doctor-documents', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('chat-attachments', 'chat-attachments', false, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

-- Files live under "<user id>/…", so the first folder says who owns them.
create policy "doctors upload own photo" on storage.objects for insert to authenticated
  with check (bucket_id = 'doctor-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "doctors replace own photo" on storage.objects for update to authenticated
  using (bucket_id = 'doctor-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "doctors upload own documents" on storage.objects for insert to authenticated
  with check (bucket_id = 'doctor-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "doctor or admin reads documents" on storage.objects for select to authenticated
  using (bucket_id = 'doctor-documents'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- Chat files live under "<consultation id>/…".
create policy "participants upload chat files" on storage.objects for insert to authenticated
  with check (bucket_id = 'chat-attachments'
              and public.is_participant(((storage.foldername(name))[1])::uuid));
create policy "participants read chat files" on storage.objects for select to authenticated
  using (bucket_id = 'chat-attachments'
         and (public.is_participant(((storage.foldername(name))[1])::uuid) or public.is_admin()));
