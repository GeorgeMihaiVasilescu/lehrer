-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Professors (maps 1:1 to Supabase auth.users)
create table if not exists professors (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Classes
create table if not exists classes (
  id            uuid primary key default uuid_generate_v4(),
  professor_id  uuid not null references professors(id) on delete cascade,
  name          text not null,
  level         text not null,
  robot_name    text not null default 'Klaus',
  personality   text not null default 'Friendly & encouraging',
  code          text not null unique,
  created_at    timestamptz not null default now()
);

create index if not exists classes_professor_id_idx on classes(professor_id);
create index if not exists classes_code_idx on classes(code);

-- Conversations / sessions
create table if not exists conversations (
  id            uuid primary key default uuid_generate_v4(),
  class_id      uuid not null references classes(id) on delete cascade,
  student_name  text not null,
  duration      integer not null default 0,  -- seconds
  accuracy      integer not null default 0,  -- 0-100
  mistakes      integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists conversations_class_id_idx on conversations(class_id);

-- Per-session mistake details (one row per error, saved immediately when detected)
create table if not exists conversation_errors (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  word_incorrect  text not null,
  word_correct    text not null,
  timestamp       timestamptz not null default now()
);

create index if not exists conv_errors_conversation_id_idx on conversation_errors(conversation_id);

-- Row Level Security
alter table professors enable row level security;
alter table classes enable row level security;
alter table conversations enable row level security;
alter table conversation_errors enable row level security;

-- Professors: only own row
create policy "professors_own" on professors
  for all using (auth.uid() = id);

-- Classes: professor manages their own; anyone can read by code (for students)
create policy "classes_professor_all" on classes
  for all using (auth.uid() = professor_id);

create policy "classes_public_read" on classes
  for select using (true);

-- Conversations: professor of that class can read; anyone can insert
create policy "conversations_insert" on conversations
  for insert with check (true);

create policy "conversations_update" on conversations
  for update using (true) with check (true);

create policy "conversations_professor_read" on conversations
  for select using (
    exists (
      select 1 from classes
      where classes.id = conversations.class_id
        and classes.professor_id = auth.uid()
    )
  );

-- Conversation errors: anyone can insert (student at session end); professor can read their classes' errors
create policy "conv_errors_insert" on conversation_errors
  for insert with check (true);

create policy "conv_errors_professor_read" on conversation_errors
  for select using (
    exists (
      select 1 from conversations
      join classes on classes.id = conversations.class_id
      where conversations.id = conversation_errors.conversation_id
        and classes.professor_id = auth.uid()
    )
  );
