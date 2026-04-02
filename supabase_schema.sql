-- 1. Aulas (Classes)
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Quizzes/Jogos Interativos (legado — mantido para backward compat)
create table public.quizzes (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references public.classes(id) on delete cascade,
  slide_number integer not null,
  question text not null,
  options jsonb not null,
  correct_option integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Sessões ao vivo (A sala que o aluno entra)
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references public.classes(id) on delete cascade,
  code text unique not null,
  current_slide integer default 1,
  is_active boolean default true,
  active_game_instance_id uuid,  -- referencia para game_instances (FK adicionada abaixo)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Respostas em tempo real (legado)
create table public.answers (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  quiz_id uuid references public.quizzes(id) on delete cascade,
  student_nick text not null,
  selected_option integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- NOVAS TABELAS (GameClass 2.0)
-- =============================================

-- 5. Identidade do aluno (persistente por sessão)
create table public.students (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  nickname text not null,
  avatar_seed text,
  total_score integer default 0,
  joined_at timestamptz default now(),
  unique(session_id, nickname)
);

-- 6. Games genéricos (substitui quizzes para novos tipos)
create table public.games (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references public.classes(id) on delete cascade,
  slide_number integer not null,
  game_type text not null,  -- 'quiz','wordcloud','truefalse','ordering','open_response','roulette'
  title text not null,
  config jsonb not null,
  time_limit integer,       -- segundos, null = sem limite
  points integer default 100,
  created_at timestamptz default now()
);

-- 7. Instâncias de game em sessão ao vivo
create table public.game_instances (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  game_id uuid references public.games(id) on delete cascade,
  status text default 'waiting',  -- waiting/active/closed/showing_results
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- Adiciona FK de sessions.active_game_instance_id
alter table public.sessions
  add constraint sessions_active_game_instance_fk
  foreign key (active_game_instance_id)
  references public.game_instances(id);

-- 8. Respostas genéricas
create table public.responses (
  id uuid default gen_random_uuid() primary key,
  game_instance_id uuid references public.game_instances(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  payload jsonb not null,
  score_awarded integer default 0,
  response_time_ms integer,
  created_at timestamptz default now(),
  unique(game_instance_id, student_id)
);

-- 9. Notas do apresentador
create table public.presenter_notes (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references public.classes(id) on delete cascade,
  slide_number integer not null,
  content text default '',
  updated_at timestamptz default now(),
  unique(class_id, slide_number)
);

-- Desabilita RLS para acesso anônimo
alter table public.classes disable row level security;
alter table public.quizzes disable row level security;
alter table public.sessions disable row level security;
alter table public.answers disable row level security;
alter table public.students disable row level security;
alter table public.games disable row level security;
alter table public.game_instances disable row level security;
alter table public.responses disable row level security;
alter table public.presenter_notes disable row level security;

-- Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.answers;
alter publication supabase_realtime add table public.game_instances;
alter publication supabase_realtime add table public.responses;
alter publication supabase_realtime add table public.students;
