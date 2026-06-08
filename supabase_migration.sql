-- ==========================================
-- MIGRAÇÃO - Bolão Copa 2026
-- Execute este script se você já tem o banco criado
-- e quer apenas adicionar as novas funcionalidades
-- SEM perder os dados existentes.
-- ==========================================

-- 1. Adicionar coluna guess_deadline (prazo de palpite) se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'matches'
    AND column_name = 'guess_deadline'
  ) THEN
    ALTER TABLE public.matches ADD COLUMN guess_deadline timestamp with time zone;
    RAISE NOTICE 'Coluna guess_deadline adicionada com sucesso.';
  ELSE
    RAISE NOTICE 'Coluna guess_deadline já existe, pulando.';
  END IF;
END $$;


-- 2. Adicionar política de INSERT para profiles (necessário para criação de perfil pelo frontend)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'Usuários podem criar seu próprio perfil'
  ) THEN
    EXECUTE '
      CREATE POLICY "Usuários podem criar seu próprio perfil"
        ON public.profiles FOR INSERT
        WITH CHECK (auth.uid() = id)
    ';
    RAISE NOTICE 'Política de INSERT para profiles criada.';
  END IF;
END $$;


-- 3. Atualizar RLS de palpites para usar guess_deadline
-- (Recria as políticas de SELECT/INSERT/UPDATE/DELETE com a nova lógica)

DROP POLICY IF EXISTS "Inserir próprios palpites antes do jogo começar" ON public.guesses;
DROP POLICY IF EXISTS "Atualizar próprios palpites antes do jogo começar" ON public.guesses;
DROP POLICY IF EXISTS "Deletar próprios palpites antes do jogo começar" ON public.guesses;
DROP POLICY IF EXISTS "Ver palpites próprios ou de outros pós-início" ON public.guesses;
DROP POLICY IF EXISTS "Inserir próprios palpites antes do prazo" ON public.guesses;
DROP POLICY IF EXISTS "Atualizar próprios palpites antes do prazo" ON public.guesses;
DROP POLICY IF EXISTS "Deletar próprios palpites antes do prazo" ON public.guesses;

CREATE POLICY "Ver palpites próprios ou de outros pós-início"
  ON public.guesses FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = guesses.match_id
      AND matches.match_date <= now()
    )
  );

CREATE POLICY "Inserir próprios palpites antes do prazo"
  ON public.guesses FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = guesses.match_id
      AND coalesce(matches.guess_deadline, matches.match_date) > now()
    )
  );

CREATE POLICY "Atualizar próprios palpites antes do prazo"
  ON public.guesses FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = guesses.match_id
      AND coalesce(matches.guess_deadline, matches.match_date) > now()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = guesses.match_id
      AND coalesce(matches.guess_deadline, matches.match_date) > now()
    )
  );

CREATE POLICY "Deletar próprios palpites antes do prazo"
  ON public.guesses FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = guesses.match_id
      AND coalesce(matches.guess_deadline, matches.match_date) > now()
    )
  );


-- 4. Atualizar função de pontuação:
--    Empates no resultado real = mínimo 1 ponto para qualquer palpite
--    (antes era 0 para quem palpitou vencedor quando deu empate)
CREATE OR REPLACE FUNCTION calculate_guess_points(
  h_guess integer,
  a_guess integer,
  h_score integer,
  a_score integer
) RETURNS integer AS $$
DECLARE
  guess_diff integer;
  actual_diff integer;
  guess_winner integer;
  actual_winner integer;
BEGIN
  IF h_guess IS NULL OR a_guess IS NULL OR h_score IS NULL OR a_score IS NULL THEN
    RETURN 0;
  END IF;

  -- 1. Acerto Exato do Placar (10 pontos)
  IF h_guess = h_score AND a_guess = a_score THEN
    RETURN 10;
  END IF;

  guess_diff  := h_guess - a_guess;
  actual_diff := h_score - a_score;

  IF guess_diff > 0  THEN guess_winner := 1;
  ELSIF guess_diff < 0 THEN guess_winner := -1;
  ELSE guess_winner := 0;
  END IF;

  IF actual_diff > 0  THEN actual_winner := 1;
  ELSIF actual_diff < 0 THEN actual_winner := -1;
  ELSE actual_winner := 0;
  END IF;

  -- 2. Acerto de Empate Não Exato (5 pontos)
  IF guess_winner = 0 AND actual_winner = 0 THEN
    RETURN 5;
  END IF;

  -- 3. Empate real mas palpitou vencedor (ou vice-versa): mínimo 1 ponto
  --    Empates são difíceis de prever — ninguém fica zerado
  IF actual_winner = 0 OR guess_winner = 0 THEN
    RETURN 1;
  END IF;

  -- Acertou quem venceu
  IF guess_winner = actual_winner THEN
    -- 4. Vencedor + Saldo de Gols (7 pontos)
    IF guess_diff = actual_diff THEN
      RETURN 7;
    END IF;
    -- 5. Vencedor + Gols de um Time (5 pontos)
    IF h_guess = h_score OR a_guess = a_score THEN
      RETURN 5;
    END IF;
    -- 6. Vencedor Apenas (3 pontos)
    RETURN 3;
  END IF;

  -- 7. Erro total (0 pontos)
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- 5. Recriar função RPC para admins (security definer para recalcular)
CREATE OR REPLACE FUNCTION public.admin_recalculate_all_points()
RETURNS text AS $$
DECLARE
  m record;
  g record;
  updated_count integer := 0;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem executar esta função.';
  END IF;

  FOR m IN SELECT * FROM public.matches WHERE status = 'finished' AND home_score IS NOT NULL AND away_score IS NOT NULL LOOP
    UPDATE public.guesses
    SET points_awarded = calculate_guess_points(home_guess, away_guess, m.home_score, m.away_score)
    WHERE match_id = m.id;
    updated_count := updated_count + 1;
  END LOOP;

  FOR g IN SELECT DISTINCT user_id FROM public.guesses LOOP
    PERFORM recalculate_user_points(g.user_id);
  END LOOP;

  RETURN 'Recálculo completo! ' || updated_count || ' jogos finalizados processados.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. Adicionar coluna pts7_count nos perfis para critério de desempate se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'pts7_count'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN pts7_count integer NOT NULL DEFAULT 0;
    RAISE NOTICE 'Coluna pts7_count adicionada com sucesso.';
  ELSE
    RAISE NOTICE 'Coluna pts7_count já existe, pulando.';
  END IF;
END $$;


-- 7. Atualizar a função que recalcula pontos do usuário para incluir pts7_count
DROP FUNCTION IF EXISTS public.recalculate_user_points(uuid);
DROP FUNCTION IF EXISTS public.recalculate_user_points(p_user_id uuid);

CREATE OR REPLACE FUNCTION public.recalculate_user_points(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_points       = COALESCE((SELECT SUM(points_awarded) FROM public.guesses WHERE user_id = p_user_id AND points_awarded IS NOT NULL), 0),
    exact_scores_count = COALESCE((SELECT COUNT(*)            FROM public.guesses WHERE user_id = p_user_id AND points_awarded = 10), 0),
    pts7_count         = COALESCE((SELECT COUNT(*)            FROM public.guesses WHERE user_id = p_user_id AND points_awarded = 7), 0)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 8. Verificação final
SELECT
  (SELECT COUNT(*) FROM public.matches)  AS total_jogos,
  (SELECT COUNT(*) FROM public.profiles) AS total_usuarios,
  (SELECT COUNT(*) FROM public.guesses)  AS total_palpites;
