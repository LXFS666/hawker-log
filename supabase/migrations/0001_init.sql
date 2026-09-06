-- Hawker Log: initial schema
-- Paste this into the Supabase SQL editor and run it once.

create table hawker_centres (
  id bigint generated always as identity primary key,
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null
);

create table stalls (
  id bigint generated always as identity primary key,
  centre_id bigint not null references hawker_centres (id),
  name text not null,
  unit_no text,
  cuisine text,
  created_by uuid not null references auth.users (id) default auth.uid()
);

create table visits (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) default auth.uid(),
  stall_id bigint not null references stalls (id),
  visited_on date not null default current_date,
  rating int not null check (rating between 1 and 5),
  dish text,
  would_reorder boolean not null default false,
  notes text
);

-- hawker_centres: public read, no writes from the app (seeded via script/service role only)
alter table hawker_centres enable row level security;

create policy "hawker_centres are publicly readable"
  on hawker_centres for select
  using (true);

-- stalls: public read, authenticated users can add new stalls
alter table stalls enable row level security;

create policy "stalls are publicly readable"
  on stalls for select
  using (true);

create policy "authenticated users can insert stalls"
  on stalls for insert
  to authenticated
  with check (auth.uid() = created_by);

-- visits: fully private, each user only sees/edits their own rows
alter table visits enable row level security;

create policy "users can select their own visits"
  on visits for select
  using (auth.uid() = user_id);

create policy "users can insert their own visits"
  on visits for insert
  with check (auth.uid() = user_id);

create policy "users can update their own visits"
  on visits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete their own visits"
  on visits for delete
  using (auth.uid() = user_id);
