import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, Sparkles, TrendingUp, Award, Brain } from 'lucide-react'
import { getPlayerStats, generateInsights, generateRoast, discoverHiddenGems, analyzePersonality, getDemoData } from '../services/api'
import toast from 'react-hot-toast'

function LoadingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const region = searchParams.get('region')
  const summonerName = searchParams.get('summoner')
  const isDemo = searchParams.get('demo') === 'true'
  
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: <Loader2 className="w-6 h-6 animate-spin" />, text: isDemo ? 'Loading demo data...' : 'Fetching match history...' },
    { icon: <TrendingUp className="w-6 h-6" />, text: 'Analyzing statistics...' },
    { icon: <Brain className="w-6 h-6" />, text: 'Generating AI insights...' },
    { icon: <Sparkles className="w-6 h-6" />, text: 'Discovering hidden patterns...' },
    { icon: <Award className="w-6 h-6" />, text: 'Calculating achievements...' },
  ]

  useEffect(() => {
    // Demo mode doesn't need region/summoner
    if (!isDemo && (!region || !summonerName)) {
      navigate('/')
      return
    }

    fetchAllData()
  }, [region, summonerName, isDemo])

  const fetchAllData = async () => {
    try {
      // DEMO MODE: Fast path with mock data
      if (isDemo) {
        setCurrentStep(0)
        setProgress(20)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setCurrentStep(1)
        setProgress(40)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setCurrentStep(2)
        setProgress(60)
        const demoData = await getDemoData()
        
        setCurrentStep(3)
        setProgress(80)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setCurrentStep(4)
        setProgress(100)
        
        // Navigate to dashboard with demo data
        setTimeout(() => {
          navigate(`/dashboard/demo/DemoPlayer`, {
            state: {
              stats: demoData,
              insights: {
                insights: {
                  narrative: "Welcome to the demo! This showcases all features with sample data. In a real session, this would be your personalized year-end recap powered by AWS Bedrock AI.",
                  strengths: ["Consistent performance", "Strong laning phase", "Excellent teamwork"],
                  weaknesses: ["Late game decision making", "Objective control timing"],
                  recommendations: ["Focus on macro gameplay", "Practice late game scenarios"]
                }
              }
            }
          })
        }, 500)
        return
      }
      
      // NORMAL MODE: Real API calls
      // Step 1: Fetch player stats
      setCurrentStep(0)
      setProgress(20)
      const statsData = await getPlayerStats(region, summonerName, 50)
      
      // Step 2: Analyze
      setCurrentStep(1)
      setProgress(40)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Step 3: Generate AI insights
      setCurrentStep(2)
      setProgress(60)
      const insightsData = await generateInsights(region, summonerName, 50)
      
      // Step 4: Get hidden gems (run in parallel with other features)
      setCurrentStep(3)
      setProgress(75)
      const [hiddenGems, personality] = await Promise.allSettled([
        discoverHiddenGems(region, summonerName, 50),
        analyzePersonality(region, summonerName, 50)
      ])
      
      // Step 5: Finalize
      setCurrentStep(4)
      setProgress(90)
      
      // Optional: Get roast (can fail gracefully)
      let roastData = null
      try {
        roastData = await generateRoast(region, summonerName, 50)
      } catch (error) {
        console.log('Roast generation optional - skipping')
      }
      
      setProgress(100)
      
      // Navigate to dashboard with all data
      setTimeout(() => {
        navigate(`/dashboard/${region}/${encodeURIComponent(summonerName)}`, {
          state: {
            stats: statsData,
            insights: insightsData,
            hiddenGems: hiddenGems.status === 'fulfilled' ? hiddenGems.value : null,
            personality: personality.status === 'fulfilled' ? personality.value : null,
            roast: roastData
          }
        })
      }, 500)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(error.message || 'Failed to fetch player data')
      setTimeout(() => navigate('/'), 2000)
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="card text-center">
          {/* Progress Circle */}
          <div className="mb-8">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="transform -rotate-90 w-32 h-32">
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
                  className="text-rift-blue transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Current Step */}
          <div className="mb-8">
            <div className="flex items-center justify-center text-rift-blue mb-2">
              {steps[currentStep]?.icon}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Analyzing {summonerName}
            </h2>
            <p className="text-gray-400">{steps[currentStep]?.text}</p>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  index < currentStep
                    ? 'bg-green-900/20 border-green-500/50'
                    : index === currentStep
                    ? 'bg-rift-blue/20 border-rift-blue/50'
                    : 'bg-gray-800/20 border-gray-700/50'
                } border`}
              >
                <div className={index <= currentStep ? 'text-rift-blue' : 'text-gray-600'}>
                  {index < currentStep ? (
                    <Award className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`flex-1 text-left ${
                    index <= currentStep ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {step.text}
                </span>
                {index < currentStep && (
                  <span className="text-green-400">✓</span>
                )}
              </div>
            ))}
          </div>

          {/* Fun Facts */}
          <div className="mt-8 p-4 bg-gray-800/30 rounded-lg">
            <p className="text-sm text-gray-400 italic">
              💡 Did you know? The average League player plays 300+ games per season!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage

