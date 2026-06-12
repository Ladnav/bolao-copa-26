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

// Lista estática de datas/horários oficiais convertidos para Brasília Time (GMT-3)
const matchesData = [
  { id: 1, group: 'A', home: 'México', away: 'África do Sul', time: '2026-06-11T19:00:00Z' },
  { id: 2, group: 'A', home: 'Coreia do Sul', away: 'República Tcheca', time: '2026-06-12T02:00:00Z' },
  { id: 3, group: 'A', home: 'México', away: 'Coreia do Sul', time: '2026-06-19T01:00:00Z' },
  { id: 4, group: 'A', home: 'África do Sul', away: 'República Tcheca', time: '2026-06-18T16:00:00Z' },
  { id: 5, group: 'A', home: 'República Tcheca', away: 'México', time: '2026-06-25T01:00:00Z' },
  { id: 6, group: 'A', home: 'África do Sul', away: 'Coreia do Sul', time: '2026-06-25T01:00:00Z' },
  { id: 7, group: 'B', home: 'Canadá', away: 'Bósnia e Herzegovina', time: '2026-06-12T19:00:00Z' },
  { id: 8, group: 'B', home: 'Catar', away: 'Suíça', time: '2026-06-13T19:00:00Z' },
  { id: 9, group: 'B', home: 'Canadá', away: 'Catar', time: '2026-06-18T22:00:00Z' },
  { id: 10, group: 'B', home: 'Bósnia e Herzegovina', away: 'Suíça', time: '2026-06-18T19:00:00Z' },
  { id: 11, group: 'B', home: 'Suíça', away: 'Canadá', time: '2026-06-24T19:00:00Z' },
  { id: 12, group: 'B', home: 'Bósnia e Herzegovina', away: 'Catar', time: '2026-06-24T19:00:00Z' },
  { id: 13, group: 'C', home: 'Brasil', away: 'Marrocos', time: '2026-06-13T22:00:00Z' },
  { id: 14, group: 'C', home: 'Haiti', away: 'Escócia', time: '2026-06-14T01:00:00Z' },
  { id: 15, group: 'C', home: 'Brasil', away: 'Haiti', time: '2026-06-20T00:30:00Z' },
  { id: 16, group: 'C', home: 'Marrocos', away: 'Escócia', time: '2026-06-19T22:00:00Z' },
  { id: 17, group: 'C', home: 'Escócia', away: 'Brasil', time: '2026-06-24T22:00:00Z' },
  { id: 18, group: 'C', home: 'Marrocos', away: 'Haiti', time: '2026-06-24T22:00:00Z' },
  { id: 19, group: 'D', home: 'Estados Unidos', away: 'Paraguai', time: '2026-06-13T01:00:00Z' },
  { id: 20, group: 'D', home: 'Austrália', away: 'Turquia', time: '2026-06-14T04:00:00Z' },
  { id: 21, group: 'D', home: 'Estados Unidos', away: 'Austrália', time: '2026-06-19T19:00:00Z' },
  { id: 22, group: 'D', home: 'Paraguai', away: 'Turquia', time: '2026-06-20T03:00:00Z' },
  { id: 23, group: 'D', home: 'Turquia', away: 'Estados Unidos', time: '2026-06-26T02:00:00Z' },
  { id: 24, group: 'D', home: 'Paraguai', away: 'Austrália', time: '2026-06-26T02:00:00Z' },
  { id: 25, group: 'E', home: 'Alemanha', away: 'Curaçao', time: '2026-06-14T17:00:00Z' },
  { id: 26, group: 'E', home: 'Costa do Marfim', away: 'Equador', time: '2026-06-14T23:00:00Z' },
  { id: 27, group: 'E', home: 'Alemanha', away: 'Costa do Marfim', time: '2026-06-20T20:00:00Z' },
  { id: 28, group: 'E', home: 'Curaçao', away: 'Equador', time: '2026-06-21T00:00:00Z' },
  { id: 29, group: 'E', home: 'Equador', away: 'Alemanha', time: '2026-06-25T20:00:00Z' },
  { id: 30, group: 'E', home: 'Curaçao', away: 'Costa do Marfim', time: '2026-06-25T20:00:00Z' },
  { id: 31, group: 'F', home: 'Holanda', away: 'Japão', time: '2026-06-14T20:00:00Z' },
  { id: 32, group: 'F', home: 'Suécia', away: 'Tunísia', time: '2026-06-15T02:00:00Z' },
  { id: 33, group: 'F', home: 'Holanda', away: 'Suécia', time: '2026-06-20T17:00:00Z' },
  { id: 34, group: 'F', home: 'Japão', away: 'Tunísia', time: '2026-06-21T04:00:00Z' },
  { id: 35, group: 'F', home: 'Tunísia', away: 'Holanda', time: '2026-06-25T23:00:00Z' },
  { id: 36, group: 'F', home: 'Japão', away: 'Suécia', time: '2026-06-25T23:00:00Z' },
  { id: 37, group: 'G', home: 'Bélgica', away: 'Egito', time: '2026-06-15T19:00:00Z' },
  { id: 38, group: 'G', home: 'Irã', away: 'Nova Zelândia', time: '2026-06-16T01:00:00Z' },
  { id: 39, group: 'G', home: 'Bélgica', away: 'Irã', time: '2026-06-21T19:00:00Z' },
  { id: 40, group: 'G', home: 'Egito', away: 'Nova Zelândia', time: '2026-06-22T01:00:00Z' },
  { id: 41, group: 'G', home: 'Nova Zelândia', away: 'Bélgica', time: '2026-06-27T03:00:00Z' },
  { id: 42, group: 'G', home: 'Egito', away: 'Irã', time: '2026-06-27T03:00:00Z' },
  { id: 43, group: 'H', home: 'Espanha', away: 'Cabo Verde', time: '2026-06-15T16:00:00Z' },
  { id: 44, group: 'H', home: 'Arábia Saudita', away: 'Uruguai', time: '2026-06-15T22:00:00Z' },
  { id: 45, group: 'H', home: 'Espanha', away: 'Arábia Saudita', time: '2026-06-21T16:00:00Z' },
  { id: 46, group: 'H', home: 'Cabo Verde', away: 'Uruguai', time: '2026-06-21T22:00:00Z' },
  { id: 47, group: 'H', home: 'Uruguai', away: 'Espanha', time: '2026-06-27T00:00:00Z' },
  { id: 48, group: 'H', home: 'Cabo Verde', away: 'Arábia Saudita', time: '2026-06-27T00:00:00Z' },
  { id: 49, group: 'I', home: 'França', away: 'Senegal', time: '2026-06-16T19:00:00Z' },
  { id: 50, group: 'I', home: 'Iraque', away: 'Noruega', time: '2026-06-16T22:00:00Z' },
  { id: 51, group: 'I', home: 'França', away: 'Iraque', time: '2026-06-22T21:00:00Z' },
  { id: 52, group: 'I', home: 'Senegal', away: 'Noruega', time: '2026-06-23T00:00:00Z' },
  { id: 53, group: 'I', home: 'Noruega', away: 'França', time: '2026-06-26T19:00:00Z' },
  { id: 54, group: 'I', home: 'Senegal', away: 'Iraque', time: '2026-06-26T19:00:00Z' },
  { id: 55, group: 'J', home: 'Argentina', away: 'Argélia', time: '2026-06-17T01:00:00Z' },
  { id: 56, group: 'J', home: 'Áustria', away: 'Jordânia', time: '2026-06-17T04:00:00Z' },
  { id: 57, group: 'J', home: 'Argentina', away: 'Áustria', time: '2026-06-22T17:00:00Z' },
  { id: 58, group: 'J', home: 'Argélia', away: 'Jordânia', time: '2026-06-23T03:00:00Z' },
  { id: 59, group: 'J', home: 'Jordânia', away: 'Argentina', time: '2026-06-28T02:00:00Z' },
  { id: 60, group: 'J', home: 'Argélia', away: 'Áustria', time: '2026-06-28T02:00:00Z' },
  { id: 61, group: 'K', home: 'Portugal', away: 'RD Congo', time: '2026-06-17T17:00:00Z' },
  { id: 62, group: 'K', home: 'Uzbequistão', away: 'Colômbia', time: '2026-06-18T02:00:00Z' },
  { id: 63, group: 'K', home: 'Portugal', away: 'Uzbequistão', time: '2026-06-23T17:00:00Z' },
  { id: 64, group: 'K', home: 'RD Congo', away: 'Colômbia', time: '2026-06-24T02:00:00Z' },
  { id: 65, group: 'K', home: 'Colômbia', away: 'Portugal', time: '2026-06-27T23:30:00Z' },
  { id: 66, group: 'K', home: 'RD Congo', away: 'Uzbequistão', time: '2026-06-27T23:30:00Z' },
  { id: 67, group: 'L', home: 'Inglaterra', away: 'Croácia', time: '2026-06-17T20:00:00Z' },
  { id: 68, group: 'L', home: 'Gana', away: 'Panamá', time: '2026-06-17T23:00:00Z' },
  { id: 69, group: 'L', home: 'Inglaterra', away: 'Gana', time: '2026-06-23T20:00:00Z' },
  { id: 70, group: 'L', home: 'Croácia', away: 'Panamá', time: '2026-06-23T23:00:00Z' },
  { id: 71, group: 'L', home: 'Panamá', away: 'Inglaterra', time: '2026-06-27T21:00:00Z' },
  { id: 72, group: 'L', home: 'Croácia', away: 'Gana', time: '2026-06-27T21:00:00Z' },
];

export const generateMatches = () => {
  return matchesData.map(m => ({
    id: m.id,
    round: 'Fase de Grupos',
    group_name: m.group,
    home_team: m.home,
    away_team: m.away,
    home_team_flag: getFlagUrl(m.home),
    away_team_flag: getFlagUrl(m.away),
    status: 'scheduled',
    match_date: m.time
  }));
};
