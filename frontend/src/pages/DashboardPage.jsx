import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { 
  Share2, Download, TrendingUp, Award, Flame, Sparkles, 
  Users, ArrowLeft, Trophy, Target, Lightbulb, Laugh
} from 'lucide-react'
import toast from 'react-hot-toast'
import StatsOverview from '../components/StatsOverview'
import ChampionMastery from '../components/ChampionMastery'
import PerformanceChart from '../components/PerformanceChart'
import AIInsights from '../components/AIInsights'
import RoastCard from '../components/RoastCard'
import HiddenGemsCard from '../components/HiddenGemsCard'
import PersonalityCard from '../components/PersonalityCard'
import ShareCard from '../components/ShareCard'
import { generateShareImage, shareToTwitter, formatStatsForShare } from '../utils/shareUtils'
import { getPlayerStats } from '../services/api'

function DashboardPage() {
  const { region, summonerName } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const shareRef = useRef(null)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showRoast, setShowRoast] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  
  // Get data from location state or fetch it
  const [stats, setStats] = useState(location.state?.stats || null)
  // All AI content (Insights, Personality, Hidden Gems, Roast) loads on-demand!
  const [isLoading, setIsLoading] = useState(!stats)

  useEffect(() => {
    if (!stats) {
      fetchData()
    }
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const statsData = await getPlayerStats(region, summonerName, 20)
      setStats(statsData)
    } catch (error) {
      toast.error('Failed to load data')
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async (platform) => {
    try {
      if (platform === 'image') {
        setIsGeneratingImage(true)
        await generateShareImage(shareRef.current, `${summonerName}-recap.png`)
        toast.success('Image downloaded!')
      } else if (platform === 'twitter') {
        const text = formatStatsForShare(stats?.stats || {}, summonerName)
        shareToTwitter(text)
      }
    } catch (error) {
      toast.error('Failed to share')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-16 h-16 mx-auto mb-4" />
          <p className="text-gray-400">Loading your data...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'insights', label: 'AI Insights', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'champions', label: 'Champions', icon: <Trophy className="w-4 h-4" /> },
    { id: 'special', label: 'Special Features', icon: <Flame className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{summonerName}</h1>
                <p className="text-sm text-gray-400">{region.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleShare('image')}
                disabled={isGeneratingImage}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="btn-primary flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-gray-900/30 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-rift-blue border-b-2 border-rift-blue'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Keep all tabs mounted to prevent re-loading */}
      <main className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        <div className={`space-y-8 ${activeTab === 'overview' ? '' : 'hidden'}`}>
          <StatsOverview 
            stats={stats?.stats} 
            summonerName={summonerName}
            enhancedAnalytics={stats?.enhanced_analytics}
          />
          <PerformanceChart stats={stats?.stats} />
          <div ref={shareRef}>
            <ShareCard stats={stats?.stats} summonerName={summonerName} />
          </div>
        </div>

        {/* Insights Tab - Stays mounted, loads once */}
        <div className={`space-y-8 ${activeTab === 'insights' ? '' : 'hidden'}`}>
          <AIInsights region={region} summonerName={summonerName} preloadedInsights={null} />
          <HiddenGemsCard region={region} summonerName={summonerName} preloadedGems={null} />
          <PersonalityCard region={region} summonerName={summonerName} preloadedPersonality={null} />
        </div>

        {/* Champions Tab */}
        <div className={`space-y-8 ${activeTab === 'champions' ? '' : 'hidden'}`}>
          <ChampionMastery champions={stats?.stats?.topChampions || []} />
        </div>

        {/* Special Tab */}
        <div className={`space-y-8 ${activeTab === 'special' ? '' : 'hidden'}`}>
          {/* Roast Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Laugh className="w-6 h-6 text-rift-red" />
                <h2 className="text-2xl font-bold text-white">Roast Master 3000</h2>
              </div>
              <button
                onClick={() => setShowRoast(!showRoast)}
                className="btn-secondary"
              >
                {showRoast ? 'Hide Roast' : 'Show Roast'}
              </button>
            </div>
            {showRoast && <RoastCard region={region} summonerName={summonerName} stats={stats?.stats} />}
          </div>

          {/* Hidden Gems now load on-demand in Insights tab */}

          {/* Call to Action */}
          <div className="card bg-gradient-to-r from-rift-blue/20 to-rift-purple/20 text-center">
            <Lightbulb className="w-12 h-12 text-rift-blue mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Want to Compare?</h3>
            <p className="text-gray-300 mb-6">
              See how you stack up against friends and discover duo synergies
            </p>
            <button
              onClick={() => navigate('/compare')}
              className="btn-primary"
            >
              <Users className="w-5 h-5 inline mr-2" />
              Compare with Friends
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage

