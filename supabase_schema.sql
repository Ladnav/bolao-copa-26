-- ==========================================
-- SCRIPT DE BANCO DE DADOS - BOLÃO COPA 2026
-- ==========================================
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Limpar tabelas e funções existentes se necessário (usando CASCADE para evitar erros de dependência)
drop table if exists public.guesses cascade;
drop table if exists public.matches cascade;
drop table if exists public.profiles cascade;

drop function if exists trigger_update_match_scores() cascade;
drop function if exists recalculate_user_points(uuid) cascade;
drop function if exists calculate_guess_points(integer, integer, integer, integer) cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.admin_recalculate_all_points() cascade;
drop trigger if exists on_auth_user_created on auth.users cascade;

-- 2. Tabela de Perfis de Usuários (Público)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null unique,
  avatar_url text,
  total_points integer default 0 not null,
  exact_scores_count integer default 0 not null,
  pts7_count integer default 0 not null,
  is_admin boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para Perfis
alter table public.profiles enable row level security;

create policy "Perfis são visíveis por todos"
  on public.profiles for select
  using (true);

create policy "Usuários podem atualizar seus próprios perfis"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Tabela de Partidas (Jogos da Copa)
create table public.matches (
  id bigint primary key, -- IDs oficiais (ex: 1 a 104)
  round text not null, -- Ex: 'Fase de Grupos', 'Rodada de 32', etc.
  group_name text, -- Ex: 'A', 'B', etc. Nulo para mata-mata.
  home_team text not null,
  away_team text not null,
  home_team_flag text, -- URL da bandeira
  away_team_flag text, -- URL da bandeira
  home_score integer, -- Nulo antes do jogo acontecer
  away_score integer, -- Nulo antes do jogo acontecer
  status text default 'scheduled' not null, -- 'scheduled', 'live', 'finished'
  match_date timestamp with time zone not null,
  -- Prazo para palpites: se null, usa match_date como limite automático
  guess_deadline timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para Partidas
alter table public.matches enable row level security;

create policy "Partidas são visíveis por todos"
  on public.matches for select
  using (true);

create policy "Partidas podem ser alteradas apenas por administradores"
  on public.matches for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- 4. Tabela de Palpites (Guesses)
create table public.guesses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_id bigint references public.matches(id) on delete cascade not null,
  home_guess integer not null,
  away_guess integer not null,
  points_awarded integer, -- Nulo até o jogo finalizar
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_match_guess unique (user_id, match_id)
);

-- Habilitar RLS para Palpites
alter table public.guesses enable row level security;

-- Política de Leitura: Usuário vê o próprio palpite a qualquer momento,
-- ou palpites de outros APENAS DEPOIS que o jogo começou
create policy "Ver palpites próprios ou de outros pós-início"
  on public.guesses for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.matches
      where matches.id = match_id
      and matches.match_date <= now()
    )
  );

-- Política de Inserção: Apenas o próprio usuário, e antes do prazo de palpite
-- O prazo é guess_deadline se definido, senão a própria match_date
create policy "Inserir próprios palpites antes do prazo"
  on public.guesses for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches
      where matches.id = match_id
      and coalesce(matches.guess_deadline, matches.match_date) > now()
    )
  );

-- Política de Edição: Apenas o próprio usuário, e antes do prazo de palpite
create policy "Atualizar próprios palpites antes do prazo"
  on public.guesses for update
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches
      where matches.id = match_id
      and coalesce(matches.guess_deadline, matches.match_date) > now()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches
      where matches.id = match_id
      and coalesce(matches.guess_deadline, matches.match_date) > now()
    )
  );

-- Política de Exclusão: Apenas o próprio usuário, e antes do prazo de palpite
create policy "Deletar próprios palpites antes do prazo"
  on public.guesses for delete
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches
      where matches.id = match_id
      and coalesce(matches.guess_deadline, matches.match_date) > now()
    )
  );

-- ==========================================
-- 5. FUNÇÕES E TRIGGERS DE LOGICA E CÁLCULO
-- ==========================================

-- Trigger para criar perfil automaticamente ao registrar no Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, total_points, exact_scores_count, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    0,
    0,
    false
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Função de Cálculo de Pontos de Palpite
create or replace function calculate_guess_points(
  h_guess integer,
  a_guess integer,
  h_score integer,
  a_score integer
) returns integer as $$
declare
  guess_diff integer;
  actual_diff integer;
  guess_winner integer; -- 1 (mandante), -1 (visitante), 0 (empate)
  actual_winner integer;
