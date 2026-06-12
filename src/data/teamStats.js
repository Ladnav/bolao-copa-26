// Dados estáticos sobre as seleções para enriquecer a UI (Tooltip)
// Fonte: Ranking da FIFA e Histórico de Copas

import { translateTeamName } from './teamNameMap';

export const TEAM_STATS = {
  "brazil": {
    "fifaRanking": 5,
    "titles": 5,
    "confederation": "CONMEBOL"
  },
  "germany": {
    "fifaRanking": 16,
    "titles": 4,
    "confederation": "UEFA"
  },
  "italy": {
    "fifaRanking": 9,
    "titles": 4,
    "confederation": "UEFA"
  },
  "argentina": {
    "fifaRanking": 1,
    "titles": 3,
    "confederation": "CONMEBOL"
  },
  "france": {
    "fifaRanking": 2,
    "titles": 2,
    "confederation": "UEFA"
  },
  "uruguay": {
    "fifaRanking": 11,
    "titles": 2,
    "confederation": "CONMEBOL"
  },
  "spain": {
    "fifaRanking": 8,
    "titles": 1,
    "confederation": "UEFA"
  },
  "england": {
    "fifaRanking": 3,
    "titles": 1,
    "confederation": "UEFA"
  },
  "belgium": {
    "fifaRanking": 4,
    "titles": 0,
    "confederation": "UEFA"
  },
  "netherlands": {
    "fifaRanking": 6,
    "titles": 0,
    "confederation": "UEFA"
  },
  "portugal": {
    "fifaRanking": 7,
    "titles": 0,
    "confederation": "UEFA"
  },
  "croatia": {
    "fifaRanking": 10,
    "titles": 0,
    "confederation": "UEFA"
  },
  "usa": {
    "fifaRanking": 13,
    "titles": 0,
    "confederation": "CONCACAF"
  },
  "colombia": {
    "fifaRanking": 14,
    "titles": 0,
    "confederation": "CONMEBOL"
  },
  "mexico": {
    "fifaRanking": 15,
    "titles": 0,
    "confederation": "CONCACAF"
  },
  "senegal": {
    "fifaRanking": 17,
    "titles": 0,
    "confederation": "CAF"
  },
  "japan": {
    "fifaRanking": 18,
    "titles": 0,
    "confederation": "AFC"
  },
  "morocco": {
    "fifaRanking": 12,
    "titles": 0,
    "confederation": "CAF"
  },
  "south korea": {
    "fifaRanking": 22,
    "titles": 0,
    "confederation": "AFC"
  },
  "australia": {
    "fifaRanking": 23,
    "titles": 0,
    "confederation": "AFC"
  },
  "ecuador": {
    "fifaRanking": 31,
    "titles": 0,
    "confederation": "CONMEBOL"
  },
  "peru": {
    "fifaRanking": 33,
    "titles": 0,
    "confederation": "CONMEBOL"
  },
  "chile": {
    "fifaRanking": 42,
    "titles": 0,
    "confederation": "CONMEBOL"
  },
  "nigeria": {
    "fifaRanking": 28,
    "titles": 0,
    "confederation": "CAF"
  },
  "cameroon": {
    "fifaRanking": 51,
    "titles": 0,
    "confederation": "CAF"
  },
  "egypt": {
    "fifaRanking": 36,
    "titles": 0,
    "confederation": "CAF"
  },
  "ghana": {
    "fifaRanking": 67,
    "titles": 0,
    "confederation": "CAF"
  },
  "algeria": {
    "fifaRanking": 43,
    "titles": 0,
    "confederation": "CAF"
  },
  "canada": {
    "fifaRanking": 50,
    "titles": 0,
    "confederation": "CONCACAF"
  },
  "costa rica": {
    "fifaRanking": 54,
    "titles": 0,
    "confederation": "CONCACAF"
  },
  "panama": {
    "fifaRanking": 44,
    "titles": 0,
    "confederation": "CONCACAF"
  },
  "iran": {
    "fifaRanking": 20,
    "titles": 0,
    "confederation": "AFC"
  },
  "saudi arabia": {
    "fifaRanking": 53,
    "titles": 0,
    "confederation": "AFC"
  },
  "serbia": {
    "fifaRanking": 32,
    "titles": 0,
    "confederation": "UEFA"
  },
  "poland": {
    "fifaRanking": 30,
    "titles": 0,
    "confederation": "UEFA"
  },
  "denmark": {
    "fifaRanking": 21,
    "titles": 0,
    "confederation": "UEFA"
  },
  "switzerland": {
    "fifaRanking": 19,
    "titles": 0,
    "confederation": "UEFA"
  },
  "paraguay": {
    "fifaRanking": 56,
    "titles": 0,
    "confederation": "CONMEBOL"
  },
  "venezuela": {
    "fifaRanking": 52,
    "titles": 0,
    "confederation": "CONMEBOL"
  },
  "bolivia": {
    "fifaRanking": 86,
    "titles": 0,
    "confederation": "CONMEBOL"
  },
  "south africa": {
    "fifaRanking": 58,
    "titles": 0,
    "confederation": "CAF"
  },
  "bosnia and herzegovina": {
    "fifaRanking": 71,
    "titles": 0,
    "confederation": "UEFA"
  },
  "bosnia": {
    "fifaRanking": 71,
    "titles": 0,
    "confederation": "UEFA"
  },
  "haiti": {
    "fifaRanking": 90,
    "titles": 0,
    "confederation": "CONCACAF"
  }
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
