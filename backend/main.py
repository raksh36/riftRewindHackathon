"""
Rift Rewind - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from typing import Optional

from services.riot_api import RiotAPIClient
from services.aws_bedrock import BedrockAIService
from services.analyzer import MatchAnalyzer
from services.pattern_detector import PatternDetector
from services.model_selector import model_selector
from services.advanced_analytics import rank_analyzer, timeline_analyzer, challenge_analyzer
from services.additional_analytics import clash_analyzer, mastery_analyzer, free_champion_analyzer, challenge_config_analyzer
from demo_data import get_demo_player_data
from models.schemas import (
    PlayerSearchRequest,
    PlayerStatsResponse,
    AIInsightsResponse,
    ErrorResponse
)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Rift Rewind API",
    description="AI-powered League of Legends year-end recap service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
riot_client = RiotAPIClient(api_key=os.getenv("RIOT_API_KEY"))
bedrock_service = BedrockAIService(
    region=os.getenv("AWS_REGION", "us-east-1"),
    model_id=os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")
)
analyzer = MatchAnalyzer()
pattern_detector = PatternDetector()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Welcome to Rift Rewind API",
        "status": "online",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "riot_api": "configured" if os.getenv("RIOT_API_KEY") else "missing_key",
            "aws_bedrock": "configured" if all([
                os.getenv("AWS_ACCESS_KEY_ID"),
                os.getenv("AWS_SECRET_ACCESS_KEY")
            ]) else "missing_credentials"
        }
    }


@app.get("/api/player/{region}/{summoner_name}")
async def get_player_stats(
    region: str,
    summoner_name: str,
    match_count: Optional[int] = Query(default=20, ge=1, le=100)
):
    """
    Fetch player statistics and match history
    
    Args:
        region: League region (e.g., na1, euw1, kr)
        summoner_name: Player's summoner name
        match_count: Number of recent matches to analyze (1-100)
    
    Returns:
        Comprehensive player statistics
    """
    try:
        # Get summoner account info
        summoner = await riot_client.get_summoner_by_name(region, summoner_name)
        
        if not summoner:
            raise HTTPException(
                status_code=404,
                detail=f"Summoner '{summoner_name}' not found in region '{region}'"
            )
        
        # Get display name (handle both old 'name' and new 'gameName#tagLine' formats)
        if 'gameName' in summoner and 'tagLine' in summoner:
            display_name = f"{summoner['gameName']}#{summoner['tagLine']}"
        elif 'name' in summoner:
            display_name = summoner['name']
        else:
            display_name = summoner_name
        
        # Get match history
        matches = await riot_client.get_match_history(
            region=region,
            puuid=summoner["puuid"],
            count=match_count
        )
        
        if not matches:
            raise HTTPException(
                status_code=404,
                detail="No matches found for this summoner"
            )
        
        # Analyze matches
        stats = analyzer.analyze_matches(matches, summoner["puuid"])
        
        # === ENHANCED ANALYTICS (PARALLEL EXECUTION) ===
        
        # Run all independent API calls in parallel for speed
        import asyncio
        
        # Group 1: Critical analytics (must succeed)
        ranked_task = riot_client.get_ranked_stats(region, summoner["puuid"])
        challenges_task = riot_client.get_challenges(region, summoner["puuid"])
        active_game_task = riot_client.get_active_game(region, summoner["puuid"])
        
        # Group 2: Timeline (depends on matches)
        timeline_task = None
        if matches:
            most_recent_match_id = matches[0].get("metadata", {}).get("matchId")
            if most_recent_match_id:
                timeline_task = riot_client.get_match_timeline(region, most_recent_match_id)
        
        # Group 3: Additional analytics (optional, won't block if they fail)
        clash_task = riot_client.get_clash_data(region, summoner["puuid"])
        total_mastery_task = riot_client.get_total_mastery_score(region, summoner["puuid"])
        top_masteries_task = riot_client.get_top_champion_masteries(region, summoner["puuid"], 10)
        rotation_task = riot_client.get_champion_rotations(region)
        challenge_config_task = riot_client.get_challenge_config(region)
        
        # Execute all tasks in parallel with error handling
        results = await asyncio.gather(
            ranked_task,
            challenges_task,
            active_game_task,
            timeline_task if timeline_task else asyncio.sleep(0),
            clash_task,
            total_mastery_task,
            top_masteries_task,
            rotation_task,
            challenge_config_task,
            return_exceptions=True  # Don't fail if one API fails
        )
        
        # Unpack results with error handling
        ranked_data = results[0] if not isinstance(results[0], Exception) else None
        challenges_data = results[1] if not isinstance(results[1], Exception) else None
        active_game = results[2] if not isinstance(results[2], Exception) else None
        timeline_data = results[3] if not isinstance(results[3], Exception) else None
        clash_data = results[4] if not isinstance(results[4], Exception) else []
        total_mastery = results[5] if not isinstance(results[5], Exception) else 0
        top_masteries = results[6] if not isinstance(results[6], Exception) else []
        rotation_data = results[7] if not isinstance(results[7], Exception) else None
        challenge_config = results[8] if not isinstance(results[8], Exception) else []
        
        # Analyze results
        rank_analysis = rank_analyzer.analyze_rank(ranked_data) if ranked_data else {"has_ranked": False}
        challenge_analysis = challenge_analyzer.analyze_challenges(challenges_data) if challenges_data else {"available": False}
        is_playing_now = active_game is not None
        
        # Timeline analysis
        timeline_analysis = {"available": False}
        if timeline_data and matches:
            participants = matches[0].get("info", {}).get("participants", [])
            player_data = next(
                (p for p in participants if p.get("puuid") == summoner["puuid"]),
                None
            )
            if player_data:
                participant_id = player_data.get("participantId", 1)
                win = player_data.get("win", False)
                timeline_analysis = timeline_analyzer.analyze_timeline(
                    timeline_data,
                    participant_id,
                    win
                )
        
        # Additional analytics
        clash_analysis = clash_analyzer.analyze_clash_history(clash_data)
        mastery_analysis = mastery_analyzer.analyze_total_mastery(total_mastery, top_masteries)
        
        # Free rotation analysis
        recent_champs = [p.get('championId') for match in matches[:20] 
                        for p in match.get('info', {}).get('participants', []) 
                        if p.get('puuid') == summoner["puuid"]]
        rotation_analysis = free_champion_analyzer.analyze_free_rotation_usage(rotation_data, recent_champs)
        
        # Enrich challenges
        enriched_challenges = challenge_config_analyzer.enrich_challenges(challenges_data, challenge_config)
        
        return {
            "summoner": {
                "name": display_name,
                "level": summoner["summonerLevel"],
                "profileIconId": summoner["profileIconId"],
                "puuid": summoner["puuid"],
                "is_playing_now": is_playing_now
            },
            "stats": stats,
            "matchCount": len(matches),
            "enhanced_analytics": {
                "ranked": rank_analysis,
                "challenges": challenge_analysis,
                "challenges_enriched": enriched_challenges,
                "recent_match_timeline": timeline_analysis,
                "live_status": {
                    "in_game": is_playing_now,
                    "message": "Currently in a match!" if is_playing_now else "Offline or not in game"
                },
                "clash": clash_analysis,
                "mastery": mastery_analysis,
                "free_rotation": rotation_analysis
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching player data: {str(e)}"
        )


@app.post("/api/insights")
async def generate_insights(request: PlayerSearchRequest):
    """
    Generate AI-powered insights using AWS Bedrock
    
    Args:
        request: Player search parameters and stats
    
    Returns:
        AI-generated personalized insights
    """
    try:
        # First get player stats
        summoner = await riot_client.get_summoner_by_name(
            request.region,
            request.summonerName
        )
        
        if not summoner:
            raise HTTPException(
                status_code=404,
                detail=f"Summoner not found"
            )
        
        # Get matches
        matches = await riot_client.get_match_history(
            region=request.region,
            puuid=summoner["puuid"],
            count=request.matchCount or 20
        )
        
        # Analyze matches
        stats = analyzer.analyze_matches(matches, summoner["puuid"])
        
        # Generate AI insights
        insights = await bedrock_service.generate_year_recap(
            summoner_name=display_name,
            stats=stats
        )
        
        return {
            "summoner": display_name,
            "insights": insights,
            "timestamp": "2025-01-01T00:00:00Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating insights: {str(e)}"
        )


@app.get("/api/regions")
async def get_regions():
    """Get list of supported League of Legends regions"""
    return {
        "regions": [
            {"code": "na1", "name": "North America"},
            {"code": "euw1", "name": "Europe West"},
            {"code": "eune1", "name": "Europe Nordic & East"},
            {"code": "kr", "name": "Korea"},
            {"code": "br1", "name": "Brazil"},
            {"code": "la1", "name": "Latin America North"},
            {"code": "la2", "name": "Latin America South"},
            {"code": "oc1", "name": "Oceania"},
            {"code": "tr1", "name": "Turkey"},
            {"code": "ru", "name": "Russia"},
            {"code": "jp1", "name": "Japan"},
            {"code": "ph2", "name": "Philippines"},
            {"code": "sg2", "name": "Singapore"},
            {"code": "th2", "name": "Thailand"},
            {"code": "tw2", "name": "Taiwan"},
            {"code": "vn2", "name": "Vietnam"}
        ]
    }


@app.get("/api/demo/player")
async def get_demo_player():
    """
    Get demo player data without calling Riot API
    
    Perfect for:
    - Testing the UI
    - Recording demo videos
    - Showing all features
    - Hackathon presentations
    
    Returns:
        Comprehensive demo data with all analytics
    """
    return get_demo_player_data()


@app.post("/api/roast")
async def generate_roast(request: PlayerSearchRequest):
    """
    Generate hilarious roasts - Roast Master 3000 feature
    
    Args:
        request: Player search parameters
        
    Returns:
        Funny roasts based on player performance
    """
    try:
        # Get player stats
        summoner = await riot_client.get_summoner_by_name(
            request.region,
            request.summonerName
        )
        
        if not summoner:
            raise HTTPException(status_code=404, detail="Summoner not found")
        
        # Get matches
        matches = await riot_client.get_match_history(
            region=request.region,
            puuid=summoner["puuid"],
            count=request.matchCount or 30
        )
        
        # Analyze matches
        stats = analyzer.analyze_matches(matches, summoner["puuid"])
        
        # Generate roast using Nova Lite (cost-effective creative content)
        roast = await bedrock_service.generate_roast(
            summoner_name=display_name,
            stats=stats
        )
        
        return {
            "summoner": display_name,
            "roast": roast,
            "model_used": "amazon.nova-lite-v1:0"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating roast: {str(e)}"
        )


@app.post("/api/hidden-gems")
async def discover_hidden_gems(request: PlayerSearchRequest):
    """
    Discover hidden patterns and surprising insights
    
    Args:
        request: Player search parameters
        
    Returns:
        Hidden gems discovered in gameplay
    """
    try:
        # Get player data
        summoner = await riot_client.get_summoner_by_name(
            request.region,
            request.summonerName
        )
        
        if not summoner:
            raise HTTPException(status_code=404, detail="Summoner not found")
        
        # Get matches
        matches = await riot_client.get_match_history(
            region=request.region,
            puuid=summoner["puuid"],
            count=request.matchCount or 50
        )
        
        # Analyze matches
        stats = analyzer.analyze_matches(matches, summoner["puuid"])
        
        # Detect patterns
        patterns = pattern_detector.detect_patterns(matches, stats, summoner["puuid"])
        
        # Enhance with AI insights using Claude Haiku (better pattern recognition)
        gems = await bedrock_service.discover_hidden_gems(
            summoner_name=display_name,
            stats=stats,
            patterns=patterns
        )
        
        return {
            "summoner": display_name,
            "gems": gems,
            "model_used": "anthropic.claude-3-haiku"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error discovering gems: {str(e)}"
        )


@app.post("/api/personality")
async def analyze_personality(request: PlayerSearchRequest):
    """
    Analyze League personality type - Chaos Engineering feature
    
    Args:
        request: Player search parameters
        
    Returns:
        Personality analysis and type
    """
    try:
        # Get player data
        summoner = await riot_client.get_summoner_by_name(
            request.region,
            request.summonerName
        )
        
        if not summoner:
            raise HTTPException(status_code=404, detail="Summoner not found")
        
        # Get matches
        matches = await riot_client.get_match_history(
            region=request.region,
            puuid=summoner["puuid"],
            count=request.matchCount or 40
        )
        
        # Analyze matches
        stats = analyzer.analyze_matches(matches, summoner["puuid"])
        
        # Generate personality analysis using Nova Lite (creative profiling)
        personality = await bedrock_service.analyze_personality(
            summoner_name=display_name,
            stats=stats
        )
        
        return {
            "summoner": display_name,
            "personality": personality,
            "model_used": "amazon.nova-lite-v1:0"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing personality: {str(e)}"
        )


@app.post("/api/compare")
async def compare_players(
    player1: str,
    player2: str,
    region: str,
    matchCount: Optional[int] = 30
):
    """
    Compare two players - Friend Comparison feature
    
    Args:
        player1: First player's summoner name
        player2: Second player's summoner name
        region: Region code
        matchCount: Number of matches to analyze
        
    Returns:
        Comparative analysis and synergy score
    """
    try:
        # Get both players
        summoner1 = await riot_client.get_summoner_by_name(region, player1)
        summoner2 = await riot_client.get_summoner_by_name(region, player2)
        
        if not summoner1 or not summoner2:
            raise HTTPException(status_code=404, detail="One or both summoners not found")
        
        # Get matches for both
        matches1 = await riot_client.get_match_history(
            region=region,
            puuid=summoner1["puuid"],
            count=matchCount
        )
        matches2 = await riot_client.get_match_history(
            region=region,
            puuid=summoner2["puuid"],
            count=matchCount
        )
        
        # Analyze both
        stats1 = analyzer.analyze_matches(matches1, summoner1["puuid"])
        stats2 = analyzer.analyze_matches(matches2, summoner2["puuid"])
        
        # Calculate synergy score (simple version)
        # In reality, this would analyze duo games together
        role_synergy = 0
        if stats1.get("mostPlayedRole") != stats2.get("mostPlayedRole"):
            role_synergy = 20  # Different roles = better synergy
        
        stat_similarity = 100 - abs(stats1.get("winRate", 0) - stats2.get("winRate", 0))
        synergy_score = (role_synergy + stat_similarity) / 2
        
        # Generate AI comparison using Nova Lite
        comparison = await bedrock_service.generate_playstyle_comparison(stats1, stats2)
        
        return {
            "player1": {
                "name": summoner1["name"],
                **stats1
            },
            "player2": {
                "name": summoner2["name"],
                **stats2
            },
            "synergyScore": round(synergy_score, 1),
            "synergyDescription": "Good duo potential!" if synergy_score >= 60 else "Compatible playstyles",
            "comparison": comparison,
            "model_used": "amazon.nova-lite-v1:0"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error comparing players: {str(e)}"
        )


@app.get("/api/model-stats")
async def get_model_stats():
    """
    Get Model Whisperer statistics - Cost optimization showcase
    
    Returns:
        Usage statistics and cost breakdown
    """
    try:
        report = model_selector.get_usage_report()
        tips = model_selector.get_optimization_tips()
        
        return {
            "report": report,
            "optimization_tips": tips,
            "message": "Model Whisperer Prize Entry - Intelligent cost optimization"
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "report": {"total_cost_usd": 0}
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("BACKEND_PORT", 8000)),
        reload=True
    )


