-- Zumi backend schema. Apply with `supabase db push`.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Per-user daily request counter (protects AI / voice API budgets).
create table if not exists public.usage (
  user_id uuid not null references auth.users on delete cascade,
  day date not null default current_date,
  count int not null default 0,
  primary key (user_id, day)
);
alter table public.usage enable row level security;

create or replace function public.bump_usage(p_user uuid, p_limit int)
returns boolean language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into usage (user_id, day, count) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set count = usage.count + 1
  returning count into c;
  return c <= p_limit;
end $$;
revoke execute on function public.bump_usage(uuid, int) from anon, authenticated;

-- WhatsApp outbox: reminders to the user, messages and broadcasts to clients.
create table if not exists public.wa_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  batch_id uuid,
  to_phone text not null,
  text text not null,
  kind text not null default 'self' check (kind in ('self', 'client')),
  name text,
  send_at timestamptz not null default now(),
  repeat text check (repeat in ('daily', 'weekdays', 'weekly')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'cancelled')),
  error text,
  created_at timestamptz not null default now()
);
create index if not exists wa_jobs_due on public.wa_jobs (send_at) where status = 'pending';
alter table public.wa_jobs enable row level security;
create policy "own jobs readable" on public.wa_jobs for select using (auth.uid() = user_id);

-- Optional per-user WhatsApp Business sender (Embedded Signup). Falls back to the global sender.
create table if not exists public.wa_accounts (
  user_id uuid primary key references auth.users on delete cascade,
  phone_number_id text not null,
  access_token text not null,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.wa_accounts enable row level security;

-- Studio short links (public read).
create table if not exists public.pages (
  slug text primary key,
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  body text not null,
  author text,
  created_at timestamptz not null default now()
);
alter table public.pages enable row level security;
create policy "pages are public" on public.pages for select using (true);

-- «Линия Zumi»: a Twilio number per user.
create table if not exists public.lines (
  user_id uuid primary key references auth.users on delete cascade,
  number text not null unique,
  twilio_sid text,
  owner_phone text not null,
  owner_name text,
  created_at timestamptz not null default now()
);
alter table public.lines enable row level security;
create policy "own line readable" on public.lines for select using (auth.uid() = user_id);

-- Recorded & processed calls; the app pulls rows with synced = false.
create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  counterpart text,
  duration_sec int,
  recording_sid text unique,
  transcript text,
  digest jsonb,
  synced boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.calls enable row level security;
create policy "own calls readable" on public.calls for select using (auth.uid() = user_id);
create policy "own calls syncable" on public.calls for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Long recordings uploaded from the app before transcription.
insert into storage.buckets (id, name, public) values ('audio', 'audio', false) on conflict do nothing;
create policy "upload own audio" on storage.objects for insert to authenticated
  with check (bucket_id = 'audio' and (storage.foldername(name))[1] = auth.uid()::text);

-- Deliver due WhatsApp jobs every minute.
-- Store the service key once:  select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
--                              select vault.create_secret('https://<ref>.supabase.co', 'project_url');
select cron.schedule(
  'zumi-whatsapp-dispatch',
  '* * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/whatsapp-dispatch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
