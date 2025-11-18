import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gamepad2, Sparkles, TrendingUp, Users, Award, Zap } from 'lucide-react'
import { getRegions } from '../services/api'
import toast from 'react-hot-toast'

function LandingPage() {
  const navigate = useNavigate()
  const [summonerName, setSummonerName] = useState('')
  const [region, setRegion] = useState('na1')
  const [regions, setRegions] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchRegions()
  }, [])

  const fetchRegions = async () => {
    try {
      const data = await getRegions()
      setRegions(data.regions || [])
    } catch (error) {
      console.error('Failed to fetch regions:', error)
      setRegions([
        { code: 'na1', name: 'North America' },
        { code: 'euw1', name: 'Europe West' },
        { code: 'kr', name: 'Korea' }
      ])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!summonerName.trim()) {
      toast.error('Please enter a summoner name')
      return
    }

    setIsLoading(true)
    
    // Navigate to loading page which will handle the data fetching (trim whitespace)
    navigate(`/loading?region=${region}&summoner=${encodeURIComponent(summonerName.trim())}`)
  }


  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'AI-Powered Insights',
      description: 'Get personalized narratives about your League journey powered by AWS Bedrock'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Growth Tracking',
      description: 'Visualize your improvement over time with detailed performance analytics'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Friend Comparisons',
      description: 'Discover duo synergies and compare playstyles with your friends'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Achievements',
      description: 'Celebrate pentakills, win streaks, and standout moments'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Hidden Gems',
      description: 'Uncover surprising patterns and unusual insights in your gameplay'
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: 'Personality Analysis',
      description: 'Discover your unique League personality type and playstyle'
    }
  ]

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-8 h-8 text-rift-blue" />
            <h1 className="text-2xl font-bold gradient-text">Rift Rewind</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/yourusername/rift-rewind" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-rift-gold hover:text-rift-blue transition-colors"
            >
              GitHub
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-6xl font-bold mb-6">
            <span className="gradient-text">Your League Year</span>
            <br />
            <span className="text-white">in Review</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your match history into personalized insights, celebrate achievements, 
            and discover your unique playstyle with AI-powered analysis
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="card p-8 glass-effect">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={summonerName}
                    onChange={(e) => setSummonerName(e.target.value)}
                    placeholder="Enter your summoner name..."
                    className="input-field w-full"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="input-field w-full"
                    disabled={isLoading}
                  >
                    {regions.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="loading-spinner w-5 h-5 mr-2" />
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get My Recap
                  </span>
                )}
              </button>
              
            </div>
          </form>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card hover-lift card-interactive animate-slide-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-rift-blue mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rift-blue transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Sample Preview */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-8">What You'll Get</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card bg-gradient-to-br from-blue-900/40 to-purple-900/40">
              <h4 className="text-xl font-bold text-rift-blue mb-3">📊 Detailed Stats</h4>
              <ul className="text-left text-gray-300 space-y-2">
                <li>• Win rate and KDA trends</li>
                <li>• Champion mastery breakdown</li>
                <li>• Role distribution analysis</li>
                <li>• Monthly performance tracking</li>
              </ul>
            </div>
            <div className="card bg-gradient-to-br from-purple-900/40 to-pink-900/40">
              <h4 className="text-xl font-bold text-rift-purple mb-3">🤖 AI Insights</h4>
              <ul className="text-left text-gray-300 space-y-2">
                <li>• Personalized narrative of your journey</li>
                <li>• Strengths and growth areas</li>
                <li>• Funny roasts (optional!)</li>
                <li>• Hidden pattern discoveries</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="card max-w-2xl mx-auto bg-gradient-to-r from-rift-blue/20 to-rift-purple/20">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Relive Your Year?</h3>
            <p className="text-gray-300 mb-6">
              Join thousands of players discovering their League story through AI-powered insights
            </p>
            <button
              onClick={() => document.querySelector('input').focus()}
              className="btn-primary"
            >
              Start Your Recap
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-400">
        <p>
          Built with ❤️ for the Rift Rewind Hackathon 2025
          <br />
          Powered by AWS Bedrock & Riot Games API
        </p>
      </footer>
    </div>
  )
}

export default LandingPage

