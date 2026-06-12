// Dados estáticos sobre as seleções para enriquecer a UI (Tooltip)
// Fonte: Ranking da FIFA e Histórico de Copas

import { translateTeamName } from './teamNameMap';

export const TEAM_STATS = {
  // CONMEBOL
  'brazil': { fifaRanking: 5, titles: 5, confederation: 'CONMEBOL' },
  'argentina': { fifaRanking: 1, titles: 3, confederation: 'CONMEBOL' },
  'uruguay': { fifaRanking: 11, titles: 2, confederation: 'CONMEBOL' },
  'colombia': { fifaRanking: 14, titles: 0, confederation: 'CONMEBOL' },
  'ecuador': { fifaRanking: 31, titles: 0, confederation: 'CONMEBOL' },
  'peru': { fifaRanking: 33, titles: 0, confederation: 'CONMEBOL' },
  'chile': { fifaRanking: 42, titles: 0, confederation: 'CONMEBOL' },
  'paraguay': { fifaRanking: 56, titles: 0, confederation: 'CONMEBOL' },
  'venezuela': { fifaRanking: 52, titles: 0, confederation: 'CONMEBOL' },
  'bolivia': { fifaRanking: 86, titles: 0, confederation: 'CONMEBOL' },

  // UEFA
  'germany': { fifaRanking: 16, titles: 4, confederation: 'UEFA' },
  'italy': { fifaRanking: 9, titles: 4, confederation: 'UEFA' },
  'france': { fifaRanking: 2, titles: 2, confederation: 'UEFA' },
  'spain': { fifaRanking: 8, titles: 1, confederation: 'UEFA' },
  'england': { fifaRanking: 3, titles: 1, confederation: 'UEFA' },
  'belgium': { fifaRanking: 4, titles: 0, confederation: 'UEFA' },
  'netherlands': { fifaRanking: 6, titles: 0, confederation: 'UEFA' },
  'portugal': { fifaRanking: 7, titles: 0, confederation: 'UEFA' },
  'croatia': { fifaRanking: 10, titles: 0, confederation: 'UEFA' },
  'serbia': { fifaRanking: 32, titles: 0, confederation: 'UEFA' },
  'poland': { fifaRanking: 30, titles: 0, confederation: 'UEFA' },
  'denmark': { fifaRanking: 21, titles: 0, confederation: 'UEFA' },
  'switzerland': { fifaRanking: 19, titles: 0, confederation: 'UEFA' },
  'bosnia and herzegovina': { fifaRanking: 71, titles: 0, confederation: 'UEFA' },
  'bosnia': { fifaRanking: 71, titles: 0, confederation: 'UEFA' },
  'czech republic': { fifaRanking: 36, titles: 0, confederation: 'UEFA' },
  'scotland': { fifaRanking: 39, titles: 0, confederation: 'UEFA' },
  'sweden': { fifaRanking: 27, titles: 0, confederation: 'UEFA' },
  'norway': { fifaRanking: 47, titles: 0, confederation: 'UEFA' },
  'austria': { fifaRanking: 25, titles: 0, confederation: 'UEFA' },
  'turkey': { fifaRanking: 35, titles: 0, confederation: 'UEFA' },
  'wales': { fifaRanking: 29, titles: 0, confederation: 'UEFA' },
  'ukraine': { fifaRanking: 22, titles: 0, confederation: 'UEFA' },
  'republic of ireland': { fifaRanking: 60, titles: 0, confederation: 'UEFA' },
  'northern ireland': { fifaRanking: 73, titles: 0, confederation: 'UEFA' },
  'slovakia': { fifaRanking: 48, titles: 0, confederation: 'UEFA' },
  'slovenia': { fifaRanking: 55, titles: 0, confederation: 'UEFA' },
  'romania': { fifaRanking: 45, titles: 0, confederation: 'UEFA' },
  'greece': { fifaRanking: 50, titles: 0, confederation: 'UEFA' },
  'iceland': { fifaRanking: 72, titles: 0, confederation: 'UEFA' },
  'finland': { fifaRanking: 61, titles: 0, confederation: 'UEFA' },
  'albania': { fifaRanking: 66, titles: 0, confederation: 'UEFA' },
  'georgia': { fifaRanking: 75, titles: 0, confederation: 'UEFA' },
  'hungary': { fifaRanking: 27, titles: 0, confederation: 'UEFA' },

  // CONCACAF
  'usa': { fifaRanking: 13, titles: 0, confederation: 'CONCACAF' },
  'mexico': { fifaRanking: 15, titles: 0, confederation: 'CONCACAF' },
  'canada': { fifaRanking: 50, titles: 0, confederation: 'CONCACAF' },
  'costa rica': { fifaRanking: 54, titles: 0, confederation: 'CONCACAF' },
  'panama': { fifaRanking: 44, titles: 0, confederation: 'CONCACAF' },
  'haiti': { fifaRanking: 90, titles: 0, confederation: 'CONCACAF' },
  'curacao': { fifaRanking: 90, titles: 0, confederation: 'CONCACAF' },
  'jamaica': { fifaRanking: 55, titles: 0, confederation: 'CONCACAF' },
  'honduras': { fifaRanking: 78, titles: 0, confederation: 'CONCACAF' },
  'el salvador': { fifaRanking: 81, titles: 0, confederation: 'CONCACAF' },
  'nicaragua': { fifaRanking: 135, titles: 0, confederation: 'CONCACAF' },
  'trinidad and tobago': { fifaRanking: 98, titles: 0, confederation: 'CONCACAF' },
  'dominican republic': { fifaRanking: 150, titles: 0, confederation: 'CONCACAF' },
  'cuba': { fifaRanking: 169, titles: 0, confederation: 'CONCACAF' },
  'guatemala': { fifaRanking: 108, titles: 0, confederation: 'CONCACAF' },

  // CAF (África)
  'senegal': { fifaRanking: 17, titles: 0, confederation: 'CAF' },
  'morocco': { fifaRanking: 12, titles: 0, confederation: 'CAF' },
  'nigeria': { fifaRanking: 28, titles: 0, confederation: 'CAF' },
  'cameroon': { fifaRanking: 51, titles: 0, confederation: 'CAF' },
  'egypt': { fifaRanking: 36, titles: 0, confederation: 'CAF' },
  'ghana': { fifaRanking: 67, titles: 0, confederation: 'CAF' },
  'algeria': { fifaRanking: 43, titles: 0, confederation: 'CAF' },
  'south africa': { fifaRanking: 58, titles: 0, confederation: 'CAF' },
  'ivory coast': { fifaRanking: 38, titles: 0, confederation: 'CAF' },
  'tunisia': { fifaRanking: 41, titles: 0, confederation: 'CAF' },
  'cape verde': { fifaRanking: 65, titles: 0, confederation: 'CAF' },
  'republic of congo': { fifaRanking: 111, titles: 0, confederation: 'CAF' },
  'dr congo': { fifaRanking: 63, titles: 0, confederation: 'CAF' },
  'mali': { fifaRanking: 44, titles: 0, confederation: 'CAF' },
  'angola': { fifaRanking: 92, titles: 0, confederation: 'CAF' },
  'mozambique': { fifaRanking: 110, titles: 0, confederation: 'CAF' },
  'tanzania': { fifaRanking: 119, titles: 0, confederation: 'CAF' },
  'kenya': { fifaRanking: 107, titles: 0, confederation: 'CAF' },
  'equatorial guinea': { fifaRanking: 79, titles: 0, confederation: 'CAF' },
  'burkina faso': { fifaRanking: 62, titles: 0, confederation: 'CAF' },
  'namibia': { fifaRanking: 106, titles: 0, confederation: 'CAF' },
  'comoros': { fifaRanking: 117, titles: 0, confederation: 'CAF' },
  'guinea-bissau': { fifaRanking: 116, titles: 0, confederation: 'CAF' },
  'ethiopia': { fifaRanking: 145, titles: 0, confederation: 'CAF' },
  'zambia': { fifaRanking: 87, titles: 0, confederation: 'CAF' },

  // AFC / OFC (Ásia e Oceania)
  'japan': { fifaRanking: 18, titles: 0, confederation: 'AFC' },
  'south korea': { fifaRanking: 22, titles: 0, confederation: 'AFC' },
  'australia': { fifaRanking: 23, titles: 0, confederation: 'AFC' },
  'iran': { fifaRanking: 20, titles: 0, confederation: 'AFC' },
  'saudi arabia': { fifaRanking: 53, titles: 0, confederation: 'AFC' },
  'qatar': { fifaRanking: 34, titles: 0, confederation: 'AFC' },
  'new zealand': { fifaRanking: 104, titles: 0, confederation: 'OFC' },
  'iraq': { fifaRanking: 58, titles: 0, confederation: 'AFC' },
  'jordan': { fifaRanking: 71, titles: 0, confederation: 'AFC' },
  'uzbekistan': { fifaRanking: 64, titles: 0, confederation: 'AFC' },
  'north korea': { fifaRanking: 118, titles: 0, confederation: 'AFC' },
  'oman': { fifaRanking: 77, titles: 0, confederation: 'AFC' },
  'bahrain': { fifaRanking: 80, titles: 0, confederation: 'AFC' },
  'kuwait': { fifaRanking: 139, titles: 0, confederation: 'AFC' },
  'united arab emirates': { fifaRanking: 69, titles: 0, confederation: 'AFC' },
  'palestine': { fifaRanking: 93, titles: 0, confederation: 'AFC' },
  'syria': { fifaRanking: 89, titles: 0, confederation: 'AFC' },
  'kyrgyzstan': { fifaRanking: 104, titles: 0, confederation: 'AFC' },
  'china': { fifaRanking: 88, titles: 0, confederation: 'AFC' },
  'papua new guinea': { fifaRanking: 165, titles: 0, confederation: 'OFC' },
  'india': { fifaRanking: 117, titles: 0, confederation: 'AFC' },
  'thailand': { fifaRanking: 101, titles: 0, confederation: 'AFC' },
  'vietnam': { fifaRanking: 115, titles: 0, confederation: 'AFC' },
  'indonesia': { fifaRanking: 142, titles: 0, confederation: 'AFC' },
  'philippines': { fifaRanking: 139, titles: 0, confederation: 'AFC' },
  'tajikistan': { fifaRanking: 99, titles: 0, confederation: 'AFC' }
};

/**
 * Retorna as estatísticas fixas de uma seleção buscando pelo nome original ou traduzido
 */
export function getTeamStaticStats(teamName) {
  if (!teamName) return { fifaRanking: '-', titles: 0, confederation: '-' };
  
  const ptKey = teamName.toLowerCase().trim();
  const enKey = translateTeamName(teamName).toLowerCase().trim();

  return TEAM_STATS[enKey] || TEAM_STATS[ptKey] || { fifaRanking: '-', titles: 0, confederation: '-' };
}
