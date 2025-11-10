"""
Additional Analytics Module
Processes new Riot API endpoints for deeper insights
"""
from typing import Dict, List, Any, Optional


class ClashAnalyzer:
    """Analyze Clash tournament participation"""
    
    def analyze_clash_history(
        self,
        clash_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze Clash tournament participation
        
        Returns:
            Dict with tournament stats and insights
        """
        if not clash_data:
            return {
                "has_participated": False,
                "message": "No Clash tournament participation"
            }
        
        total_tournaments = len(clash_data)
        
        # Count unique teams
        unique_teams = set()
        for entry in clash_data:
            team_id = entry.get('teamId')
            if team_id:
                unique_teams.add(team_id)
        
        return {
            "has_participated": True,
            "total_tournaments": total_tournaments,
            "unique_teams": len(unique_teams),
            "is_active": total_tournaments > 0,
            "competitive_level": "High" if total_tournaments >= 5 else "Medium" if total_tournaments >= 2 else "Casual",
            "insights": [
                f"🏆 Participated in {total_tournaments} Clash tournament{'s' if total_tournaments != 1 else ''}",
                f"👥 Played with {len(unique_teams)} different team{'s' if len(unique_teams) != 1 else ''}"
            ]
        }


class MasteryAnalyzer:
    """Analyze champion mastery with advanced metrics"""
    
    def analyze_total_mastery(
        self,
        total_score: int,
        top_masteries: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze overall mastery score and champion pool
        
        Returns:
            Dict with mastery insights
        """
        if total_score == 0:
            return {
                "total_score": 0,
                "message": "No mastery data available"
            }
        
        # Mastery tiers
        if total_score >= 1000000:
            tier = "Legendary"
            tier_emoji = "🌟"
        elif total_score >= 500000:
            tier = "Master"
            tier_emoji = "👑"
        elif total_score >= 250000:
            tier = "Expert"
            tier_emoji = "⭐"
        elif total_score >= 100000:
            tier = "Experienced"
            tier_emoji = "✨"
        else:
            tier = "Developing"
            tier_emoji = "🎮"
        
        # Analyze champion pool diversity
        mastery_7_count = sum(1 for m in top_masteries if m.get('championLevel', 0) == 7)
        mastery_6_count = sum(1 for m in top_masteries if m.get('championLevel', 0) == 6)
        mastery_5_count = sum(1 for m in top_masteries if m.get('championLevel', 0) == 5)
        
        # Calculate diversity score (0-100)
        diversity_score = min(100, len(top_masteries) * 10)
        
        insights = []
        insights.append(f"{tier_emoji} {tier} mastery tier ({total_score:,} points)")
        
        if mastery_7_count > 0:
            insights.append(f"🏆 {mastery_7_count} Mastery 7 champion{'s' if mastery_7_count != 1 else ''}")
        
        if diversity_score >= 80:
            insights.append("🎯 Diverse champion pool - adaptable player")
        elif diversity_score <= 40:
            insights.append("🔥 One-trick specialist - deep mastery")
        
        return {
            "total_score": total_score,
            "tier": tier,
            "tier_emoji": tier_emoji,
            "mastery_7_champions": mastery_7_count,
            "mastery_6_champions": mastery_6_count,
            "mastery_5_champions": mastery_5_count,
            "diversity_score": diversity_score,
            "diversity_rating": "High" if diversity_score >= 70 else "Medium" if diversity_score >= 40 else "Low",
            "insights": insights
        }


class FreeChampionAnalyzer:
    """Analyze free champion rotation usage"""
    
    def analyze_free_rotation_usage(
        self,
        rotation_data: Optional[Dict[str, Any]],
        recent_champions_played: List[int]
    ) -> Dict[str, Any]:
        """
        Analyze if player uses free champions
        
        Returns:
            Dict with free rotation insights
        """
        if not rotation_data:
            return {"available": False}
        
        free_champion_ids = rotation_data.get('freeChampionIds', [])
        free_for_new_ids = rotation_data.get('freeChampionIdsForNewPlayers', [])
        
        all_free = set(free_champion_ids + free_for_new_ids)
        recent_played = set(recent_champions_played)
        
        # Check overlap
        played_free_champions = all_free.intersection(recent_played)
        
        if not recent_played:
            return {
                "available": True,
                "uses_free_champions": False,
                "message": "Not enough recent games to analyze"
            }
        
        free_usage_rate = len(played_free_champions) / len(recent_played) * 100 if recent_played else 0
        
        insights = []
        
        if free_usage_rate >= 50:
            insights.append("🆓 Frequently plays free rotation champions")
            insights.append("💡 Consider expanding your champion pool with owned champions")
        elif free_usage_rate >= 25:
            insights.append("⚖️ Balanced mix of owned and free champions")
        else:
            insights.append("💎 Owns most played champions - committed player")
        
        return {
            "available": True,
            "current_free_count": len(free_champion_ids),
            "played_free_champions": len(played_free_champions),
            "free_usage_rate": round(free_usage_rate, 1),
            "uses_free_champions": free_usage_rate > 0,
            "insights": insights
        }


class ChallengeConfigAnalyzer:
    """Analyze challenges with proper names from config"""
    
    def enrich_challenges(
        self,
        player_challenges: Optional[Dict[str, Any]],
        challenge_config: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Enrich challenge data with names and descriptions
        
        Returns:
            Dict with enriched challenge information
        """
        if not player_challenges or not challenge_config:
            return {
                "available": False,
                "message": "Challenge data not available"
            }
        
        # Create lookup map for challenge info
        config_map = {}
        for config in challenge_config:
            challenge_id = config.get('id')
            if challenge_id:
                config_map[challenge_id] = {
                    "name": config.get('localizedNames', {}).get('en_US', {}).get('name', f'Challenge {challenge_id}'),
                    "description": config.get('localizedNames', {}).get('en_US', {}).get('description', ''),
                    "tags": config.get('tags', []),
                    "thresholds": config.get('thresholds', {})
                }
        
        # Enrich player challenges
        enriched_challenges = []
        for challenge in player_challenges.get('challenges', [])[:10]:  # Top 10
            challenge_id = challenge.get('challengeId')
            percentile = challenge.get('percentile', 0)
            
            if percentile >= 90:  # Top 10%
                info = config_map.get(challenge_id, {})
                enriched_challenges.append({
                    "challenge_id": challenge_id,
                    "name": info.get('name', f'Challenge {challenge_id}'),
                    "description": info.get('description', 'No description'),
                    "percentile": round(percentile, 1),
                    "level": challenge.get('level', 'NONE'),
                    "value": challenge.get('value', 0),
                    "tags": info.get('tags', []),
                    "rarity": "Legendary" if percentile >= 99 else "Epic" if percentile >= 95 else "Rare"
                })
        
        return {
            "available": True,
            "enriched_challenges": enriched_challenges,
            "has_named_challenges": len(enriched_challenges) > 0
        }


# Global instances
clash_analyzer = ClashAnalyzer()
mastery_analyzer = MasteryAnalyzer()
free_champion_analyzer = FreeChampionAnalyzer()
challenge_config_analyzer = ChallengeConfigAnalyzer()

