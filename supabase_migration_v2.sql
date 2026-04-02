-- =============================================
-- GameClass 2.0 — Migration Script
-- Roda APENAS as alterações novas sobre o schema existente
-- =============================================

-- 1. Adicionar coluna active_game_instance_id na tabela sessions (FK adicionada depois)
alter table public.sessions add column if not exists active_game_instance_id uuid;

-- 2. Tabela: students (identidade do aluno)
create table if not exists public.students (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  nickname text not null,
  avatar_seed text,
  total_score integer default 0,
  joined_at timestamptz default now(),
  unique(session_id, nickname)
);

-- 3. Tabela: games (games genéricos — substitui quizzes para novos tipos)
create table if not exists public.games (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references public.classes(id) on delete cascade,
  slide_number integer not null,
  game_type text not null,
  title text not null,
  config jsonb not null,
  time_limit integer,
  points integer default 100,
  created_at timestamptz default now()
);

-- 4. Tabela: game_instances (instâncias ao vivo)
create table if not exists public.game_instances (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  game_id uuid references public.games(id) on delete cascade,
  status text default 'waiting',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- 5. Agora adiciona a FK de sessions → game_instances
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'sessions_active_game_instance_fk'
  ) then
    alter table public.sessions
      add constraint sessions_active_game_instance_fk
      foreign key (active_game_instance_id)
      references public.game_instances(id);
  end if;
end $$;

-- 6. Tabela: responses (respostas genéricas)
create table if not exists public.responses (
  id uuid default gen_random_uuid() primary key,
  game_instance_id uuid references public.game_instances(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  payload jsonb not null,
  score_awarded integer default 0,
  response_time_ms integer,
  created_at timestamptz default now(),
  unique(game_instance_id, student_id)
);

-- 7. Tabela: presenter_notes (notas do apresentador)
create table if not exists public.presenter_notes (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references public.classes(id) on delete cascade,
  slide_number integer not null,
  content text default '',
  updated_at timestamptz default now(),
  unique(class_id, slide_number)
);

-- 8. Desabilita RLS nas novas tabelas
alter table public.students disable row level security;
alter table public.games disable row level security;
alter table public.game_instances disable row level security;
alter table public.responses disable row level security;
alter table public.presenter_notes disable row level security;

-- 9. Adiciona novas tabelas ao Realtime
alter publication supabase_realtime add table public.game_instances;
alter publication supabase_realtime add table public.responses;
alter publication supabase_realtime add table public.students;

-- 10. Bucket de Storage para PDFs (slides visíveis para alunos)
insert into storage.buckets (id, name, public)
values ('slides', 'slides', true)
on conflict (id) do nothing;

-- Permite leitura pública (alunos acessam sem auth)
create policy "Public read slides" on storage.objects
  for select using (bucket_id = 'slides');

-- Permite upload anônimo (professor sem login)
create policy "Public upload slides" on storage.objects
  for insert with check (bucket_id = 'slides');
