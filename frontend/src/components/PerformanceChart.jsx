import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

function PerformanceChart({ stats }) {
  if (!stats) return null

  // Prepare monthly performance data
  const monthlyData = stats.monthlyPerformance || {}
  const months = Object.keys(monthlyData).sort()
  const winRates = months.map(month => {
    const data = monthlyData[month]
    return data.games > 0 ? ((data.wins / data.games) * 100).toFixed(1) : 0
  })

  // Line chart configuration
  const lineChartData = {
    labels: months.map(m => {
      const [year, month] = m.split('-')
      return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }),
    datasets: [
      {
        label: 'Win Rate %',
        data: winRates,
        borderColor: '#0AC8B9',
        backgroundColor: 'rgba(10, 200, 185, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#0AC8B9',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: '#0AC8B9',
        borderWidth: 1,
        titleColor: '#F0E6D2',
        bodyColor: '#F0E6D2',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Win Rate: ${context.parsed.y}%`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%'
          },
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        }
      },
      x: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          display: false
        }
      }
    }
  }

  // Role distribution donut chart
  const roleData = stats.roleDistribution || {}
  const roleLabels = Object.keys(roleData)
  const roleValues = Object.values(roleData)

  const doughnutData = {
    labels: roleLabels,
    datasets: [
      {
        data: roleValues,
        backgroundColor: [
          '#0AC8B9', // Top
          '#C89B3C', // Jungle
          '#9B30FF', // Mid
          '#FF6B6B', // ADC
          '#4ECDC4', // Support
        ],
        borderColor: '#0A1428',
        borderWidth: 3,
      }
    ]
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#F0E6D2',
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: '#0AC8B9',
        borderWidth: 1,
        titleColor: '#F0E6D2',
        bodyColor: '#F0E6D2',
        padding: 12,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${context.parsed} games (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Win Rate Trend */}
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">Performance Over Time</h2>
        <div className="h-80">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      {/* Role Distribution */}
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">Role Distribution</h2>
        <div className="h-80">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  )
}

export default PerformanceChart

