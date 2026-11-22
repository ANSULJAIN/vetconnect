-- A vet who books a consultation for their own pet must never be assigned to it.

-- The open queue no longer shows a vet their own bookings.
drop policy if exists "verified doctors see the open queue" on public.consultations;
create policy "verified doctors see the open queue" on public.consultations for select
  using (doctor_id is null and status = 'paid' and customer_id <> auth.uid() and public.is_verified_doctor());

create or replace function public.claim_consultation(c_id uuid) returns public.consultations
language plpgsql security definer set search_path = '' as $$
declare result public.consultations;
begin
  if not public.is_verified_doctor() then raise exception 'not a verified doctor'; end if;
  update public.consultations
     set doctor_id = auth.uid(), status = 'active', assigned_at = now()
   where id = c_id and doctor_id is null and status = 'paid'
     and customer_id <> auth.uid()
  returning * into result;
  if result.id is null then raise exception 'already taken'; end if;
  insert into public.messages (consultation_id, sender_role, body)
  values (c_id, 'system', 'A veterinarian has joined the chat.');
  return result;
end $$;

create or replace function public.assign_consultation(c_id uuid, d_id uuid) returns public.consultations
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
     and customer_id <> d_id
  returning * into result;
  if result.id is null then raise exception 'consultation not open, or that vet booked it themselves'; end if;
  insert into public.messages (consultation_id, sender_role, body)
  values (c_id, 'system', 'A veterinarian has joined the chat.');
  return result;
end $$;

revoke execute on function public.claim_consultation, public.assign_consultation from anon;

-- A database-level backstop for every path, including the backend's auto-assign.
-- NOT VALID: enforced for every new or changed row, without failing on old
-- test bookings made before this rule existed.
alter table public.consultations drop constraint if exists consultations_not_self_assigned;
alter table public.consultations add constraint consultations_not_self_assigned
  check (doctor_id is null or doctor_id <> customer_id) not valid;
