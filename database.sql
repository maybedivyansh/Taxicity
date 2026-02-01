-- ==========================================
-- SECTION 1: USER PROFILES & AUTH HANDLERS
-- ==========================================

-- Create a table for public profiles
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  gross_income numeric,
  employment_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.user_profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.user_profiles
  for select using (true);

create policy "Users can insert their own profile." on public.user_profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.user_profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==========================================
-- SECTION 2: BANK STATEMENTS & UPLOADS
-- ==========================================

-- Create a table for storing uploaded bank statements metadata
create table if not exists public.bank_statements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  filename text not null,
  file_path text not null, -- Path in Supabase Storage
  status text check (status in ('pending', 'processing', 'processed', 'error')) default 'pending',
  error_message text,
  metadata jsonb, -- For any extra file metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  processed_at timestamp with time zone
);

-- Enable RLS for bank_statements
alter table public.bank_statements enable row level security;

-- Policies for bank_statements
drop policy if exists "Users can view their own statements." on public.bank_statements;
create policy "Users can view their own statements." on public.bank_statements
  for select using (auth.uid() = user_id);

drop policy if exists "Users can upload their own statements." on public.bank_statements;
create policy "Users can upload their own statements." on public.bank_statements
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own statements." on public.bank_statements;
create policy "Users can delete their own statements." on public.bank_statements
  for delete using (auth.uid() = user_id);


-- ==========================================
-- SECTION 3: TRANSACTIONS & LEDGER
-- ==========================================

-- Create a table for transactions extracted from statements
create table if not exists public.statement_transactions (
  id uuid default gen_random_uuid() primary key,
  statement_id uuid references public.bank_statements on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  description text not null,
  amount numeric not null,
  type text check (type in ('DEBIT', 'CREDIT')) not null,
  category text, -- Can be inferred or manually updated
  merchant_name text, -- Extracted or inferred merchant
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for statement_transactions
alter table public.statement_transactions enable row level security;

-- Policies for statement_transactions
drop policy if exists "Users can view their own transactions." on public.statement_transactions;
create policy "Users can view their own transactions." on public.statement_transactions
  for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own transactions." on public.statement_transactions;
create policy "Users can update their own transactions." on public.statement_transactions
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own transactions." on public.statement_transactions;
create policy "Users can delete their own transactions." on public.statement_transactions
  for delete using (auth.uid() = user_id);


-- ==========================================
-- SECTION 4: STORAGE BUCKETS & POLICIES
-- ==========================================

-- Create a storage bucket for bank statements if it doesn't exist
insert into storage.buckets (id, name, public) values ('bank-statements', 'bank-statements', false) on conflict do nothing;

drop policy if exists "Authenticated users can upload bank statements" on storage.objects;
create policy "Authenticated users can upload bank statements"
on storage.objects for insert
with check ( bucket_id = 'bank-statements' and auth.role() = 'authenticated' );

drop policy if exists "Users can view their own bank statements" on storage.objects;
create policy "Users can view their own bank statements"
on storage.objects for select
using ( bucket_id = 'bank-statements' and auth.uid() = owner );

drop policy if exists "Users can update their own bank statements" on storage.objects;
create policy "Users can update their own bank statements"
on storage.objects for update
using ( bucket_id = 'bank-statements' and auth.uid() = owner );

drop policy if exists "Users can delete their own bank statements" on storage.objects;
create policy "Users can delete their own bank statements"
on storage.objects for delete
using ( bucket_id = 'bank-statements' and auth.uid() = owner );
