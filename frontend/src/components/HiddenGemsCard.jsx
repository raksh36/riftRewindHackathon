import { Gem, TrendingUp, Clock, Calendar, Zap, Loader2, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { discoverHiddenGems } from '../services/api'

function HiddenGemsCard({ region, summonerName, preloadedGems }) {
  const [gems, setGems] = useState(preloadedGems || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasAttempted, setHasAttempted] = useState(!!preloadedGems)

  // Auto-load gems when component mounts (if not preloaded)
  useEffect(() => {
    if (!gems && !hasAttempted) {
      handleLoadGems()
    }
  }, [])

  const handleLoadGems = async () => {
    setLoading(true)
    setError(null)
    setHasAttempted(true)
    
    try {
      const data = await discoverHiddenGems(region, summonerName, 20)
      console.log('[HiddenGems] Received data:', data)
      // Extract the gems object from the response if nested
      setGems(data?.discoveries || data?.gems || data)
      toast.success('💎 Hidden patterns discovered!')
    } catch (err) {
      console.error('Error loading hidden gems:', err)
      setError(err.message || 'Failed to load hidden gems')
      toast.error('Failed to discover hidden patterns')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <Loader2 className="w-12 h-12 text-rift-purple mx-auto mb-4 animate-spin" />
        <p className="text-gray-300 text-lg mb-2">Discovering hidden patterns...</p>
        <p className="text-gray-500 text-sm">AI is analyzing your unique gameplay</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={handleLoadGems}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  const gemsList = gems?.discoveries || gems?.gems
  
  // Don't render if no gems data
  if (!gemsList || gemsList.length === 0) {
    return (
      <div className="card text-center py-12">
        <Gem className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">Hidden gems not loaded</p>
        <button
          onClick={handleLoadGems}
          className="btn-primary"
        >
          <Gem className="w-5 h-5 inline mr-2" />
          Discover Patterns
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Gem className="w-12 h-12 text-rift-purple mx-auto mb-3 animate-pulse" />
        <h3 className="text-2xl font-bold text-white mb-2">Hidden Patterns Discovered</h3>
        <p className="text-gray-400">
          Our AI uncovered surprising insights about your gameplay
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.isArray(gemsList) ? gemsList.map((gem, index) => (
          <GemCard key={index} gem={gem} index={index} />
        )) : (
          <div className="col-span-2 text-center text-gray-400">
            <p>No hidden gems discovered yet. Play more games to unlock insights!</p>
          </div>
        )}
      </div>

      {/* Fun fact */}
      <div className="card bg-gradient-to-r from-purple-900/30 to-pink-900/30 text-center">
        <p className="text-lg text-gray-300 italic">
          💎 These patterns were discovered using advanced AI analysis of your match history
        </p>
      </div>
    </div>
  )
}

function GemCard({ gem, index }) {
  const defaultColors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-rose-500",
    "from-indigo-500 to-violet-500"
  ]

  const color = gem.color || defaultColors[index % defaultColors.length]
  const icon = gem.icon || <Gem className="w-6 h-6" />
  const title = gem.title || `Insight #${index + 1}`
  const description = typeof gem === 'string' ? gem : (gem.description || gem.insight || 'An interesting pattern was discovered')

  return (
    <div className="card glass-effect hover:scale-105 transition-transform duration-300">
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
      
      {/* Rarity indicator */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Rarity</span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg ${
                  star <= (gem.rarity || 4) ? 'text-yellow-400' : 'text-gray-600'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HiddenGemsCard

