import { Trophy, TrendingUp, Award, Gamepad2, Target } from 'lucide-react'

function ShareCard({ stats, summonerName }) {
  if (!stats) return null

  const topChamps = stats.topChampions?.slice(0, 3).map(c => c.championName).join(', ') || 'Various champions'

  return (
    <div className="card bg-gradient-to-br from-rift-blue via-purple-600 to-rift-purple p-8" id="share-card">
      <div className="text-center mb-6">
        <Gamepad2 className="w-12 h-12 text-white mx-auto mb-3" />
        <h2 className="text-3xl font-bold text-white mb-2">Rift Rewind 2024/25</h2>
        <h3 className="text-4xl font-bold text-rift-gold">{summonerName}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatBox
          icon={<Trophy className="w-6 h-6" />}
          label="Games Played"
          value={stats.totalGames}
          color="bg-blue-500/20"
        />
        <StatBox
          icon={<Target className="w-6 h-6" />}
          label="Win Rate"
          value={`${stats.winRate}%`}
          color="bg-green-500/20"
        />
        <StatBox
          icon={<TrendingUp className="w-6 h-6" />}
          label="KDA"
          value={stats.avgKDA?.toFixed(2)}
          color="bg-purple-500/20"
        />
        <StatBox
          icon={<Award className="w-6 h-6" />}
          label="Role"
          value={stats.mostPlayedRole}
          color="bg-yellow-500/20"
        />
      </div>

      <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
        <h4 className="text-sm text-gray-200 mb-2">Top Champions</h4>
        <p className="text-lg font-bold text-white">{topChamps}</p>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-200">Get your year-end recap at</p>
        <p className="text-lg font-bold text-rift-gold">riftrewind.gg</p>
      </div>
    </div>
  )
}

function StatBox({ icon, label, value, color }) {
  return (
    <div className={`${color} backdrop-blur rounded-lg p-4 text-center`}>
      <div className="text-white mb-2 flex justify-center">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-200">{label}</div>
    </div>
  )
}

export default ShareCard

