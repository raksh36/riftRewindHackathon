import { toPng } from 'html-to-image'

/**
 * Generate shareable image from a DOM element
 * @param {HTMLElement} element - DOM element to convert
 * @param {string} filename - Output filename
 */
export const generateShareImage = async (element, filename = 'rift-rewind.png') => {
  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#0A1428'
    })
    
    // Create download link
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
    
    return dataUrl
  } catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}

/**
 * Share to Twitter
 * @param {string} text - Tweet text
 * @param {string} url - URL to share
 */
export const shareToTwitter = (text, url = window.location.href) => {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  window.open(twitterUrl, '_blank', 'width=550,height=420')
}

/**
 * Share to Discord (via clipboard)
 * @param {string} text - Message to copy
 */
export const shareToDiscord = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('Message copied! Paste it in Discord.')
  })
}

/**
 * Copy to clipboard
 * @param {string} text - Text to copy
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

/**
 * Format stats for sharing
 * @param {object} stats - Player stats object
 * @param {string} summonerName - Player name
 */
export const formatStatsForShare = (stats, summonerName) => {
  const topChamps = stats.topChampions?.slice(0, 3).map(c => c.championName).join(', ') || 'Unknown'
  
  return `🎮 ${summonerName}'s Rift Rewind 2024/25!

📊 Stats:
• ${stats.totalGames} games played
• ${stats.winRate}% win rate
• ${stats.avgKDA} KDA
• Top picks: ${topChamps}
• Role: ${stats.mostPlayedRole}

Check out yours at [Your URL]!
#RiftRewind #LeagueOfLegends`
}

