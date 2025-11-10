import { Trophy, Target, TrendingUp, Award, Crown, Zap, Star } from 'lucide-react'
import { getKDAColor, getWinRateColor, getTrendEmoji } from '../utils/formatters'

function StatsOverview({ stats, summonerName, enhancedAnalytics }) {
  if (!stats) return null
  
  const ranked = enhancedAnalytics?.ranked
  const timeline = enhancedAnalytics?.recent_match_timeline
  const challenges = enhancedAnalytics?.challenges
  const liveStatus = enhancedAnalytics?.live_status

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
      value: stats.avgKDA || 0,
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
        <h2 className="text-3xl font-bold text-white mb-2">{summonerName}'s Year</h2>
        <p className="text-gray-400 mb-6">Your complete League of Legends journey</p>
        
        {/* Live Status Badge */}
        {liveStatus?.in_game && (
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-semibold">Currently In Game</span>
          </div>
        )}
        
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

      {/* Ranked Stats */}
      {ranked?.has_ranked && (
        <div className="card bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))' }}>
                {ranked.rank_display.tier_icon}
              </div>
              <div>
                <div className="text-sm text-gray-400">Current Rank</div>
                <div className="text-3xl font-bold" style={{ color: ranked.rank_display.tier_color }}>
                  {ranked.full_rank}
                </div>
                <div className="text-sm text-amber-400">{ranked.lp} LP</div>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <div className="px-4 py-2 bg-amber-500/20 rounded-lg">
                <div className="text-2xl font-bold text-white">{ranked.percentile_text}</div>
                <div className="text-sm text-gray-400">of all players</div>
              </div>
              <div className="text-sm text-gray-400">
                {ranked.wins}W / {ranked.losses}L ({ranked.win_rate}%)
              </div>
              {ranked.hot_streak && (
                <div className="flex items-center justify-end gap-1 text-orange-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-semibold">Hot Streak!</span>
                </div>
              )}
            </div>
          </div>
          
          {ranked.insights && ranked.insights.length > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-500/30 space-y-1">
              {ranked.insights.map((insight, idx) => (
                <div key={idx} className="text-sm text-gray-300">{insight}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Breakdown */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">Performance Breakdown</h3>
          <div className="space-y-3">
            <StatBar
              label="Kills"
              value={stats.avgKills?.toFixed(1) || 0}
              max={15}
              color="text-green-400"
            />
            <StatBar
              label="Deaths"
              value={stats.avgDeaths?.toFixed(1) || 0}
              max={15}
              color="text-red-400"
            />
            <StatBar
              label="Assists"
              value={stats.avgAssists?.toFixed(1) || 0}
              max={15}
              color="text-blue-400"
            />
          </div>
        </div>

        {/* Recent Performance */}
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

      {/* Laning Phase Analytics */}
      {timeline?.available && timeline.laning_phase && (
        <div className="card bg-gradient-to-r from-emerald-900/20 to-green-900/20 border border-emerald-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-emerald-400" />
            Laning Phase Performance
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-emerald-900/30 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">CS @ 10min</div>
              <div className="text-2xl font-bold text-emerald-400">{timeline.laning_phase.cs_at_10}</div>
            </div>
            <div className="text-center p-3 bg-emerald-900/30 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">CS @ 15min</div>
              <div className="text-2xl font-bold text-emerald-400">{timeline.laning_phase.cs_at_15}</div>
            </div>
            <div className="text-center p-3 bg-emerald-900/30 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">CS/Min</div>
              <div className="text-2xl font-bold text-emerald-400">{timeline.laning_phase.cs_per_min_15}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Early Game Rating: <span className="font-bold text-emerald-400">{timeline.early_game_rating}</span>
            </div>
            {timeline.first_blood?.participated && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-lg">
                <Crown className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">First Blood {timeline.first_blood.role}</span>
              </div>
            )}
          </div>
          {timeline.comeback?.is_comeback && (
            <div className="mt-3 pt-3 border-t border-emerald-500/30 text-center">
              <div className="text-lg font-bold text-emerald-400">🏆 {timeline.comeback.message}</div>
            </div>
          )}
        </div>
      )}

      {/* Rare Achievements from Challenges */}
      {challenges?.available && challenges.rare_achievements && challenges.rare_achievements.length > 0 && (
        <div className="card bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-purple-400" />
            Rare Achievements ({challenges.rare_achievements.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {challenges.rare_achievements.slice(0, 6).map((achievement, idx) => (
              <div key={idx} className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{achievement.icon}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    achievement.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                    achievement.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {achievement.rarity}
                  </span>
                </div>
                <div className="text-sm text-gray-400">Challenge #{achievement.challenge_id}</div>
                <div className="text-lg font-bold text-white mt-1">
                  Top {(100 - achievement.percentile).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          {challenges.category_strengths?.strongest_category && (
            <div className="mt-4 pt-4 border-t border-purple-500/30 text-center">
              <div className="text-sm text-gray-400">Strongest Category</div>
              <div className="text-xl font-bold text-purple-400 flex items-center justify-center gap-2">
                <span>{challenges.category_strengths.strength_info?.icon}</span>
                <span>{challenges.category_strengths.strongest_category}</span>
              </div>
              <div className="text-sm text-gray-300 mt-1">
                {challenges.category_strengths.strength_info?.description}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {(stats.achievements?.pentakills > 0 || stats.achievements?.quadrakills > 0) && (
        <div className="card bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-400" />
            Epic Achievements
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {stats.achievements.pentakills > 0 && (
              <div className="text-center p-4 bg-yellow-900/30 rounded-lg">
                <div className="text-4xl font-bold text-yellow-400">
                  {stats.achievements.pentakills}
                </div>
                <div className="text-sm text-gray-400">Pentakills</div>
              </div>
            )}
            {stats.achievements.quadrakills > 0 && (
              <div className="text-center p-4 bg-orange-900/30 rounded-lg">
                <div className="text-4xl font-bold text-orange-400">
                  {stats.achievements.quadrakills}
                </div>
                <div className="text-sm text-gray-400">Quadrakills</div>
              </div>
            )}
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

