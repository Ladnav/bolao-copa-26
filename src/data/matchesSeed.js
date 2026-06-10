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
  const makeBrtDate = (day, hour, minute = 0) => {
    const pad = (num) => String(num).padStart(2, '0');
    return new Date(`2026-06-${pad(day)}T${pad(hour)}:${pad(minute)}:00-03:00`).toISOString();
  };

  const groupSchedule = [
    // Grupo A (0)
    { r1Day1: 11, r1Hour1: 16, r1Day2: 11, r1Hour2: 19, r2Day1: 18, r2Hour1: 16, r2Day2: 18, r2Hour2: 19, r3Day1: 24, r3Hour1: 16, r3Day2: 24, r3Hour2: 16 },
    // Grupo B (1)
    { r1Day1: 12, r1Hour1: 16, r1Day2: 12, r1Hour2: 21, r2Day1: 18, r2Hour1: 16, r2Day2: 18, r2Hour2: 21, r3Day1: 24, r3Hour1: 20, r3Day2: 24, r3Hour2: 20 },
    // Grupo C (2)
    { r1Day1: 13, r1Hour1: 19, r1Day2: 13, r1Hour2: 22, r2Day1: 19, r2Hour1: 21, r2Day2: 19, r2Hour2: 19, r3Day1: 24, r3Hour1: 19, r3Day2: 24, r3Hour2: 19, hasMinutes: true },
    // Grupo D (3)
    { r1Day1: 12, r1Hour1: 22, r1Day2: 14, r1Hour2: 1, r2Day1: 19, r2Hour1: 16, r2Day2: 20, r2Hour2: 19, r3Day1: 25, r3Hour1: 20, r3Day2: 25, r3Hour2: 20 },
    // Grupo E (4)
    { r1Day1: 14, r1Hour1: 13, r1Day2: 14, r1Hour2: 19, r2Day1: 20, r2Hour1: 13, r2Day2: 20, r2Hour2: 19, r3Day1: 25, r3Hour1: 16, r3Day2: 25, r3Hour2: 16 },
    // Grupo F (5)
    { r1Day1: 14, r1Hour1: 16, r1Day2: 14, r1Hour2: 21, r2Day1: 20, r2Hour1: 16, r2Day2: 20, r2Hour2: 21, r3Day1: 25, r3Hour1: 20, r3Day2: 25, r3Hour2: 20 },
    // Grupo G (6)
    { r1Day1: 15, r1Hour1: 13, r1Day2: 15, r1Hour2: 19, r2Day1: 21, r2Hour1: 13, r2Day2: 21, r2Hour2: 19, r3Day1: 26, r3Hour1: 16, r3Day2: 26, r3Hour2: 16 },
    // Grupo H (7)
    { r1Day1: 15, r1Hour1: 16, r1Day2: 15, r1Hour2: 21, r2Day1: 21, r2Hour1: 16, r2Day2: 21, r2Hour2: 21, r3Day1: 26, r3Hour1: 20, r3Day2: 26, r3Hour2: 20 },
    // Grupo I (8)
    { r1Day1: 16, r1Hour1: 13, r1Day2: 16, r1Hour2: 19, r2Day1: 22, r2Hour1: 13, r2Day2: 22, r2Hour2: 19, r3Day1: 26, r3Hour1: 16, r3Day2: 26, r3Hour2: 16 },
    // Grupo J (9)
    { r1Day1: 16, r1Hour1: 16, r1Day2: 16, r1Hour2: 21, r2Day1: 22, r2Hour1: 16, r2Day2: 22, r2Hour2: 21, r3Day1: 27, r3Hour1: 20, r3Day2: 27, r3Hour2: 20 },
    // Grupo K (10)
    { r1Day1: 17, r1Hour1: 13, r1Day2: 17, r1Hour2: 19, r2Day1: 23, r2Hour1: 13, r2Day2: 23, r2Hour2: 19, r3Day1: 27, r3Hour1: 16, r3Day2: 27, r3Hour2: 16 },
    // Grupo L (11)
    { r1Day1: 17, r1Hour1: 16, r1Day2: 17, r1Hour2: 21, r2Day1: 23, r2Hour1: 16, r2Day2: 23, r2Hour2: 21, r3Day1: 27, r3Hour1: 20, r3Day2: 27, r3Hour2: 20 }
  ];

  const matches = [];
  let matchId = 1;

  const groupKeys = Object.keys(groupsData);

  groupKeys.forEach((groupName, gIdx) => {
    const teams = groupsData[groupName];
    const sched = groupSchedule[gIdx];

    // Rodada 1 de Grupos
    matches.push({
      id: matchId++,
      round: 'Fase de Grupos',
      group_name: groupName,
      home_team: teams[0].name,
      away_team: teams[1].name,
      home_team_flag: getFlagUrl(teams[0].name),
      away_team_flag: getFlagUrl(teams[1].name),
      status: 'scheduled',
      match_date: makeBrtDate(sched.r1Day1, sched.r1Hour1)
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
      match_date: makeBrtDate(sched.r1Day2, sched.r1Hour2)
    });

    // Rodada 2 de Grupos
    matches.push({
      id: matchId++,
      round: 'Fase de Grupos',
      group_name: groupName,
      home_team: teams[0].name,
      away_team: teams[2].name,
      home_team_flag: getFlagUrl(teams[0].name),
      away_team_flag: getFlagUrl(teams[2].name),
      status: 'scheduled',
      match_date: makeBrtDate(sched.r2Day1, sched.r2Hour1, sched.hasMinutes ? 30 : 0)
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
      match_date: makeBrtDate(sched.r2Day2, sched.r2Hour2)
    });

    // Rodada 3 de Grupos
    matches.push({
      id: matchId++,
      round: 'Fase de Grupos',
      group_name: groupName,
      home_team: teams[3].name,
      away_team: teams[0].name,
      home_team_flag: getFlagUrl(teams[3].name),
      away_team_flag: getFlagUrl(teams[0].name),
      status: 'scheduled',
      match_date: makeBrtDate(sched.r3Day1, sched.r3Hour1)
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
      match_date: makeBrtDate(sched.r3Day2, sched.r3Hour2)
    });
  });

  return matches;
};
