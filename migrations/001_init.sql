-- Enable UUID generation
create extension if not exists "pgcrypto";

create table users (
  id uuid primary key
    references auth.users(id) on delete cascade,

  role text not null
    check (role in ('student', 'teacher', 'admin')),

  name text not null,
  created_at timestamptz default now()
);

alter table users enable row level security;

create table subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  created_at timestamptz default now()
);

alter table subjects enable row level security;

create table classes (
  id uuid primary key default gen_random_uuid(),

  subject_id uuid not null
    references subjects(id) on delete cascade,

  teacher_id uuid not null
    references users(id) on delete cascade,

  created_at timestamptz default now()
);

alter table classes enable row level security;

create table class_users (
  id uuid primary key default gen_random_uuid(),

  class_id uuid not null
    references classes(id) on delete cascade,

  user_id uuid not null
    references users(id) on delete cascade,

  unique (class_id, user_id)
);

alter table class_users enable row level security;

create table attendance_sessions (
  id uuid primary key default gen_random_uuid(),

  class_id uuid not null
    references classes(id) on delete cascade,

  started_by uuid not null
    references users(id),

  session_nonce text not null,
  started_at timestamptz default now()
);

alter table attendance_sessions enable row level security;

create table attendance_records (
  id uuid primary key default gen_random_uuid(),

  attendance_session_id uuid not null
    references attendance_sessions(id) on delete cascade,

  user_id uuid not null
    references users(id),

  marked_at timestamptz default now(),

  unique (attendance_session_id, user_id)
);

alter table attendance_records enable row level security;


