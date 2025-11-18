import { Sparkles, TrendingUp, AlertCircle, Lightbulb, Award, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { generateInsights } from '../services/api'

function AIInsights({ region, summonerName, preloadedInsights }) {
  const [insights, setInsights] = useState(preloadedInsights || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasAttempted, setHasAttempted] = useState(!!preloadedInsights)

  // Auto-load insights when component mounts (if not preloaded)
  useEffect(() => {
    if (!insights && !hasAttempted && region && summonerName) {
      handleLoadInsights()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLoadInsights = async () => {
    console.log('[AIInsights] Starting to load insights for:', summonerName, region)
    setLoading(true)
    setError(null)
    setHasAttempted(true)
    
    try {
      const data = await generateInsights(region, summonerName, 20)
      console.log('[AIInsights] Received data:', data)
      console.log('[AIInsights] Insights object:', data?.insights)
      // Extract the insights object from the response
      setInsights(data?.insights || data)
      toast.success('✨ AI Insights loaded!')
    } catch (err) {
      console.error('[AIInsights] Error loading insights:', err)
      setError(err.message || 'Failed to load insights')
      toast.error('Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <Loader2 className="w-12 h-12 text-rift-blue mx-auto mb-4 animate-spin" />
        <p className="text-gray-300 text-lg mb-2">Analyzing your gameplay...</p>
        <p className="text-gray-500 text-sm">AI is processing your match history</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={handleLoadInsights}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="card text-center py-12">
        <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">AI Insights not loaded</p>
        <button
          onClick={handleLoadInsights}
          className="btn-primary"
        >
          <Sparkles className="w-5 h-5 inline mr-2" />
          Generate Insights
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Narrative */}
      <div className="card bg-gradient-to-br from-rift-blue/20 to-rift-purple/20">
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="w-8 h-8 text-rift-blue" />
          <h2 className="text-2xl font-bold text-white">Your League Journey</h2>
        </div>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 leading-relaxed">
            {insights.narrative || 'Your League story is being written...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Your Strengths</h3>
          </div>
          <ul className="space-y-3">
            {(insights.strengths || []).map((strength, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Award className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Growth */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Growth Opportunities</h3>
          </div>
          <ul className="space-y-3">
            {(insights.areasForGrowth || []).map((area, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Playstyle Description */}
      <div className="card bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <h3 className="text-xl font-bold text-white mb-4">Your Playstyle</h3>
        <p className="text-lg text-gray-300 italic">
          "{insights.playstyleDescription || 'A dedicated League player'}"
        </p>
      </div>

      {/* Highlights */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">🌟 Season Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(insights.highlights || []).map((highlight, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-500/30"
            >
              <p className="text-gray-300">{highlight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card bg-gradient-to-br from-blue-900/30 to-indigo-900/30">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">AI Recommendations</h3>
        </div>
        <div className="space-y-4">
          {(insights.recommendations || []).map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-blue-900/20 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <p className="text-gray-300 flex-1">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AIInsights

