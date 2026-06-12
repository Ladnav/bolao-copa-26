// Dados estáticos sobre as seleções para enriquecer a UI (Tooltip)
// Fonte: Ranking da FIFA e Histórico de Copas

export const TEAM_STATS = {
  'Brasil': { fifaRanking: 5, titles: 5, confederation: 'CONMEBOL' },
  'Alemanha': { fifaRanking: 16, titles: 4, confederation: 'UEFA' },
  'Itália': { fifaRanking: 9, titles: 4, confederation: 'UEFA' },
  'Argentina': { fifaRanking: 1, titles: 3, confederation: 'CONMEBOL' },
  'França': { fifaRanking: 2, titles: 2, confederation: 'UEFA' },
  'Uruguai': { fifaRanking: 11, titles: 2, confederation: 'CONMEBOL' },
  'Espanha': { fifaRanking: 8, titles: 1, confederation: 'UEFA' },
  'Inglaterra': { fifaRanking: 3, titles: 1, confederation: 'UEFA' },
  
  // Outros Destaques
  'Bélgica': { fifaRanking: 4, titles: 0, confederation: 'UEFA' },
  'Holanda': { fifaRanking: 6, titles: 0, confederation: 'UEFA' },
  'Portugal': { fifaRanking: 7, titles: 0, confederation: 'UEFA' },
  'Croácia': { fifaRanking: 10, titles: 0, confederation: 'UEFA' },
  'EUA': { fifaRanking: 13, titles: 0, confederation: 'CONCACAF' },
  'Colômbia': { fifaRanking: 14, titles: 0, confederation: 'CONMEBOL' },
  'México': { fifaRanking: 15, titles: 0, confederation: 'CONCACAF' },
  'Senegal': { fifaRanking: 17, titles: 0, confederation: 'CAF' },
  'Japão': { fifaRanking: 18, titles: 0, confederation: 'AFC' },
  'Marrocos': { fifaRanking: 12, titles: 0, confederation: 'CAF' },
  'Coreia do Sul': { fifaRanking: 22, titles: 0, confederation: 'AFC' },
  'Austrália': { fifaRanking: 23, titles: 0, confederation: 'AFC' },
  'Equador': { fifaRanking: 31, titles: 0, confederation: 'CONMEBOL' },
  'Peru': { fifaRanking: 33, titles: 0, confederation: 'CONMEBOL' },
  'Chile': { fifaRanking: 42, titles: 0, confederation: 'CONMEBOL' },
  'Nigéria': { fifaRanking: 28, titles: 0, confederation: 'CAF' },
  'Camarões': { fifaRanking: 51, titles: 0, confederation: 'CAF' },
  'Egito': { fifaRanking: 36, titles: 0, confederation: 'CAF' },
  'Gana': { fifaRanking: 67, titles: 0, confederation: 'CAF' },
  'Argélia': { fifaRanking: 43, titles: 0, confederation: 'CAF' },
  'Canadá': { fifaRanking: 50, titles: 0, confederation: 'CONCACAF' },
  'Costa Rica': { fifaRanking: 54, titles: 0, confederation: 'CONCACAF' },
  'Panamá': { fifaRanking: 44, titles: 0, confederation: 'CONCACAF' },
  'Irã': { fifaRanking: 20, titles: 0, confederation: 'AFC' },
  'Arábia Saudita': { fifaRanking: 53, titles: 0, confederation: 'AFC' },
  'Sérvia': { fifaRanking: 32, titles: 0, confederation: 'UEFA' },
  'Polônia': { fifaRanking: 30, titles: 0, confederation: 'UEFA' },
  'Dinamarca': { fifaRanking: 21, titles: 0, confederation: 'UEFA' },
  'Suíça': { fifaRanking: 19, titles: 0, confederation: 'UEFA' },
  'Paraguai': { fifaRanking: 56, titles: 0, confederation: 'CONMEBOL' },
  'Venezuela': { fifaRanking: 52, titles: 0, confederation: 'CONMEBOL' },
  'Bolívia': { fifaRanking: 86, titles: 0, confederation: 'CONMEBOL' },
};

/**
 * Retorna as estatísticas fixas de uma seleção
 */
export function getTeamStaticStats(teamName) {
  // Tenta achar exatamente ou ignorando acentos simples se necessário
  return TEAM_STATS[teamName] || { fifaRanking: '-', titles: 0, confederation: '-' };
}
