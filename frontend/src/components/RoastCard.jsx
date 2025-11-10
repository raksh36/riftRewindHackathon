import { Flame, Laugh, Share2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { copyToClipboard } from '../utils/shareUtils'

function RoastCard({ roast, stats }) {
  const [showRoast, setShowRoast] = useState(false)

  // Generate funny roasts based on stats if no AI roast available
  const generateFallbackRoast = () => {
    if (!stats) return "You played League. That's roast-worthy enough."

    const roasts = []
    
    if (stats.avgDeaths > 7) {
      roasts.push(`With ${stats.avgDeaths} deaths per game, you're feeding more than a soup kitchen! 🍲`)
    }
    
    if (stats.winRate < 45) {
      roasts.push(`${stats.winRate}% win rate? Even a coin flip would perform better! 🪙`)
    }
    
    if (stats.avgKDA < 2) {
      roasts.push(`Your KDA is ${stats.avgKDA}. My grandmother has a better KDA in Candy Crush! 👵`)
    }
    
    if (stats.recentTrend === 'Declining') {
      roasts.push(`Your recent performance is declining faster than your LP! 📉`)
    }

    if (stats.totalGames > 500) {
      roasts.push(`${stats.totalGames} games? Touch grass! Go outside! See the sun! ☀️`)
    }

    if (roasts.length === 0) {
      roasts.push(`You're so good, I can't even roast you. Just kidding, you're average at best. 😏`)
    }

    return roasts.join('\n\n')
  }

  const roastText = roast?.roast || roast?.content || generateFallbackRoast()

  const handleShare = () => {
    copyToClipboard(roastText)
    toast.success('Roast copied! Share the burn 🔥')
  }

  return (
    <div className="space-y-4">
      <div className="card bg-gradient-to-br from-red-900/30 to-orange-900/30 border-2 border-red-500/50">
        <div className="text-center mb-6">
          <Flame className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-2xl font-bold text-white mb-2">⚠️ Roast Zone ⚠️</h3>
          <p className="text-gray-400">
            Warning: The following content may hurt your feelings (but it's all in good fun!)
          </p>
        </div>

        {!showRoast ? (
          <button
            onClick={() => setShowRoast(true)}
            className="btn-primary w-full bg-red-600 hover:bg-red-700"
          >
            <Laugh className="w-5 h-5 inline mr-2" />
            Show Me The Roast
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-red-500/30">
              <div className="text-lg text-gray-300 whitespace-pre-line leading-relaxed">
                {roastText}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRoast(false)}
                className="btn-secondary flex-1"
              >
                Hide This Embarrassment
              </button>
              <button
                onClick={handleShare}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Roast Meter */}
      {showRoast && (
        <div className="card bg-gray-900/50">
          <h4 className="text-lg font-bold text-white mb-4">Roast Intensity Meter</h4>
          <div className="space-y-3">
            {[
              { label: 'Mild', level: stats?.winRate > 50 ? 20 : 0 },
              { label: 'Medium', level: stats?.winRate < 50 && stats?.winRate > 45 ? 50 : 0 },
              { label: 'Spicy', level: stats?.winRate < 45 && stats?.avgKDA > 2 ? 70 : 0 },
              { label: 'NUCLEAR 🔥', level: stats?.winRate < 45 && stats?.avgKDA < 2 ? 100 : 0 }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  <span className="text-sm font-bold text-red-400">{item.level}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-1000"
                    style={{ width: `${item.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoastCard

