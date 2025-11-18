import { Brain, Swords, Shield, Users, Target, Zap, Loader2, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { analyzePersonality } from '../services/api'

function PersonalityCard({ region, summonerName, preloadedPersonality }) {
  const [personality, setPersonality] = useState(preloadedPersonality || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasAttempted, setHasAttempted] = useState(!!preloadedPersonality)

  // Auto-load personality when component mounts (if not preloaded)
  useEffect(() => {
    if (!personality && !hasAttempted) {
      handleLoadPersonality()
    }
  }, [])

  const handleLoadPersonality = async () => {
    setLoading(true)
    setError(null)
    setHasAttempted(true)
    
    try {
      const data = await analyzePersonality(region, summonerName, 20)
      console.log('[Personality] Received data:', data)
      // Extract the personality object from the response if nested
      setPersonality(data?.personality || data)
      toast.success('🧠 Personality analysis complete!')
    } catch (err) {
      console.error('Error loading personality:', err)
      setError(err.message || 'Failed to load personality')
      toast.error('Failed to analyze personality')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-300 text-lg mb-2">Analyzing your personality...</p>
        <p className="text-gray-500 text-sm">AI is discovering your unique playstyle</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={handleLoadPersonality}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  const profile = personality?.personality || personality
  
  // Don't render if no personality data
  if (!profile || !profile.type) {
    return (
      <div className="card text-center py-12">
        <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">Personality analysis not loaded</p>
        <button
          onClick={handleLoadPersonality}
          className="btn-primary"
        >
          <Brain className="w-5 h-5 inline mr-2" />
          Analyze Personality
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Personality Type */}
      <div className="card bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
        <div className="text-center mb-6">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">{profile.type || "The Player"}</h2>
          <p className="text-xl text-purple-300 italic mb-4">
            {profile.playstyle || "Your unique League personality"}
          </p>
          <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
            {profile.description || "A dedicated League of Legends player with a unique approach to the game."}
          </p>
        </div>

        {/* Celebrity Match */}
        {profile.celebrity && (
          <div className="mt-6 pt-6 border-t border-purple-500/30 text-center">
            <p className="text-gray-400 mb-2">Your playstyle is most similar to:</p>
            <p className="text-2xl font-bold gradient-text">{profile.celebrity}</p>
          </div>
        )}
      </div>

      {/* Personality Traits */}
      <div className="card">
        <h3 className="text-2xl font-bold text-white mb-6">Personality Traits</h3>
        <div className="space-y-4">
          {(profile.traits || []).map((trait, index) => (
            <TraitBar key={index} trait={trait} />
          ))}
        </div>
      </div>

      {/* Personality Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="card bg-gradient-to-br from-green-900/20 to-emerald-900/20">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-400" />
            Core Strengths
          </h4>
          <ul className="space-y-2">
            {(profile.strengths || []).map((strength, index) => (
              <li key={index} className="text-gray-300 flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Archetype Description */}
        <div className="card bg-gradient-to-br from-blue-900/20 to-cyan-900/20">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-400" />
            Player Archetype
          </h4>
          <p className="text-gray-300 leading-relaxed">
            {profile.archetype || "You bring a unique blend of skills and playstyle to every match, making you an unpredictable and valuable teammate."}
          </p>
        </div>
      </div>

      {/* Personality Quadrant */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-6">Playstyle Matrix</h3>
        <div className="relative h-80 bg-gray-900 rounded-lg p-4">
          {/* Axes */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-700" />
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-700" />
          
          {/* Labels */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-sm text-gray-400">
            Aggressive
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm text-gray-400">
            Passive
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            Solo
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            Team
          </div>

          {/* Player Dot */}
          <div
            className="absolute w-6 h-6 bg-rift-blue rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{
              left: `${50 + ((profile.traits?.find(t => t.name === 'Teamwork')?.value || 50) - 50) * 0.8}%`,
              top: `${100 - ((profile.traits?.find(t => t.name === 'Aggression')?.value || 50) * 0.8)}%`
            }}
            title="Your Position"
          />
        </div>
      </div>
    </div>
  )
}

function TraitBar({ trait }) {
  const getColor = (value) => {
    if (value >= 80) return 'from-green-500 to-emerald-500'
    if (value >= 60) return 'from-blue-500 to-cyan-500'
    if (value >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="text-rift-blue">{trait.icon}</div>
          <span className="text-white font-medium">{trait.name}</span>
        </div>
        <span className="text-gray-400 font-bold">{trait.value}%</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColor(trait.value)} transition-all duration-1000`}
          style={{ width: `${trait.value}%` }}
        />
      </div>
    </div>
  )
}

export default PersonalityCard

