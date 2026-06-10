// Dados de Semente (Seed) das partidas da Fase de Grupos da Copa do Mundo 2026
// Total: 12 grupos (A a L), 4 seleções por grupo, 6 jogos por grupo = 72 jogos.

export const flagCodes = {
  'México': 'mx',
  'África do Sul': 'za',
  'Coreia do Sul': 'kr',
  'República Tcheca': 'cz',
  'Canadá': 'ca',
  'Bósnia e Herzegovina': 'ba',
  'Catar': 'qa',
  'Suíça': 'ch',
  'Brasil': 'br',
  'Marrocos': 'ma',
  'Haiti': 'ht',
  'Escócia': 'gb-sct',
  'Estados Unidos': 'us',
  'Paraguai': 'py',
  'Austrália': 'au',
  'Turquia': 'tr',
  'Alemanha': 'de',
  'Curaçao': 'cw',
  'Costa do Marfim': 'ci',
  'Equador': 'ec',
  'Holanda': 'nl',
  'Japão': 'jp',
  'Suécia': 'se',
  'Tunísia': 'tn',
  'Bélgica': 'be',
  'Egito': 'eg',
  'Irã': 'ir',
  'Nova Zelândia': 'nz',
  'Espanha': 'es',
  'Cabo Verde': 'cv',
  'Arábia Saudita': 'sa',
  'Uruguai': 'uy',
  'França': 'fr',
  'Senegal': 'sn',
  'Iraque': 'iq',
  'Noruega': 'no',
  'Argentina': 'ar',
  'Argélia': 'dz',
  'Áustria': 'at',
  'Jordânia': 'jo',
  'Portugal': 'pt',
  'RD Congo': 'cd',
  'Uzbequistão': 'uz',
  'Colômbia': 'co',
  'Inglaterra': 'gb-eng',
  'Croácia': 'hr',
  'Gana': 'gh',
  'Panamá': 'pa'
};

export const getFlagUrl = (teamName) => {
  const code = flagCodes[teamName];
  if (code) {
    return `https://flagcdn.com/w80/${code}.png`;
  }
  return 'https://flagcdn.com/w80/un.png'; // Bandeira genérica das Nações Unidas
};

const groupsData = {
  A: [
    { name: 'México' },
    { name: 'África do Sul' },
    { name: 'Coreia do Sul' },
    { name: 'República Tcheca' }
  ],
  B: [
    { name: 'Canadá' },
    { name: 'Bósnia e Herzegovina' },
    { name: 'Catar' },
    { name: 'Suíça' }
  ],
  C: [
    { name: 'Brasil' },
    { name: 'Marrocos' },
    { name: 'Haiti' },
    { name: 'Escócia' }
  ],
  D: [
    { name: 'Estados Unidos' },
    { name: 'Paraguai' },
    { name: 'Austrália' },
    { name: 'Turquia' }
  ],
  E: [
    { name: 'Alemanha' },
    { name: 'Curaçao' },
    { name: 'Costa do Marfim' },
    { name: 'Equador' }
  ],
  F: [
    { name: 'Holanda' },
    { name: 'Japão' },
    { name: 'Suécia' },
    { name: 'Tunísia' }
  ],
  G: [
    { name: 'Bélgica' },
    { name: 'Egito' },
    { name: 'Irã' },
    { name: 'Nova Zelândia' }
  ],
  H: [
    { name: 'Espanha' },
    { name: 'Cabo Verde' },
    { name: 'Arábia Saudita' },
    { name: 'Uruguai' }
  ],
  I: [
    { name: 'França' },
    { name: 'Senegal' },
    { name: 'Iraque' },
    { name: 'Noruega' }
  ],
  J: [
    { name: 'Argentina' },
    { name: 'Argélia' },
    { name: 'Áustria' },
    { name: 'Jordânia' }
  ],
  K: [
    { name: 'Portugal' },
    { name: 'RD Congo' },
    { name: 'Uzbequistão' },
    { name: 'Colômbia' }
  ],
  L: [
    { name: 'Inglaterra' },
    { name: 'Croácia' },
    { name: 'Gana' },
    { name: 'Panamá' }
  ]
};

