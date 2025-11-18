import axios from 'axios'
import { API_BASE_URL } from '../config/apiConfig'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3 minutes for 20+ match analytics
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

// API methods
export const getRegions = async () => {
  const response = await api.get('/api/regions')
  return response.data
}

export const getDemoData = async () => {
  const response = await api.get('/api/demo/player')
  return response.data
}

export const getPlayerStats = async (region, summonerName, matchCount = 15) => {
  const response = await api.get(`/api/player/${region}/${encodeURIComponent(summonerName)}`, {
    params: { match_count: matchCount }
  })
  return response.data
}

export const generateInsights = async (region, summonerName, matchCount = 15) => {
  const response = await api.post('/api/insights', {
    region,
    summonerName,
    matchCount
  })
  return response.data
}

export const generateRoast = async (region, summonerName, matchCount = 15) => {
  const response = await api.post('/api/roast', {
    region,
    summonerName,
    matchCount
  })
  return response.data
}

export const discoverHiddenGems = async (region, summonerName, matchCount = 15) => {
  const response = await api.post('/api/hidden-gems', {
    region,
    summonerName,
    matchCount
  })
  return response.data
}

export const analyzePersonality = async (region, summonerName, matchCount = 15) => {
  const response = await api.post('/api/personality', {
    region,
    summonerName,
    matchCount
  })
  return response.data
}

export const comparePlayers = async (player1, player2, region, matchCount = 15) => {
  const response = await api.post('/api/compare', {
    player1,
    player2,
    region,
    matchCount
  })
  return response.data
}

export default api

