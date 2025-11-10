"""
Advanced Pattern Detection for Hidden Gems
Analyzes match data to find unusual correlations and surprising insights
"""
from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime
import statistics

class PatternDetector:
    """Detects hidden patterns and unusual correlations in match data"""
    
    def __init__(self):
        pass
    
    def detect_patterns(
        self,
        matches: List[Dict[str, Any]],
        player_stats: Dict[str, Any],
        puuid: str
    ) -> List[Dict[str, Any]]:
        """
        Detect hidden patterns in gameplay
        
        Args:
            matches: List of match data
            player_stats: Aggregated player statistics
            puuid: Player UUID
            
        Returns:
            List of discovered patterns/gems
        """
        gems = []
        
        # Time-based patterns
        time_patterns = self._analyze_time_patterns(matches, puuid)
        gems.extend(time_patterns)
        
        # Streak patterns
        streak_patterns = self._analyze_streaks(matches, puuid)
        gems.extend(streak_patterns)
        
        # Role performance variations
        role_patterns = self._analyze_role_performance(matches, puuid)
        gems.extend(role_patterns)
        
        # Champion synergies
        synergy_patterns = self._analyze_champion_synergies(matches, puuid)
        gems.extend(synergy_patterns)
        
        # Comeback potential
        comeback_patterns = self._analyze_comeback_potential(matches, puuid)
        gems.extend(comeback_patterns)
        
        return gems[:6]  # Return top 6 most interesting patterns
    
    def _analyze_time_patterns(
        self,
        matches: List[Dict[str, Any]],
        puuid: str
    ) -> List[Dict[str, Any]]:
        """Analyze performance by time of day and day of week"""
        patterns = []
        
        time_performance = defaultdict(lambda: {"wins": 0, "games": 0})
        day_performance = defaultdict(lambda: {"wins": 0, "games": 0})
        
        for match in matches:
            info = match.get('info', {})
            timestamp = info.get('gameCreation', 0) / 1000
            game_date = datetime.fromtimestamp(timestamp)
            
            hour = game_date.hour
            day_of_week = game_date.strftime('%A')
            
            # Find player result
            won = self._player_won(match, puuid)
            
            # Time of day (morning, afternoon, evening, night)
            if 6 <= hour < 12:
                time_slot = "morning"
            elif 12 <= hour < 18:
                time_slot = "afternoon"
            elif 18 <= hour < 24:
                time_slot = "evening"
            else:
                time_slot = "night"
            
            time_performance[time_slot]["games"] += 1
            if won:
                time_performance[time_slot]["wins"] += 1
            
            day_performance[day_of_week]["games"] += 1
            if won:
                day_performance[day_of_week]["wins"] += 1
        
        # Find best time slot
        best_time = max(
            time_performance.items(),
            key=lambda x: x[1]["wins"] / max(x[1]["games"], 1),
            default=None
        )
        
        if best_time and best_time[1]["games"] >= 5:
            wr = (best_time[1]["wins"] / best_time[1]["games"]) * 100
            if wr >= 55:
                patterns.append({
                    "title": f"{best_time[0].capitalize()} Performer",
                    "description": f"You perform best during the {best_time[0]} with a {wr:.1f}% win rate across {best_time[1]['games']} games!",
                    "rarity": 4,
                    "category": "time"
                })
        
        # Find best day
        best_day = max(
            day_performance.items(),
            key=lambda x: x[1]["wins"] / max(x[1]["games"], 1),
            default=None
        )
        
        if best_day and best_day[1]["games"] >= 5:
            wr = (best_day[1]["wins"] / best_day[1]["games"]) * 100
            if wr >= 55:
                patterns.append({
                    "title": f"{best_day[0]} Specialist",
                    "description": f"Your {best_day[0]} win rate is {wr:.1f}%, significantly above your overall average!",
                    "rarity": 3,
                    "category": "time"
                })
        
        return patterns
    
    def _analyze_streaks(
        self,
        matches: List[Dict[str, Any]],
        puuid: str
    ) -> List[Dict[str, Any]]:
        """Analyze win/loss streaks"""
        patterns = []
        
        current_streak = 0
        max_win_streak = 0
        max_loss_streak = 0
        last_result = None
        
        for match in matches:
            won = self._player_won(match, puuid)
            
            if won == last_result:
                current_streak += 1
            else:
                if last_result and won:
                    max_loss_streak = max(max_loss_streak, abs(current_streak))
                elif last_result:
                    max_win_streak = max(max_win_streak, current_streak)
                current_streak = 1
            
            last_result = won
        
        if max_win_streak >= 5:
            patterns.append({
                "title": "Win Streak Master",
                "description": f"You achieved an impressive {max_win_streak}-game win streak! That's mental fortitude!",
                "rarity": 5,
                "category": "performance"
            })
        
        if max_loss_streak >= 5:
            patterns.append({
                "title": "Resilience Badge",
                "description": f"You pushed through a {max_loss_streak}-game loss streak and kept playing. That's determination!",
                "rarity": 3,
                "category": "mental"
            })
        
        return patterns
    
    def _analyze_role_performance(
        self,
        matches: List[Dict[str, Any]],
        puuid: str
    ) -> List[Dict[str, Any]]:
        """Analyze performance differences across roles"""
        patterns = []
        
        role_stats = defaultdict(lambda: {
            "wins": 0, "games": 0, "kills": 0, "deaths": 0, "assists": 0
        })
        
        for match in matches:
            info = match.get('info', {})
            participants = info.get('participants', [])
            
            for participant in participants:
                if participant.get('puuid') == puuid:
                    role = participant.get('teamPosition', 'UNKNOWN')
                    won = participant.get('win', False)
                    
                    role_stats[role]["games"] += 1
                    if won:
                        role_stats[role]["wins"] += 1
                    role_stats[role]["kills"] += participant.get('kills', 0)
                    role_stats[role]["deaths"] += participant.get('deaths', 0)
                    role_stats[role]["assists"] += participant.get('assists', 0)
                    break
        
        # Find role with unusual performance
        for role, stats in role_stats.items():
            if stats["games"] >= 5:
                wr = (stats["wins"] / stats["games"]) * 100
                kda = (stats["kills"] + stats["assists"]) / max(stats["deaths"], 1)
                
                if wr >= 60:
                    patterns.append({
                        "title": f"{role} Dominator",
                        "description": f"You have a {wr:.1f}% win rate as {role} with {kda:.2f} KDA. This is your power role!",
                        "rarity": 4,
                        "category": "role"
                    })
        
        return patterns
    
    def _analyze_champion_synergies(
        self,
        matches: List[Dict[str, Any]],
        puuid: str
    ) -> List[Dict[str, Any]]:
        """Analyze champion synergies with teammates"""
        patterns = []
        
        # This would require more complex analysis of teammate champions
        # For now, return a placeholder
        
        return patterns
    
    def _analyze_comeback_potential(
        self,
        matches: List[Dict[str, Any]],
        puuid: str
    ) -> List[Dict[str, Any]]:
        """Analyze comeback victories and mental resilience"""
        patterns = []
        
        # This would need timeline data for gold difference at 15 min
        # For now, use game duration as a proxy
        long_game_wins = 0
        long_games = 0
        
        for match in matches:
            info = match.get('info', {})
            duration = info.get('gameDuration', 0) / 60  # Convert to minutes
            
            if duration >= 35:  # Long games often indicate comebacks
                long_games += 1
                if self._player_won(match, puuid):
                    long_game_wins += 1
        
        if long_games >= 10:
            wr = (long_game_wins / long_games) * 100
            if wr >= 55:
                patterns.append({
                    "title": "Comeback King",
                    "description": f"You have a {wr:.1f}% win rate in long games (35+ min). You never give up!",
                    "rarity": 4,
                    "category": "mental"
                })
        
        return patterns
    
    def _player_won(self, match: Dict[str, Any], puuid: str) -> bool:
        """Check if player won the match"""
        participants = match.get('info', {}).get('participants', [])
        for participant in participants:
            if participant.get('puuid') == puuid:
                return participant.get('win', False)
        return False

