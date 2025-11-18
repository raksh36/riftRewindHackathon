import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import LoadingPage from './pages/LoadingPage'
import ComparePage from './pages/ComparePage'
import './App.css'

function App() {
  return (
    <Router basename="/riftRewindHackathon">
      <div className="min-h-screen bg-rift-dark">
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#F0E6D2',
              border: '1px solid #0AC8B9',
            },
            success: {
              iconTheme: {
                primary: '#0AC8B9',
                secondary: '#1e293b',
              },
            },
            error: {
              iconTheme: {
                primary: '#D13639',
                secondary: '#1e293b',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/dashboard/:region/:summonerName" element={<DashboardPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

