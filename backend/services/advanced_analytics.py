"""
Advanced Analytics Module
Processes enhanced Riot API data for deeper insights
"""
from typing import Dict, List, Any, Optional


class RankAnalyzer:
    """Analyze ranked progression and competitive standing"""
    
    RANK_VALUES = {
        "IRON": 0,
        "BRONZE": 400,
        "SILVER": 800,
        "GOLD": 1200,
        "PLATINUM": 1600,
        "EMERALD": 2000,
        "DIAMOND": 2400,
        "MASTER": 2800,
        "GRANDMASTER": 3200,
        "CHALLENGER": 3600
    }
    
    DIVISION_VALUES = {
        "IV": 0,
        "III": 100,
        "II": 200,
        "I": 300
    }
    
    RANK_PERCENTILES = {
        "IRON": 5,
        "BRONZE": 20,
        "SILVER": 45,
        "GOLD": 65,
        "PLATINUM": 80,
        "EMERALD": 90,
        "DIAMOND": 96,
        "MASTER": 98.5,
        "GRANDMASTER": 99.5,
        "CHALLENGER": 99.9
    }
    
    def analyze_rank(self, ranked_entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze ranked data for insights
        
        Returns:
            Dict with rank, LP, percentile, win rate, and insights
        """
        if not ranked_entries:
            return {
                "has_ranked": False,
                "message": "No ranked games this season"
            }
        
        # Find Solo/Duo queue
        solo_queue = next(
            (entry for entry in ranked_entries if entry.get("queueType") == "RANKED_SOLO_5x5"),
            None
        )
        
        if not solo_queue:
            return {
                "has_ranked": False,
                "message": "No solo queue ranked games"
            }
        
        tier = solo_queue.get("tier", "UNRANKED")
        rank = solo_queue.get("rank", "")
        lp = solo_queue.get("leaguePoints", 0)
        wins = solo_queue.get("wins", 0)
        losses = solo_queue.get("losses", 0)
        hot_streak = solo_queue.get("hotStreak", False)
        veteran = solo_queue.get("veteran", False)
        
        total_games = wins + losses
        win_rate = (wins / total_games * 100) if total_games > 0 else 0
        
        # Calculate MMR proxy
        mmr_proxy = self._calculate_mmr_proxy(tier, rank, lp)
        
        # Get percentile
        percentile = self.RANK_PERCENTILES.get(tier, 50)
        
        # Generate insights
        insights = []
        
        if hot_streak:
            insights.append("🔥 Currently on a hot streak!")
        
        if veteran:
            insights.append("⭐ Veteran player in this tier")
        
        if win_rate >= 55:
            insights.append(f"📈 Strong {win_rate:.1f}% win rate - climbing fast!")
        elif win_rate <= 45:
            insights.append(f"⚠️ {win_rate:.1f}% win rate - focus on consistency")
        
        if lp >= 75:
            insights.append(f"🎯 Close to promos! ({lp} LP)")
        
        return {
            "has_ranked": True,
            "tier": tier,
            "rank": rank,
            "lp": lp,
            "full_rank": f"{tier} {rank}",
            "wins": wins,
            "losses": losses,
            "win_rate": round(win_rate, 1),
            "mmr_proxy": mmr_proxy,
            "percentile": percentile,
            "percentile_text": f"Top {100 - percentile:.1f}%",
            "hot_streak": hot_streak,
            "veteran": veteran,
            "insights": insights,
            "rank_display": {
                "tier_color": self._get_tier_color(tier),
                "tier_icon": self._get_tier_icon(tier)
            }
        }
    
    def _calculate_mmr_proxy(self, tier: str, rank: str, lp: int) -> int:
        """Calculate approximate MMR value for comparisons"""
        base = self.RANK_VALUES.get(tier, 0)
        division = self.DIVISION_VALUES.get(rank, 0)
        return base + division + lp
    
    def _get_tier_color(self, tier: str) -> str:
        """Get color code for tier"""
        colors = {
            "IRON": "#4A4A4A",
            "BRONZE": "#CD7F32",
            "SILVER": "#C0C0C0",
            "GOLD": "#FFD700",
            "PLATINUM": "#00CED1",
            "EMERALD": "#50C878",
            "DIAMOND": "#B9F2FF",
            "MASTER": "#9D4EDD",
            "GRANDMASTER": "#FF6B6B",
            "CHALLENGER": "#FFE66D"
        }
        return colors.get(tier, "#FFFFFF")
    
    def _get_tier_icon(self, tier: str) -> str:
        """Get emoji/icon for tier"""
        icons = {
            "IRON": "⚙️",
            "BRONZE": "🥉",
            "SILVER": "🥈",
            "GOLD": "🥇",
            "PLATINUM": "💎",
            "EMERALD": "💚",
            "DIAMOND": "💠",
            "MASTER": "👑",
            "GRANDMASTER": "⚡",
            "CHALLENGER": "🏆"
        }
        return icons.get(tier, "🎮")


class TimelineAnalyzer:
    """Analyze match timelines for advanced metrics"""
    
    def analyze_timeline(
        self,
        timeline: Dict[str, Any],
        participant_id: int,
        win: bool
    ) -> Dict[str, Any]:
        """
        Analyze a single match timeline
        
        Returns:
            Dict with laning phase stats, comeback detection, etc.
        """
        if not timeline or 'info' not in timeline:
            return {"available": False}
        
        frames = timeline['info']['frames']
        
        # Calculate key metrics
        cs_10 = self._get_cs_at_minute(frames, participant_id, 10)
        cs_15 = self._get_cs_at_minute(frames, participant_id, 15)
        cs_20 = self._get_cs_at_minute(frames, participant_id, 20)
        
        gold_15 = self._get_gold_at_minute(frames, participant_id, 15)
        
        # Detect comeback
        comeback_data = self._detect_comeback(frames, participant_id, win)
        
        # First blood detection
        first_blood = self._check_first_blood(frames, participant_id)
        
        return {
            "available": True,
            "laning_phase": {
                "cs_at_10": cs_10,
                "cs_at_15": cs_15,
                "cs_at_20": cs_20,
                "cs_per_min_15": round(cs_15 / 15, 1) if cs_15 else 0,
                "gold_at_15": gold_15
            },
            "comeback": comeback_data,
            "first_blood": first_blood,
            "early_game_rating": self._rate_early_game(cs_10, gold_15)
        }
    
    def _get_cs_at_minute(
        self,
        frames: List[Dict],
        participant_id: int,
        minute: int
    ) -> int:
        """Get CS at a specific minute"""
        if minute >= len(frames):
            return 0
        
        frame = frames[minute]
        p_frame = frame.get('participantFrames', {}).get(str(participant_id), {})
        
        minions = p_frame.get('minionsKilled', 0)
        jungle = p_frame.get('jungleMinionsKilled', 0)
        
        return minions + jungle
    
    def _get_gold_at_minute(
        self,
        frames: List[Dict],
        participant_id: int,
        minute: int
    ) -> int:
        """Get total gold at a specific minute"""
        if minute >= len(frames):
            return 0
        
        frame = frames[minute]
        p_frame = frame.get('participantFrames', {}).get(str(participant_id), {})
        
        return p_frame.get('totalGold', 0)
    
    def _detect_comeback(
        self,
        frames: List[Dict],
        participant_id: int,
        win: bool
    ) -> Dict[str, Any]:
        """Detect if player came from behind to win"""
        if not win or len(frames) < 15:
            return {"is_comeback": False}
        
        gold_15 = self._get_gold_at_minute(frames, participant_id, 15)
        
        # Simplified: Check if gold was below average at 15 minutes
        # In a real implementation, we'd compare to enemy team
        is_behind = gold_15 < 5000  # Typical gold at 15 minutes is ~5-6k
        
        return {
            "is_comeback": is_behind,
            "gold_deficit_15min": 5000 - gold_15 if is_behind else 0,
            "message": "Came from behind to win!" if is_behind else "Led from start"
        }
    
    def _check_first_blood(
        self,
        frames: List[Dict],
        participant_id: int
    ) -> Dict[str, Any]:
        """Check if participated in first blood"""
        for frame in frames[:10]:  # First 10 minutes
            for event in frame.get('events', []):
                if event.get('type') == 'CHAMPION_KILL':
                    killer_id = event.get('killerId')
                    assistants = event.get('assistingParticipantIds', [])
                    
                    if killer_id == participant_id:
                        return {
                            "participated": True,
                            "role": "killer",
                            "timestamp": event.get('timestamp', 0) // 1000  # Convert to seconds
                        }
                    elif participant_id in assistants:
                        return {
                            "participated": True,
                            "role": "assist",
                            "timestamp": event.get('timestamp', 0) // 1000
                        }
        
        return {"participated": False}
    
    def _rate_early_game(self, cs_10: int, gold_15: int) -> str:
        """Rate early game performance"""
        # Average CS at 10 min is ~70-80
        # Average gold at 15 min is ~5000-6000
        
        cs_score = 0
        if cs_10 >= 90:
            cs_score = 2
        elif cs_10 >= 75:
            cs_score = 1
        
        gold_score = 0
        if gold_15 >= 6000:
            gold_score = 2
        elif gold_15 >= 5000:
            gold_score = 1
        
        total = cs_score + gold_score
        
        if total >= 3:
            return "Excellent"
        elif total >= 2:
            return "Good"
        elif total >= 1:
            return "Average"
        else:
            return "Needs improvement"


class ChallengeAnalyzer:
    """Analyze challenge achievements and rare accomplishments"""
    
    def analyze_challenges(
        self,
        challenges: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze challenge data for insights
        
        Returns:
            Dict with rare achievements, category strengths, etc.
        """
        if not challenges:
            return {
                "available": False,
                "message": "Challenge data not available"
            }
        
        # Find rare achievements (top 10%)
        rare_achievements = self._find_rare_achievements(challenges)
        
        # Analyze category strengths
        category_analysis = self._analyze_categories(challenges)
        
        # Get overall challenge level
        total_points = challenges.get('totalPoints', {})
        
        return {
            "available": True,
            "total_level": total_points.get('level', 'NONE'),
            "total_current": total_points.get('current', 0),
            "total_max": total_points.get('max', 0),
            "rare_achievements": rare_achievements,
            "category_strengths": category_analysis,
            "summary": self._generate_challenge_summary(rare_achievements, category_analysis)
        }
    
    def _find_rare_achievements(
        self,
        challenges: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Find achievements in top percentiles"""
        rare = []
        
        for challenge in challenges.get('challenges', []):
            percentile = challenge.get('percentile', 0)
            
            if percentile >= 90:  # Top 10%
                rarity = "Legendary" if percentile >= 99 else "Epic" if percentile >= 95 else "Rare"
                
                rare.append({
                    "challenge_id": challenge.get('challengeId'),
                    "percentile": round(percentile, 1),
                    "level": challenge.get('level', 'NONE'),
                    "value": challenge.get('value', 0),
                    "rarity": rarity,
                    "icon": "🏆" if percentile >= 99 else "⭐" if percentile >= 95 else "💎"
                })
        
        # Sort by percentile
        rare.sort(key=lambda x: x['percentile'], reverse=True)
        
        return rare[:5]  # Return top 5
    
    def _analyze_categories(
        self,
        challenges: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze performance by category"""
        categories = challenges.get('categoryPoints', {})
        
        if not categories:
            return {}
        
        # Find strongest category
        # Handle both dict and numeric values in categoryPoints
        try:
            # If x[1] is a dict, get its 'current' or 'level' value
            max_category = max(
                categories.items(), 
                key=lambda x: x[1].get('current', 0) if isinstance(x[1], dict) else x[1]
            )
        except (TypeError, ValueError):
            # Fallback if comparison fails
            return {}
        
        # Category descriptions
        category_info = {
            "TEAMWORK": {
                "icon": "🤝",
                "description": "Team player - excels at coordination"
            },
            "EXPERTISE": {
                "icon": "🎯",
                "description": "Mechanical master - high skill expression"
            },
            "IMAGINATION": {
                "icon": "🎨",
                "description": "Creative player - unique strategies"
            },
            "VETERANCY": {
                "icon": "⚔️",
                "description": "Experienced veteran - battle-hardened"
            },
            "COLLECTION": {
                "icon": "📚",
                "description": "Collector - loves variety"
            }
        }
        
        # Extract points value (might be dict or number)
        points_value = max_category[1]
        if isinstance(points_value, dict):
            points_value = points_value.get('current', points_value.get('level', 0))
        
        return {
            "strongest_category": max_category[0],
            "strongest_points": points_value,
            "all_categories": categories,
            "strength_info": category_info.get(max_category[0], {})
        }
    
    def _generate_challenge_summary(
        self,
        rare_achievements: List[Dict],
        category_analysis: Dict
    ) -> str:
        """Generate a summary of challenge performance"""
        if not rare_achievements:
            return "Keep playing to unlock rare achievements!"
        
        strongest = category_analysis.get('strongest_category', 'N/A')
        count = len(rare_achievements)
        top_percentile = rare_achievements[0].get('percentile', 0) if rare_achievements else 0
        
        return f"Earned {count} rare achievements (top {100 - top_percentile:.1f}%). Strongest at {strongest}."


# Global instances
rank_analyzer = RankAnalyzer()
timeline_analyzer = TimelineAnalyzer()
challenge_analyzer = ChallengeAnalyzer()

