// Script de verificação via REST API direta (sem WebSocket)
import https from 'https';

const SUPABASE_URL = 'https://cbbksknscnvzogmfltln.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYmtza25zY252em9nbWZsdGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NzA1MTIsImV4cCI6MjA5NjQ0NjUxMn0.hkwamiXdZusQGfJOXQUPAae0DgMItzHun2MElahY6Hk';

function get(path) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const opts = {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Accept': 'application/json',
        'Prefer': 'count=exact'
      }
    };
    https.get(url, opts, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function verificar() {
  console.log('\n🔍 Verificando migração do banco de dados...\n');

  // 1. Testa coluna guess_deadline
  const matches = await get('matches?select=id,guess_deadline&limit=1');
  if (matches.status === 200 || matches.status === 206) {
    console.log('✅ Coluna guess_deadline: EXISTS');
    const total = matches.headers['content-range'];
    console.log(`   Total de partidas: ${total ? total.split('/')[1] : 'N/A'}`);
  } else {
    console.log('❌ Coluna guess_deadline: ERRO →', matches.body?.message || matches.status);
    console.log('   ⚠️  Execute supabase_migration.sql no Supabase.');
  }

  // 2. Contagens
  const [mRes, pRes, gRes] = await Promise.all([
    get('matches?select=id&limit=1'),
    get('profiles?select=id&limit=1'),
    get('guesses?select=id&limit=1'),
  ]);

  const count = h => {
    const cr = h?.headers?.['content-range'];
    return cr ? cr.split('/')[1] : '?';
  };

  console.log(`\n📊 Contagens:`);
  console.log(`   Partidas:  ${count(mRes)}`);
  console.log(`   Usuários:  ${count(pRes)}`);
  console.log(`   Palpites:  ${count(gRes)}`);

  // 3. Admins
  const admins = await get('profiles?select=username,is_admin,total_points&is_admin=eq.true');
  if (admins.status === 200 && Array.isArray(admins.body) && admins.body.length > 0) {
    console.log(`\n👑 Admins encontrados:`);
    admins.body.forEach(a => console.log(`   @${a.username} — ${a.total_points} pts`));
  } else {
    console.log(`\n⚠️  Nenhum admin! Rode no Supabase:`);
    console.log(`   UPDATE public.profiles SET is_admin = true WHERE username = 'seu_username';`);
  }

  // 4. Palpites recentes
  const guesses = await get('guesses?select=match_id,home_guess,away_guess,points_awarded&limit=5&order=created_at.desc');
  if (guesses.status === 200 && Array.isArray(guesses.body) && guesses.body.length > 0) {
    console.log(`\n🎯 Palpites recentes:`);
    guesses.body.forEach(g => console.log(`   Jogo #${g.match_id}: ${g.home_guess}x${g.away_guess} → ${g.points_awarded ?? 'pendente'} pts`));
  }

  console.log(`\n📋 Status final:`);
  console.log(`   ${(matches.status === 200 || matches.status === 206) ? '✅' : '❌'} Migração (guess_deadline): ${(matches.status === 200 || matches.status === 206) ? 'OK' : 'PENDENTE'}`);
  console.log(`   ${count(mRes) > 0 ? '✅' : '⚠️ '} Partidas semeadas: ${count(mRes) > 0 ? 'Sim' : 'Não'}`);
  console.log(`   ${count(pRes) > 0 ? '✅' : '⚠️ '} Usuários cadastrados: ${count(pRes)}`);
  console.log(`   ${admins.body?.length > 0 ? '✅' : '⚠️ '} Admin configurado: ${admins.body?.length > 0 ? 'Sim' : 'Não'}`);
  console.log('');
}

verificar().catch(console.error);
