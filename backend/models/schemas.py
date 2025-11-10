"""
Pydantic models for request/response schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class PlayerSearchRequest(BaseModel):
    """Request model for player search"""
    summonerName: str = Field(..., description="League of Legends summoner name")
    region: str = Field(..., description="Region code (e.g., na1, euw1)")
    matchCount: Optional[int] = Field(default=20, ge=1, le=100)


class ChampionStats(BaseModel):
    """Statistics for a specific champion"""
    championId: int
    championName: str
    gamesPlayed: int
    wins: int
    losses: int
    winRate: float
    avgKDA: float
    avgKills: float
    avgDeaths: float
    avgAssists: float


class PlayerStatsResponse(BaseModel):
    """Response model for player statistics"""
    summonerName: str
    region: str
    totalGames: int
    totalWins: int
    totalLosses: int
    winRate: float
    avgKDA: float
    topChampions: List[ChampionStats]
    roleDistribution: Dict[str, int]
    performanceTrends: Dict[str, Any]


class AIInsightsResponse(BaseModel):
    """Response model for AI-generated insights"""
    summoner: str
    narrative: str
    strengths: List[str]
    areasForGrowth: List[str]
    highlights: List[str]
    playstyleDescription: str
    recommendations: List[str]


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


