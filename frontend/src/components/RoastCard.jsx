import { Flame, Laugh, Share2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { copyToClipboard } from '../utils/shareUtils'
import { generateRoast } from '../services/api'

function RoastCard({ region, summonerName, stats }) {
  const [showRoast, setShowRoast] = useState(false)
  const [roastData, setRoastData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch roast on-demand
  const handleLoadRoast = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await generateRoast(region, summonerName, 20)
      console.log('[Roast] Received data:', data)
      setRoastData(data)
      setShowRoast(true)
      toast.success('🔥 Roast loaded! Prepare for maximum burn!')
    } catch (err) {
      console.error('Error loading roast:', err)
      setError(err.message || 'Failed to load roast')
      toast.error('Failed to generate roast. Try again!')
    } finally {
      setLoading(false)
    }
  }

  // Handle different roast formats from backend
  const getRoastText = () => {
    if (!roastData) return null
    
    // Backend returns { summoner: "...", roast: { roasts: [...] }, model_used: "..." }
    const roastContent = roastData.roast || roastData
    
    // Check if roasts is an array
    if (roastContent.roasts && Array.isArray(roastContent.roasts)) {
      return roastContent.roasts.join('\n\n')
    }
    
    // Fallback formats for string content
    if (typeof roastContent === 'string') return roastContent
    if (roastContent.content) return roastContent.content
    
    return null
  }
  
  const roastText = getRoastText()

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
            {!showRoast 
              ? "Click below to generate an AI roast (Warning: May cause emotional damage!)"
              : "The following content may hurt your feelings (but it's all in good fun!)"}
          </p>
        </div>

        {!showRoast && !error ? (
          <button
            onClick={handleLoadRoast}
            disabled={loading}
            className="btn-primary w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                Generating Epic Roast...
              </>
            ) : (
              <>
                <Laugh className="w-5 h-5 inline mr-2" />
                Show Me The Roast
              </>
            )}
          </button>
        ) : error ? (
          <div className="space-y-4">
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={handleLoadRoast}
                disabled={loading}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </button>
            </div>
          </div>
        ) : showRoast && roastText ? (
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
        ) : null}
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

