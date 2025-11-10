import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Zap, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { comparePlayers } from '../services/api'

function ComparePage() {
  const navigate = useNavigate()
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [region, setRegion] = useState('na1')
  const [comparison, setComparison] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const regions = [
    { code: 'na1', name: 'North America' },
    { code: 'euw1', name: 'Europe West' },
    { code: 'kr', name: 'Korea' },
  ]

  const handleCompare = async (e) => {
    e.preventDefault()
    
    if (!player1.trim() || !player2.trim()) {
      toast.error('Please enter both summoner names')
      return
    }

    setIsLoading(true)
    try {
      const data = await comparePlayers(player1, player2, region, 30)
      setComparison(data)
      toast.success('Comparison complete!')
    } catch (error) {
      toast.error(error.message || 'Failed to compare players')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Users className="w-16 h-16 text-rift-blue mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Compare Players</h1>
            <p className="text-gray-400">
              Discover duo synergies and see how players stack up against each other
            </p>
          </div>

          {/* Comparison Form */}
          <form onSubmit={handleCompare} className="card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
                placeholder="Player 1 summoner name"
                className="input-field"
                disabled={isLoading}
              />
              <input
                type="text"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
                placeholder="Player 2 summoner name"
                className="input-field"
                disabled={isLoading}
              />
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="input-field"
                disabled={isLoading}
              >
                {regions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="loading-spinner w-5 h-5 mr-2" />
                  Comparing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Compare Players
                </span>
              )}
            </button>
          </form>

          {/* Comparison Results */}
          {comparison && (
            <div className="space-y-6">
              {/* Synergy Score */}
              <div className="card bg-gradient-to-r from-rift-blue/20 to-rift-purple/20 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Duo Synergy Score</h2>
                <div className="text-6xl font-bold gradient-text mb-4">
                  {comparison.synergyScore || 'N/A'}%
                </div>
                <p className="text-gray-300">{comparison.synergyDescription}</p>
              </div>

              {/* Side-by-side Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Player 1 */}
                <div className="card">
                  <h3 className="text-xl font-bold text-rift-blue mb-4">{player1}</h3>
                  <div className="space-y-3">
                    <StatRow label="Win Rate" value={`${comparison.player1?.winRate || 0}%`} />
                    <StatRow label="KDA" value={comparison.player1?.avgKDA || 0} />
                    <StatRow label="Games" value={comparison.player1?.totalGames || 0} />
                    <StatRow label="Role" value={comparison.player1?.mostPlayedRole || 'Unknown'} />
                  </div>
                </div>

                {/* Player 2 */}
                <div className="card">
                  <h3 className="text-xl font-bold text-rift-purple mb-4">{player2}</h3>
                  <div className="space-y-3">
                    <StatRow label="Win Rate" value={`${comparison.player2?.winRate || 0}%`} />
                    <StatRow label="KDA" value={comparison.player2?.avgKDA || 0} />
                    <StatRow label="Games" value={comparison.player2?.totalGames || 0} />
                    <StatRow label="Role" value={comparison.player2?.mostPlayedRole || 'Unknown'} />
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              {comparison.comparison && (
                <div className="card">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-rift-blue" />
                    AI Analysis
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{comparison.comparison}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  )
}

export default ComparePage

