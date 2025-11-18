import { Trophy, Target, TrendingUp, Award, Crown, Eye, Coins, Swords, Shield, Zap, Flame, Mountain, Skull, HeartPulse, Wrench, BarChart3 } from 'lucide-react'
import { getKDAColor, getWinRateColor, getTrendEmoji } from '../utils/formatters'
import { useMemo } from 'react'

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

  // Secondary stats
  const secondaryStats = [
    {
      icon: <Swords className="w-5 h-5" />,
      label: 'Avg CS/min',
      value: stats.avgCS ? (stats.avgCS / (stats.avgGameDuration / 60)).toFixed(1) : '0.0',
      color: 'text-orange-400'
    },
    {
      icon: <Eye className="w-5 h-5" />,
      label: 'Vision Score',
      value: stats.avgVisionScore ? stats.avgVisionScore.toFixed(1) : 'N/A',
      color: 'text-cyan-400'
    },
    {
      icon: <Coins className="w-5 h-5" />,
      label: 'Gold/min',
      value: stats.avgGold ? (stats.avgGold / (stats.avgGameDuration / 60)).toFixed(0) : '0',
      color: 'text-yellow-400'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Damage Dealt',
      value: stats.avgDamageDealt ? `${(stats.avgDamageDealt / 1000).toFixed(1)}k` : 'N/A',
      color: 'text-red-400'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Kill Participation',
      value: stats.avgKillParticipation ? `${stats.avgKillParticipation.toFixed(1)}%` : 'N/A',
      color: 'text-purple-400'
    }
  ]

  // Memoize expensive playstyle calculation
  const playstyleProfile = useMemo(() => {
    if (!stats) return null
    
    const aggression = Math.min(((stats.avgKills || 0) / 8) * 100, 100)
    const teamwork = Math.min(((stats.avgAssists || 0) / 10) * 100, 100)
    const survival = Math.max(100 - ((stats.avgDeaths || 0) / 6) * 100, 0)
    const farming = stats.avgCS ? Math.min(((stats.avgCS / (stats.avgGameDuration / 60)) / 7) * 100, 100) : 0
    const vision = stats.avgVisionScore ? Math.min((stats.avgVisionScore / 50) * 100, 100) : 0
    
    return [
      { name: 'Aggression', value: aggression.toFixed(0), color: 'bg-red-500', icon: '⚔️' },
      { name: 'Teamwork', value: teamwork.toFixed(0), color: 'bg-blue-500', icon: '🤝' },
      { name: 'Survival', value: survival.toFixed(0), color: 'bg-green-500', icon: '🛡️' },
      { name: 'Farming', value: farming.toFixed(0), color: 'bg-yellow-500', icon: '🌾' },
      { name: 'Vision', value: vision.toFixed(0), color: 'bg-cyan-500', icon: '👁️' }
    ]
  }, [stats])

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

      {/* Secondary Stats Row */}
      <div className="card">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-rift-blue" />
          Detailed Performance Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {secondaryStats.map((stat, index) => (
            <div key={index} className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
              <div className={`${stat.color} mb-1 flex justify-center`}>{stat.icon}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ranked Stats */}
      {enhancedAnalytics?.ranked_stats && (
        <div className="card bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-700/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-400" />
            Ranked Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enhancedAnalytics.ranked_stats.map((queue, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="text-center mb-3">
                  <div className="text-lg font-bold text-yellow-400">
                    {queue.tier} {queue.rank}
                  </div>
                  <div className="text-sm text-gray-400">{queue.queueType}</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">LP</span>
                    <span className="text-white font-bold">{queue.leaguePoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate</span>
                    <span className={getWinRateColor(queue.winRate)}>
                      {queue.winRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Games</span>
                    <span className="text-white">{queue.wins + queue.losses}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Epic Achievements */}
      {(stats.pentakills > 0 || stats.quadrakills > 0 || stats.bestGameKDA > 10) && (
        <div className="card bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-700/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-400" />
            Epic Moments
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.pentakills > 0 && (
              <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-lg p-4 text-center border border-yellow-700/50">
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.pentakills}</div>
                <div className="text-sm text-gray-300">Pentakill{stats.pentakills > 1 ? 's' : ''}</div>
              </div>
            )}
            {stats.quadrakills > 0 && (
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-4 text-center border border-purple-700/50">
                <div className="text-4xl mb-2">💥</div>
                <div className="text-2xl font-bold text-purple-400">{stats.quadrakills}</div>
                <div className="text-sm text-gray-300">Quadrakill{stats.quadrakills > 1 ? 's' : ''}</div>
              </div>
            )}
            {stats.bestGameKDA && stats.bestGameKDA > 10 && (
              <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg p-4 text-center border border-cyan-700/50">
                <div className="text-4xl mb-2">🔥</div>
                <div className="text-2xl font-bold text-cyan-400">{stats.bestGameKDA.toFixed(1)}</div>
                <div className="text-sm text-gray-300">Best KDA</div>
              </div>
            )}
            {stats.avgKDA > 4 && (
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-4 text-center border border-green-700/50">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-green-400">{stats.avgKDA.toFixed(2)}</div>
                <div className="text-sm text-gray-300">Elite KDA</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Champion Pool & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Breakdown */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">Performance Breakdown</h3>
          <div className="space-y-3">
            <StatBar label="Kills" value={(stats.avgKills || 0).toFixed(1)} max={15} color="text-green-400" />
            <StatBar label="Deaths" value={(stats.avgDeaths || 0).toFixed(1)} max={15} color="text-red-400" />
            <StatBar label="Assists" value={(stats.avgAssists || 0).toFixed(1)} max={15} color="text-blue-400" />
          </div>
        </div>

        {/* Recent Trend */}
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

        {/* Top Champions Quick View */}
        {stats.topChampions && stats.topChampions.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-4">Champion Pool</h3>
            <div className="space-y-2">
              {stats.topChampions.slice(0, 3).map((champ, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-yellow-400' : 
                      index === 1 ? 'bg-gray-400' : 
                      'bg-orange-600'
                    }`} />
                    <span className="text-white font-medium">{champ.championName}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getWinRateColor(champ.winRate)}`}>
                      {champ.winRate}%
                    </div>
                    <div className="text-xs text-gray-500">{champ.gamesPlayed} games</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Playstyle Profile */}
      {playstyleProfile && (
        <div className="card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-700/30">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-indigo-400" />
            Playstyle Profile
          </h3>
          <div className="space-y-4">
            {playstyleProfile.map((trait, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{trait.icon}</span>
                    <span className="text-white font-medium">{trait.name}</span>
                  </div>
                  <span className="text-white font-bold">{trait.value}%</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${trait.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${trait.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-gray-300 text-sm">
              Your playstyle is calculated from your in-game performance across kills, assists, deaths, farming, and vision control.
            </p>
          </div>
        </div>
      )}

      {/* Game Duration & Consistency */}
      {stats.avgGameDuration && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
              Game Duration
            </h3>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-blue-400 mb-2">
                {Math.floor(stats.avgGameDuration / 60)}:{String(Math.floor(stats.avgGameDuration % 60)).padStart(2, '0')}
              </div>
              <div className="text-gray-400">Average Game Length</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400 mb-1">Longest</div>
                <div className="text-lg font-bold text-white">
                  {stats.longestGame ? `${Math.floor(stats.longestGame / 60)}m` : 'N/A'}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400 mb-1">Shortest</div>
                <div className="text-lg font-bold text-white">
                  {stats.shortestGame ? `${Math.floor(stats.shortestGame / 60)}m` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-400" />
              Consistency Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Win Streak</span>
                <span className="text-green-400 font-bold">
                  {stats.longestWinStreak || 0} games
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Loss Streak</span>
                <span className="text-red-400 font-bold">
                  {stats.longestLossStreak || 0} games
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">First Blood Rate</span>
                <span className="text-yellow-400 font-bold">
                  {stats.firstBloodRate ? `${stats.firstBloodRate.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Objective Control & Combat Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objective Control */}
        <div className="card bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-700/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Mountain className="w-5 h-5 mr-2 text-orange-400" />
            Objective Control
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
              <div className="text-3xl mb-2">🐉</div>
              <div className="text-2xl font-bold text-blue-400">
                {stats.avgDragonKills ? stats.avgDragonKills.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-400 mt-1">Dragons / Game</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
              <div className="text-3xl mb-2">👹</div>
              <div className="text-2xl font-bold text-purple-400">
                {stats.avgBaronKills ? stats.avgBaronKills.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-400 mt-1">Barons / Game</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
              <div className="text-3xl mb-2">🗼</div>
              <div className="text-2xl font-bold text-red-400">
                {stats.avgTurretKills ? stats.avgTurretKills.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-400 mt-1">Towers / Game</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
              <div className="text-3xl mb-2">🏰</div>
              <div className="text-2xl font-bold text-yellow-400">
                {stats.avgInhibitorKills ? stats.avgInhibitorKills.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-400 mt-1">Inhibitors / Game</div>
            </div>
          </div>
        </div>

        {/* Combat Statistics */}
        <div className="card bg-gradient-to-br from-red-900/20 to-pink-900/20 border border-red-700/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Flame className="w-5 h-5 mr-2 text-red-400" />
            Combat Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-gray-400">Damage Taken</span>
              </div>
              <span className="text-red-400 font-bold">
                {stats.avgDamageTaken ? `${(stats.avgDamageTaken / 1000).toFixed(1)}k` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">Healing Done</span>
              </div>
              <span className="text-green-400 font-bold">
                {stats.avgHealing ? `${(stats.avgHealing / 1000).toFixed(1)}k` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Skull className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">Damage Mitigated</span>
              </div>
              <span className="text-purple-400 font-bold">
                {stats.avgDamageMitigated ? `${(stats.avgDamageMitigated / 1000).toFixed(1)}k` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400">Damage / Gold</span>
              </div>
              <span className="text-yellow-400 font-bold">
                {stats.avgDamageDealt && stats.avgGold 
                  ? (stats.avgDamageDealt / stats.avgGold).toFixed(2) 
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Contribution & Gold Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Contribution Breakdown */}
        <div className="card bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
            Team Contribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Damage Share</span>
                <span className="text-red-400 font-bold">
                  {stats.avgDamageShare ? `${stats.avgDamageShare.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${Math.min(stats.avgDamageShare || 0, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Gold Share</span>
                <span className="text-yellow-400 font-bold">
                  {stats.avgGoldShare ? `${stats.avgGoldShare.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all duration-500"
                  style={{ width: `${Math.min(stats.avgGoldShare || 0, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Kill Participation</span>
                <span className="text-purple-400 font-bold">
                  {stats.avgKillParticipation ? `${stats.avgKillParticipation.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${Math.min(stats.avgKillParticipation || 0, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gold Efficiency */}
        <div className="card bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-700/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-yellow-400" />
            Gold Efficiency
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Total Gold Earned</span>
                <span className="text-yellow-400 font-bold text-lg">
                  {stats.avgGold ? `${(stats.avgGold / 1000).toFixed(1)}k` : 'N/A'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {stats.avgGold && stats.avgGameDuration 
                  ? `${((stats.avgGold / (stats.avgGameDuration / 60))).toFixed(0)} gold/min`
                  : ''}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">CS Gold Efficiency</span>
                <span className="text-orange-400 font-bold text-lg">
                  {stats.avgCS && stats.avgGold 
                    ? `${((stats.avgCS * 20 / stats.avgGold) * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                CS contribution to total gold
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Kill/Assist Gold</span>
                <span className="text-red-400 font-bold text-lg">
                  {stats.avgKills && stats.avgAssists 
                    ? `${((stats.avgKills * 300 + stats.avgAssists * 150) / 1000).toFixed(1)}k`
                    : 'N/A'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Estimated from takedowns
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance by Game Length */}
      {stats.avgGameDuration && (
        <div className="card bg-gradient-to-br from-cyan-900/20 to-teal-900/20 border border-cyan-700/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
            Performance Analysis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Early Game</div>
              <div className="text-2xl font-bold text-green-400">
                {stats.earlyGamePerformance || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">0-15 min</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Mid Game</div>
              <div className="text-2xl font-bold text-blue-400">
                {stats.midGamePerformance || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">15-25 min</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Late Game</div>
              <div className="text-2xl font-bold text-purple-400">
                {stats.lateGamePerformance || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">25+ min</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Snowball Rate</div>
              <div className="text-2xl font-bold text-orange-400">
                {stats.snowballRate ? `${stats.snowballRate.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Win from lead</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Preferred Game Length</span>
              <span className="text-cyan-400 font-bold">
                {stats.avgGameDuration < 1500 ? 'Early Game' : 
                 stats.avgGameDuration < 1800 ? 'Mid Game' : 'Late Game'}
              </span>
            </div>
          </div>
        </div>
      )}
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