begin
  if h_guess is null or a_guess is null or h_score is null or a_score is null then
    return 0;
  end if;

  -- 1. Acerto Exato do Placar (10 pontos)
  if h_guess = h_score and a_guess = a_score then
    return 10;
  end if;

  guess_diff := h_guess - a_guess;
  actual_diff := h_score - a_score;

  if guess_diff > 0 then guess_winner := 1;
  elsif guess_diff < 0 then guess_winner := -1;
  else guess_winner := 0;
  end if;

  if actual_diff > 0 then actual_winner := 1;
  elsif actual_diff < 0 then actual_winner := -1;
  else actual_winner := 0;
  end if;

  -- 2. Acerto de Empate Não Exato (5 pontos)
  if guess_winner = 0 and actual_winner = 0 then
    return 5;
  end if;

  -- Se acertou quem ganha o jogo (para jogos que não foram empate)
  if guess_winner = actual_winner then
    -- 3. Acerto do Vencedor e Saldo de Gols (7 pontos)
    if guess_diff = actual_diff then
      return 7;
    end if;

    -- 4. Acerto do Vencedor e Gols de um dos Times (5 pontos)
    if h_guess = h_score or a_guess = a_score then
      return 5;
    end if;

    -- 5. Acerto Simples do Vencedor (3 pontos)
    return 3;
  end if;

  -- 6. Erro completo (0 pontos)
  return 0;
end;
$$ language plpgsql immutable;


-- Função para Recalcular Pontos Acumulados de um Usuário
create or replace function public.recalculate_user_points(p_user_id uuid)
returns void as $$
begin
  update public.profiles
  set
    total_points       = coalesce((select sum(points_awarded) from public.guesses where user_id = p_user_id and points_awarded is not null), 0),
    exact_scores_count = coalesce((select count(*)            from public.guesses where user_id = p_user_id and points_awarded = 10), 0),
    pts7_count         = coalesce((select count(*)            from public.guesses where user_id = p_user_id and points_awarded = 7), 0)
  where id = p_user_id;
end;
$$ language plpgsql security definer;


-- Trigger ao atualizar placar da partida
create or replace function trigger_update_match_scores()
returns trigger as $$
declare
  guess_record record;
begin
  -- Caso o jogo passe para finalizado (finished) ou seja atualizado enquanto finalizado
  if (new.status = 'finished' and (old.status != 'finished' or old.home_score is distinct from new.home_score or old.away_score is distinct from new.away_score)) then

    -- Atualiza pontos de todos os palpites desse jogo
    update public.guesses
    set points_awarded = calculate_guess_points(home_guess, away_guess, new.home_score, new.away_score)
    where match_id = new.id;

    -- Recalcula os pontos dos usuários afetados
    for guess_record in select distinct user_id from public.guesses where match_id = new.id loop
      perform recalculate_user_points(guess_record.user_id);
    end loop;

  -- Caso o status do jogo volte atrás (ex: cancelamento ou correção para live/scheduled)
  elsif (old.status = 'finished' and new.status != 'finished') then

    -- Reseta os pontos dos palpites para nulo
    update public.guesses
    set points_awarded = null
    where match_id = new.id;

    -- Recalcula os pontos dos usuários afetados (zerando os pontos deste jogo)
    for guess_record in select distinct user_id from public.guesses where match_id = new.id loop
      perform recalculate_user_points(guess_record.user_id);
    end loop;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger update_match_scores_trigger
  after update on public.matches
  for each row
  execute function trigger_update_match_scores();


-- ==========================================
-- 6. FUNÇÃO RPC PARA ADMIN: RECALCULAR TODOS OS PONTOS
-- ==========================================
-- Esta função pode ser chamada via supabase.rpc('admin_recalculate_all_points')
-- pelo painel admin para corrigir inconsistências.
create or replace function public.admin_recalculate_all_points()
returns text as $$
declare
  m record;
  g record;
  updated_count integer := 0;
begin
  -- Apenas admins podem executar
  if not exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Acesso negado: apenas administradores podem executar esta função.';
  end if;

  -- Para cada jogo finalizado, recalcular os pontos de todos os palpites
  for m in select * from public.matches where status = 'finished' and home_score is not null and away_score is not null loop
    update public.guesses
    set points_awarded = calculate_guess_points(home_guess, away_guess, m.home_score, m.away_score)
    where match_id = m.id;
    updated_count := updated_count + 1;
  end loop;

  -- Recalcular pontos totais de todos os usuários
  for g in select distinct user_id from public.guesses loop
    perform recalculate_user_points(g.user_id);
  end loop;

  return 'Recálculo completo! ' || updated_count || ' jogos finalizados processados.';
end;
$$ language plpgsql security definer;
