import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carregar variáveis do .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runFlow() {
  const email = `tester_${Date.now()}@example.com`;
  const password = 'Password123!';
  const username = `tester_${Date.now()}`;

  console.log('1. Cadastrando usuário de teste:', email);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });

  if (signUpError) {
    console.error('Erro no cadastro:', signUpError);
    return;
  }
  
  const user = signUpData.user;
  console.log('Usuário cadastrado com ID:', user.id);

  // Esperar 2 segundos para o trigger do Supabase criar o perfil
  console.log('Aguardando 2 segundos para criação do perfil...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Verificar se o perfil foi criado
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (pError) {
    console.error('Erro ao verificar perfil:', pError);
    return;
  }
  console.log('Perfil criado com sucesso:', profile);

  console.log('2. Tentando fazer palpite no jogo #1...');
  const { data: guessData, error: guessError } = await supabase
    .from('guesses')
    .insert({
      user_id: user.id,
      match_id: 1,
      home_guess: 2,
      away_guess: 1
    })
    .select();

  if (guessError) {
    console.error('Erro ao salvar palpite:', guessError);
  } else {
    console.log('Palpite salvo com sucesso!', guessData);
  }
}

runFlow();
