import { Trophy, Target, TrendingUp, Award } from 'lucide-react'
import { getKDAColor, getWinRateColor, getTrendEmoji } from '../utils/formatters'

function StatsOverview({ stats, summonerName, enhancedAnalytics }) {
  if (!stats) {
    return (
      <div className="card text-center p-8">
        <p className="text-gray-400">No stats available</p>
      </div>
    )
  }

  const statCards = [
    {
      icon: <Trophy className="w-6 h-6" />,
      label: 'Total Games',
      value: stats.totalGames || 0,
      color: 'text-blue-400',
      bgColor: 'from-blue-900/20 to-blue-800/20'
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: 'Win Rate',
      value: `${stats.winRate || 0}%`,
      color: getWinRateColor(stats.winRate),
      bgColor: 'from-green-900/20 to-green-800/20'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Average KDA',
      value: (stats.avgKDA || 0).toFixed(2),
      color: getKDAColor(stats.avgKDA),
      bgColor: 'from-purple-900/20 to-purple-800/20'
    },
    {
      icon: <Award className="w-6 h-6" />,
      label: 'Most Played',
      value: stats.mostPlayedRole || 'Unknown',
      color: 'text-yellow-400',
      bgColor: 'from-yellow-900/20 to-yellow-800/20'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="card bg-gradient-to-br from-rift-blue/20 to-rift-purple/20 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">{summonerName}'s Stats</h2>
        <p className="text-gray-400 mb-6">Season Overview</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, index) => (
            <div
              key={index}
              className={`stat-card bg-gradient-to-br ${card.bgColor}`}
            >
              <div className={`${card.color} mb-2`}>{card.icon}</div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="text-sm text-gray-400">{card.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">Performance Breakdown</h3>
          <div className="space-y-3">
            <StatBar label="Kills" value={(stats.avgKills || 0).toFixed(1)} max={15} color="text-green-400" />
            <StatBar label="Deaths" value={(stats.avgDeaths || 0).toFixed(1)} max={15} color="text-red-400" />
            <StatBar label="Assists" value={(stats.avgAssists || 0).toFixed(1)} max={15} color="text-blue-400" />
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">Recent Trend</h3>
          <div className="text-center py-6">
            <div className="text-6xl mb-3">{getTrendEmoji(stats.recentTrend)}</div>
            <div className="text-2xl font-bold text-white mb-2">{stats.recentTrend}</div>
            <div className="text-gray-400">
              Recent Win Rate: <span className={getWinRateColor(stats.recentWinRate)}>
                {stats.recentWinRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBar({ label, value, max, color }) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-400">{label}</span>
        <span className={`font-bold ${color}`}>{value}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color.replace('text', 'bg')} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default StatsOverview


