/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Format KDA with color
 */
export const getKDAColor = (kda) => {
  if (kda >= 5) return 'text-green-400'
  if (kda >= 3) return 'text-blue-400'
  if (kda >= 2) return 'text-yellow-400'
  return 'text-red-400'
}

/**
 * Format win rate with color
 */
export const getWinRateColor = (wr) => {
  if (wr >= 55) return 'text-green-400'
  if (wr >= 50) return 'text-blue-400'
  if (wr >= 45) return 'text-yellow-400'
  return 'text-red-400'
}

/**
 * Get rank color
 */
export const getRankColor = (rank) => {
  const colors = {
    'IRON': 'text-gray-500',
    'BRONZE': 'text-league-bronze',
    'SILVER': 'text-league-silver',
    'GOLD': 'text-league-gold',
    'PLATINUM': 'text-league-platinum',
    'DIAMOND': 'text-league-diamond',
    'MASTER': 'text-league-master',
    'GRANDMASTER': 'text-league-grandmaster',
    'CHALLENGER': 'text-league-challenger',
  }
  return colors[rank?.toUpperCase()] || 'text-gray-400'
}

/**
 * Format date
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

/**
 * Get trend emoji
 */
export const getTrendEmoji = (trend) => {
  if (trend === 'Improving') return '📈'
  if (trend === 'Declining') return '📉'
  return '➡️'
}

/**
 * Calculate time played (estimate)
 */
export const estimateTimePlayed = (games, avgGameLength = 30) => {
  const minutes = games * avgGameLength
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

