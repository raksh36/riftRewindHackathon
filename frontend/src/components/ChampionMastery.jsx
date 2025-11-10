import { Trophy, TrendingUp, Zap } from 'lucide-react'
import { getWinRateColor, getKDAColor } from '../utils/formatters'

function ChampionMastery({ champions }) {
  if (!champions || champions.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">No champion data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Champion */}
      <div className="card bg-gradient-to-br from-yellow-900/30 to-orange-900/30">
        <div className="flex items-center space-x-3 mb-6">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Your Main Champion</h2>
        </div>
        {champions[0] && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-4xl font-bold text-yellow-400 mb-4">
                {champions[0].championName}
              </h3>
              <div className="space-y-2 text-gray-300">
                <p className="text-lg">
                  <span className="text-gray-400">Games:</span>{' '}
                  <span className="font-bold">{champions[0].gamesPlayed}</span>
                </p>
                <p className="text-lg">
                  <span className="text-gray-400">Win Rate:</span>{' '}
                  <span className={`font-bold ${getWinRateColor(champions[0].winRate)}`}>
                    {champions[0].winRate}%
                  </span>
                </p>
                <p className="text-lg">
                  <span className="text-gray-400">KDA:</span>{' '}
                  <span className={`font-bold ${getKDAColor(champions[0].avgKDA)}`}>
                    {champions[0].avgKDA}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <div className="text-6xl">🏆</div>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold">
                  #{1}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Champion Pool */}
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">Your Champion Pool</h2>
        <div className="space-y-4">
          {champions.map((champion, index) => (
            <ChampionCard key={index} champion={champion} rank={index + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ChampionCard({ champion, rank }) {
  return (
    <div className="champion-card bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-all">
      <div className="flex items-center space-x-4">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
            ${rank === 1 ? 'bg-yellow-400 text-gray-900' : 
              rank === 2 ? 'bg-gray-400 text-gray-900' : 
              rank === 3 ? 'bg-orange-600 text-white' : 
              'bg-gray-700 text-gray-300'}`}
          >
            #{rank}
          </div>
        </div>

        {/* Champion Name & Stats */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{champion.championName}</h3>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-400">
              {champion.gamesPlayed} games
            </span>
            <span className={getWinRateColor(champion.winRate)}>
              {champion.winRate}% WR
            </span>
            <span className={getKDAColor(champion.avgKDA)}>
              {champion.avgKDA} KDA
            </span>
          </div>
        </div>

        {/* Win/Loss */}
        <div className="flex-shrink-0 text-right">
          <div className="text-green-400 font-bold">{champion.wins}W</div>
          <div className="text-red-400 font-bold">{champion.losses}L</div>
        </div>

        {/* KDA Breakdown */}
        <div className="flex-shrink-0 text-center bg-gray-900/50 rounded-lg px-4 py-2">
          <div className="text-xs text-gray-400 mb-1">Avg</div>
          <div className="text-sm font-bold text-white">
            <span className="text-green-400">{champion.avgKills}</span>
            {' / '}
            <span className="text-red-400">{champion.avgDeaths}</span>
            {' / '}
            <span className="text-blue-400">{champion.avgAssists}</span>
          </div>
        </div>
      </div>

      {/* Win Rate Bar */}
      <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-500"
          style={{ width: `${champion.winRate}%` }}
        />
      </div>
    </div>
  )
}

export default ChampionMastery