// Gerador sistemático de partidas
export const generateMatches = () => {
  const matches = [];
  let matchId = 1;

  const groupKeys = Object.keys(groupsData);

  groupKeys.forEach((groupName, gIdx) => {
    const teams = groupsData[groupName];

    // Rodada 1 de Grupos
    // Jogo 1: Team 0 vs Team 1
    // Jogo 2: Team 2 vs Team 3
    const r1Date = new Date(`2026-06-11T00:00:00-03:00`);
    r1Date.setDate(r1Date.getDate() + Math.floor(gIdx / 2)); // 2 grupos por dia
    
    matches.push({
      id: matchId++,
      round: 'Fase de Grupos',
      group_name: groupName,
      home_team: teams[0].name,
      away_team: teams[1].name,
      home_team_flag: getFlagUrl(teams[0].name),
      away_team_flag: getFlagUrl(teams[1].name),
      status: 'scheduled',
      match_date: new Date(r1Date.setHours(gIdx % 2 === 0 ? 13 : 16, 0, 0)).toISOString()
    });

    matches.push({
      id: matchId++,
      round: 'Fase de Grupos',
      group_name: groupName,
      home_team: teams[2].name,
      away_team: teams[3].name,
      home_team_flag: getFlagUrl(teams[2].name),
      away_team_flag: getFlagUrl(teams[3].name),
      status: 'scheduled',
      match_date: new Date(r1Date.setHours(gIdx % 2 === 0 ? 19 : 21, 0, 0)).toISOString()
    });

    // Rodada 2 de Grupos
    // Jogo 3: Team 0 vs Team 2
    // Jogo 4: Team 1 vs Team 3
    const r2Date = new Date(`2026-06-17T00:00:00-03:00`);
    r2Date.setDate(r2Date.getDate() + Math.floor(gIdx / 2));

    matches.push({
      id: matchId++,
      round: 'Fase de Grupos',
      group_name: groupName,
      home_team: teams[0].name,
      away_team: teams[2].name,
      home_team_flag: getFlagUrl(teams[0].name),
      away_team_flag: getFlagUrl(teams[2].name),
      status: 'scheduled',
      match_date: new Date(r2Date.setHours(gIdx % 2 === 0 ? 13 : 16, 0, 0)).toISOString()
    });

    matches.push({
      id: matchId++,
      round: 'Fase de Grupos',
      group_name: groupName,
      home_team: teams[1].name,
      away_team: teams[3].name,
      home_team_flag: getFlagUrl(teams[1].name),
      away_team_flag: getFlagUrl(teams[3].name),
      status: 'scheduled',
      match_date: new Date(r2Date.setHours(gIdx % 2 === 0 ? 19 : 21, 0, 0)).toISOString()
    });

    // Rodada 3 de Grupos
    // Jogo 5: Team 3 vs Team 0
    // Jogo 6: Team 1 vs Team 2
    const r3Date = new Date(`2026-06-23T00:00:00-03:00`);
    r3Date.setDate(r3Date.getDate() + Math.floor(gIdx / 2));

    const simHour = gIdx % 2 === 0 ? 16 : 20;

    matches.push({
      id: matchId++,
      round: 'Fase de Grupos',
      group_name: groupName,
      home_team: teams[3].name,
      away_team: teams[0].name,
      home_team_flag: getFlagUrl(teams[3].name),
      away_team_flag: getFlagUrl(teams[0].name),
      status: 'scheduled',
      match_date: new Date(r3Date.setHours(simHour, 0, 0)).toISOString()
    });

    matches.push({
      id: matchId++,
      round: 'Fase de Grupos',
      group_name: groupName,
      home_team: teams[1].name,
      away_team: teams[2].name,
      home_team_flag: getFlagUrl(teams[1].name),
      away_team_flag: getFlagUrl(teams[2].name),
      status: 'scheduled',
      match_date: new Date(r3Date.setHours(simHour, 0, 0)).toISOString()
    });
  });

  // Ajuste especial para o jogo do Brasil na Rodada 1
  const brasilMatch1 = matches.find(m => m.home_team === 'Brasil' && m.away_team === 'Marrocos');
  if (brasilMatch1) {
    brasilMatch1.match_date = new Date('2026-06-13T19:00:00-03:00').toISOString();
  }

  const brasilMatch2 = matches.find(m => m.home_team === 'Brasil' && m.away_team === 'Haiti');
  if (brasilMatch2) {
    brasilMatch2.match_date = new Date('2026-06-19T21:30:00-03:00').toISOString();
  }

  const brasilMatch3 = matches.find(m => m.home_team === 'Escócia' && m.away_team === 'Brasil');
  if (brasilMatch3) {
    brasilMatch3.match_date = new Date('2026-06-24T19:00:00-03:00').toISOString();
  }

  // Ajuste do jogo de abertura
  const openingMatch = matches.find(m => m.home_team === 'México' && m.away_team === 'África do Sul');
  if (openingMatch) {
    openingMatch.match_date = new Date('2026-06-11T13:00:00-06:00').toISOString();
  }

  // Ajuste especial para o Canadá x Bósnia e Catar x Suíça (Dia 12/06)
  const canadaMatch1 = matches.find(m => m.home_team === 'Canadá' && m.away_team === 'Bósnia e Herzegovina');
  if (canadaMatch1) {
    canadaMatch1.match_date = new Date('2026-06-12T16:00:00-03:00').toISOString();
  }

  const qatarMatch1 = matches.find(m => m.home_team === 'Catar' && m.away_team === 'Suíça');
  if (qatarMatch1) {
    qatarMatch1.match_date = new Date('2026-06-12T21:00:00-03:00').toISOString();
  }

  return matches;
};
