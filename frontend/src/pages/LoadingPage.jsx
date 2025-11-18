import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Sparkles, TrendingUp, Award, Brain } from 'lucide-react'
import { getPlayerStats } from '../services/api'
import toast from 'react-hot-toast'

function LoadingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const region = searchParams.get('region')
  const summonerName = searchParams.get('summoner')?.trim()
  
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: <Loader2 className="w-6 h-6 animate-spin" />, text: 'Fetching match history...' },
    { icon: <TrendingUp className="w-6 h-6" />, text: 'Analyzing statistics...' },
    { icon: <Brain className="w-6 h-6" />, text: 'Generating AI insights...' },
    { icon: <Sparkles className="w-6 h-6" />, text: 'Discovering hidden patterns...' },
    { icon: <Award className="w-6 h-6" />, text: 'Calculating achievements...' },
  ]

  useEffect(() => {
    if (!region || !summonerName) {
      navigate('/')
      return
    }

    fetchAllData()
  }, [region, summonerName])

  const fetchAllData = async () => {
    try {
      // Step 1: Fetch player stats ONLY (super fast!)
      setCurrentStep(0)
      setProgress(30)
      const statsData = await getPlayerStats(region, summonerName, 20)
      
      // Step 2: Processing complete
      setCurrentStep(1)
      setProgress(80)
      
      // All AI content (insights, roast, hidden gems, personality) loads on-demand!
      
      setCurrentStep(4)
      setProgress(100)
      
      // Navigate to dashboard immediately (all AI loads on-demand)
      setTimeout(() => {
        navigate(`/dashboard/${region}/${encodeURIComponent(summonerName)}`, {
          state: {
            stats: statsData
          }
        })
      }, 300)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(error.message || 'Failed to fetch player data')
      setTimeout(() => navigate('/'), 2000)
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-rift-blue/10 rounded-full blur-3xl animate-pulse top-0 -left-48"></div>
        <div className="absolute w-96 h-96 bg-rift-purple/10 rounded-full blur-3xl animate-pulse bottom-0 -right-48 delay-700"></div>
      </div>
      
      <div className="max-w-2xl w-full relative z-10">
        <div className="card text-center glow-pulse animate-fade-in">
          {/* Progress Circle */}
          <div className="mb-8">
            <div className="relative w-32 h-32 mx-auto">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-rift-blue/20 blur-xl animate-pulse"></div>
              
              <svg className="transform -rotate-90 w-32 h-32 relative z-10">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - progress / 100)}
                  className="text-rift-blue transition-all duration-500 drop-shadow-lg"
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(10, 200, 185, 0.8))'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold neon-text">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Current Step */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center justify-center text-rift-blue mb-3 animate-bounce">
              <div className="p-3 bg-rift-blue/20 rounded-full">
                {steps[currentStep]?.icon}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 gradient-text">
              Analyzing {summonerName}
            </h2>
            <p className="text-lg text-gray-300">{steps[currentStep]?.text}</p>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-4 rounded-lg transition-all duration-500 transform ${
                  index < currentStep
                    ? 'bg-gradient-to-r from-green-900/30 to-green-800/20 border-green-500/60 scale-95 success-glow'
                    : index === currentStep
                    ? 'bg-gradient-to-r from-rift-blue/30 to-blue-800/20 border-rift-blue/70 scale-100 glow-pulse'
                    : 'bg-gray-800/20 border-gray-700/50 scale-95 opacity-60'
                } border-2 hover:scale-100 hover:border-rift-blue/50`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className={`${index <= currentStep ? 'text-rift-blue' : 'text-gray-600'} transition-all duration-300`}>
                  {index < currentStep ? (
                    <div className="p-1 bg-green-500/20 rounded-full">
                      <Award className="w-5 h-5 text-green-400" />
                    </div>
                  ) : (
                    <div className={index === currentStep ? 'animate-bounce' : ''}>
                      {step.icon}
                    </div>
                  )}
                </div>
                <span
                  className={`flex-1 text-left font-medium transition-all duration-300 ${
                    index < currentStep ? 'text-green-300' : 
                    index === currentStep ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {step.text}
                </span>
                {index < currentStep && (
                  <span className="text-2xl text-green-400 animate-bounce">✓</span>
                )}
                {index === currentStep && (
                  <div className="loading-spinner w-5 h-5"></div>
                )}
              </div>
            ))}
          </div>

          {/* Fun Facts */}
          <div className="mt-8 p-4 bg-gradient-to-r from-rift-blue/10 to-rift-purple/10 rounded-lg border border-rift-blue/30 glass-effect">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl animate-bounce">💡</span>
              <p className="text-sm text-gray-300 italic">
                Did you know? The average League player plays 300+ games per season!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage

