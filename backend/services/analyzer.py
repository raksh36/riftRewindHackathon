"""
Match Data Analyzer
Processes and analyzes League of Legends match data
"""
from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime
import statistics


class MatchAnalyzer:
    """Analyzes match history data to extract insights"""
    
    # Champion ID to Name mapping (partial - extend as needed)
    CHAMPION_NAMES = {
        1: "Annie", 2: "Olaf", 3: "Galio", 4: "Twisted Fate", 5: "Xin Zhao",
        6: "Urgot", 7: "LeBlanc", 8: "Vladimir", 9: "Fiddlesticks", 10: "Kayle",
        11: "Master Yi", 12: "Alistar", 13: "Ryze", 14: "Sion", 15: "Sivir",
        16: "Soraka", 17: "Teemo", 18: "Tristana", 19: "Warwick", 20: "Nunu",
        21: "Miss Fortune", 22: "Ashe", 23: "Tryndamere", 24: "Jax", 25: "Morgana",
        26: "Zilean", 27: "Singed", 28: "Evelynn", 29: "Twitch", 30: "Karthus",
        31: "Cho'Gath", 32: "Amumu", 33: "Rammus", 34: "Anivia", 35: "Shaco",
        36: "Dr. Mundo", 37: "Sona", 38: "Kassadin", 39: "Irelia", 40: "Janna",
        41: "Gangplank", 42: "Corki", 43: "Karma", 44: "Taric", 45: "Veigar",
        51: "Caitlyn", 53: "Blitzcrank", 54: "Malphite", 55: "Katarina", 56: "Nocturne",
        57: "Maokai", 58: "Renekton", 59: "Jarvan IV", 60: "Elise", 61: "Orianna",
        62: "Wukong", 63: "Brand", 64: "Lee Sin", 67: "Vayne", 68: "Rumble",
        69: "Cassiopeia", 72: "Skarner", 74: "Heimerdinger", 75: "Nasus", 76: "Nidalee",
        77: "Udyr", 78: "Poppy", 79: "Gragas", 80: "Pantheon", 81: "Ezreal",
        82: "Mordekaiser", 83: "Yorick", 84: "Akali", 85: "Kennen", 86: "Garen",
        89: "Leona", 90: "Malzahar", 91: "Talon", 92: "Riven", 96: "Kog'Maw",
        98: "Shen", 99: "Lux", 101: "Xerath", 102: "Shyvana", 103: "Ahri",
        104: "Graves", 105: "Fizz", 106: "Volibear", 107: "Rengar", 110: "Varus",
        111: "Nautilus", 112: "Viktor", 113: "Sejuani", 114: "Fiora", 115: "Ziggs",
        117: "Lulu", 119: "Draven", 120: "Hecarim", 121: "Kha'Zix", 122: "Darius",
        126: "Jayce", 127: "Lissandra", 131: "Diana", 133: "Quinn", 134: "Syndra",
        136: "Aurelion Sol", 141: "Kayn", 142: "Zoe", 143: "Zyra", 145: "Kai'Sa",
        147: "Seraphine", 150: "Gnar", 154: "Zac", 157: "Yasuo", 161: "Vel'Koz",
        163: "Taliyah", 164: "Camille", 166: "Akshan", 200: "Bel'Veth", 201: "Braum",
        202: "Jhin", 203: "Kindred", 221: "Zeri", 222: "Jinx", 223: "Tahm Kench",
        234: "Viego", 235: "Senna", 236: "Lucian", 238: "Zed", 240: "Kled",
        245: "Ekko", 246: "Qiyana", 254: "Vi", 266: "Aatrox", 267: "Nami",
        268: "Azir", 350: "Yuumi", 360: "Samira", 412: "Thresh", 420: "Illaoi",
        421: "Rek'Sai", 427: "Ivern", 429: "Kalista", 432: "Bard", 497: "Rakan",
        498: "Xayah", 516: "Ornn", 517: "Sylas", 518: "Neeko", 523: "Aphelios",
        526: "Rell", 555: "Pyke", 777: "Yone", 875: "Sett", 876: "Lillia",
        887: "Gwen", 888: "Renata Glasc", 895: "Nilah", 897: "K'Sante", 901: "Smolder", 902: "Milio",
        910: "Hwei", 950: "Naafiri"
    }
    
    ROLE_MAP = {
        "TOP": "Top",
        "JUNGLE": "Jungle",
        "MIDDLE": "Mid",
        "BOTTOM": "ADC",
        "UTILITY": "Support"
    }
    
    def __init__(self):
        pass
    
    def get_champion_name(self, champion_id: int) -> str:
        """Get champion name from ID"""
        return self.CHAMPION_NAMES.get(champion_id, f"Champion{champion_id}")
    
    def analyze_matches(
        self,
        matches: List[Dict[str, Any]],
        puuid: str
    ) -> Dict[str, Any]:
        """
        Analyze match history and extract statistics
        
        Args:
            matches: List of match data
            puuid: Player's PUUID
            
        Returns:
            Comprehensive statistics
        """
        
        if not matches:
            return self._empty_stats()
        
        # Initialize aggregation structures
        champion_stats = defaultdict(lambda: {
            'games': 0, 'wins': 0, 'kills': 0, 'deaths': 0, 'assists': 0
        })
        role_distribution = defaultdict(int)
        monthly_performance = defaultdict(lambda: {'games': 0, 'wins': 0})
        
        total_games = len(matches)
        total_wins = 0
        total_kills = 0
        total_deaths = 0
        total_assists = 0
        total_cs = 0
        total_gold = 0
        total_game_duration = 0
        total_vision_score = 0
        total_damage_dealt = 0
        total_damage_taken = 0
        total_healing = 0
        total_damage_mitigated = 0
        total_dragons = 0
        total_barons = 0
        total_turrets = 0
        total_inhibitors = 0
        
        # Team contribution tracking
        total_damage_share = 0
        total_gold_share = 0
        total_kill_participation = 0
        
        # Game phase tracking
        early_game_wins = 0  # wins where player had gold lead at 15min
        early_game_count = 0
        game_phase_kda = {'early': [], 'mid': [], 'late': []}
        
        best_game = None
        best_kda = 0
        
        pentakills = 0
        quadrakills = 0
        
        # Process each match
        for match in matches:
            info = match.get('info', {})
            participants = info.get('participants', [])
            
            # Find player's data
            player_data = None
            for participant in participants:
                if participant.get('puuid') == puuid:
                    player_data = participant
                    break
            
            if not player_data:
                continue
            
            # Extract basic stats
            champion_id = player_data.get('championId', 0)
            champion_name = self.get_champion_name(champion_id)
            role = self.ROLE_MAP.get(player_data.get('teamPosition', 'UNKNOWN'), 'Fill')
            
            won = player_data.get('win', False)
            kills = player_data.get('kills', 0)
            deaths = player_data.get('deaths', 0)
            assists = player_data.get('assists', 0)
            
            # Calculate KDA
            kda = (kills + assists) / max(deaths, 1)
            
            # Track best game
            if kda > best_kda:
                best_kda = kda
                best_game = {
                    'champion': champion_name,
                    'kda': kda,
                    'kills': kills,
                    'deaths': deaths,
                    'assists': assists,
                    'win': won
                }
            
            # Aggregate stats
            champion_stats[champion_id]['games'] += 1
            champion_stats[champion_id]['wins'] += 1 if won else 0
            champion_stats[champion_id]['kills'] += kills
            champion_stats[champion_id]['deaths'] += deaths
            champion_stats[champion_id]['assists'] += assists
            champion_stats[champion_id]['name'] = champion_name
            
            role_distribution[role] += 1
            
            # Monthly tracking
            game_date = datetime.fromtimestamp(info.get('gameCreation', 0) / 1000)
            month_key = game_date.strftime('%Y-%m')
            monthly_performance[month_key]['games'] += 1
            monthly_performance[month_key]['wins'] += 1 if won else 0
            
            # Totals
            total_wins += 1 if won else 0
            total_kills += kills
            total_deaths += deaths
            total_assists += assists
            total_cs += player_data.get('totalMinionsKilled', 0) + player_data.get('neutralMinionsKilled', 0)
            total_gold += player_data.get('goldEarned', 0)
            total_game_duration += info.get('gameDuration', 0)
            total_vision_score += player_data.get('visionScore', 0)
            total_damage_dealt += player_data.get('totalDamageDealtToChampions', 0)
            total_damage_taken += player_data.get('totalDamageTaken', 0)
            total_healing += player_data.get('totalHealsOnTeammates', 0) + player_data.get('totalHeal', 0)
            total_damage_mitigated += player_data.get('damageSelfMitigated', 0)
            total_dragons += player_data.get('dragonKills', 0)
            total_barons += player_data.get('baronKills', 0)
            total_turrets += player_data.get('turretKills', 0)
            total_inhibitors += player_data.get('inhibitorKills', 0)
            
            # Special achievements
            pentakills += player_data.get('pentaKills', 0)
            quadrakills += player_data.get('quadraKills', 0)
            
            # Team contribution calculations
            team_id = player_data.get('teamId')
            team_damage = 0
            team_gold = 0
            team_kills = 0
            
            # Calculate team totals
            for participant in participants:
                if participant.get('teamId') == team_id:
                    team_damage += participant.get('totalDamageDealtToChampions', 0)
                    team_gold += participant.get('goldEarned', 0)
                    team_kills += participant.get('kills', 0)
            
            # Calculate player's share (avoid division by zero)
            if team_damage > 0:
                damage_share = (player_data.get('totalDamageDealtToChampions', 0) / team_damage) * 100
                total_damage_share += damage_share
            
            if team_gold > 0:
                gold_share = (player_data.get('goldEarned', 0) / team_gold) * 100
                total_gold_share += gold_share
            
            if team_kills > 0:
                kill_participation = ((kills + assists) / team_kills) * 100
                total_kill_participation += min(kill_participation, 100)  # Cap at 100%
            
            # Game phase performance (based on game duration)
            game_duration = info.get('gameDuration', 0)
            if game_duration > 0:
                if game_duration <= 900:  # 0-15 minutes
                    game_phase_kda['early'].append(kda)
                elif game_duration <= 1500:  # 15-25 minutes
                    game_phase_kda['mid'].append(kda)
                else:  # 25+ minutes
                    game_phase_kda['late'].append(kda)
                
                # Track early game snowball (gold at 15min - using goldEarned as proxy)
                if won and player_data.get('goldEarned', 0) > 4500:  # Rough early gold lead indicator
                    early_game_wins += 1
                if player_data.get('goldEarned', 0) > 4500:
                    early_game_count += 1
        
        # Calculate aggregated stats
        win_rate = (total_wins / total_games * 100) if total_games > 0 else 0
        avg_kda = (total_kills + total_assists) / max(total_deaths, 1)
        
        # Top champions
        top_champions = []
        for champ_id, stats in sorted(
            champion_stats.items(),
            key=lambda x: x[1]['games'],
            reverse=True
        )[:5]:
            champ_games = stats['games']
            champ_win_rate = (stats['wins'] / champ_games * 100) if champ_games > 0 else 0
            champ_kda = (stats['kills'] + stats['assists']) / max(stats['deaths'], 1)
            
            top_champions.append({
                'championId': champ_id,
                'championName': stats['name'],
                'gamesPlayed': champ_games,
                'wins': stats['wins'],
                'losses': champ_games - stats['wins'],
                'winRate': round(champ_win_rate, 1),
                'avgKDA': round(champ_kda, 2),
                'avgKills': round(stats['kills'] / champ_games, 1),
                'avgDeaths': round(stats['deaths'] / champ_games, 1),
                'avgAssists': round(stats['assists'] / champ_games, 1)
            })
        
        # Most played role
        most_played_role = max(role_distribution.items(), key=lambda x: x[1])[0] if role_distribution else "Unknown"
        
        # Performance trend (recent vs overall)
        recent_matches = matches[:10] if len(matches) >= 10 else matches
        recent_wins = sum(1 for m in recent_matches 
                         if self._player_won(m, puuid))
        recent_wr = (recent_wins / len(recent_matches) * 100) if recent_matches else 0
        
        trend = "Improving" if recent_wr > win_rate else "Declining" if recent_wr < win_rate else "Stable"
        
        # Calculate game phase performance metrics
        early_game_perf = round(statistics.mean(game_phase_kda['early']), 2) if game_phase_kda['early'] else 0
        mid_game_perf = round(statistics.mean(game_phase_kda['mid']), 2) if game_phase_kda['mid'] else 0
        late_game_perf = round(statistics.mean(game_phase_kda['late']), 2) if game_phase_kda['late'] else 0
        snowball_rate = round((early_game_wins / early_game_count * 100), 1) if early_game_count > 0 else 0
        
        return {
            'totalGames': total_games,
            'totalWins': total_wins,
            'totalLosses': total_games - total_wins,
            'winRate': round(win_rate, 1),
            'avgKDA': round(avg_kda, 2),
            'avgKills': round(total_kills / total_games, 1),
            'avgDeaths': round(total_deaths / total_games, 1),
            'avgAssists': round(total_assists / total_games, 1),
            'avgCS': round(total_cs / total_games, 1) if total_games > 0 else 0,
            'avgGold': round(total_gold / total_games, 0) if total_games > 0 else 0,
            'avgGameDuration': round(total_game_duration / total_games, 0) if total_games > 0 else 0,
            'avgVisionScore': round(total_vision_score / total_games, 1) if total_games > 0 else 0,
            'avgDamageDealt': round(total_damage_dealt / total_games, 0) if total_games > 0 else 0,
            'avgDamageTaken': round(total_damage_taken / total_games, 0) if total_games > 0 else 0,
            'avgHealing': round(total_healing / total_games, 0) if total_games > 0 else 0,
            'avgDamageMitigated': round(total_damage_mitigated / total_games, 0) if total_games > 0 else 0,
            'avgDragonKills': round(total_dragons / total_games, 2) if total_games > 0 else 0,
            'avgBaronKills': round(total_barons / total_games, 2) if total_games > 0 else 0,
            'avgTurretKills': round(total_turrets / total_games, 2) if total_games > 0 else 0,
            'avgInhibitorKills': round(total_inhibitors / total_games, 2) if total_games > 0 else 0,
            # Team Contribution
            'avgDamageShare': round(total_damage_share / total_games, 1) if total_games > 0 else 0,
            'avgGoldShare': round(total_gold_share / total_games, 1) if total_games > 0 else 0,
            'avgKillParticipation': round(total_kill_participation / total_games, 1) if total_games > 0 else 0,
            # Game Phase Performance
            'earlyGamePerformance': early_game_perf,
            'midGamePerformance': mid_game_perf,
            'lateGamePerformance': late_game_perf,
            'snowballRate': snowball_rate,
            'topChampions': top_champions,
            'roleDistribution': dict(role_distribution),
            'mostPlayedRole': most_played_role,
            'bestPerformance': best_game,
            'bestGameKDA': best_kda,
            'pentakills': pentakills,
            'quadrakills': quadrakills,
            'recentTrend': trend,
            'recentWinRate': round(recent_wr, 1),
            'monthlyPerformance': dict(monthly_performance)
        }
    
    def _player_won(self, match: Dict[str, Any], puuid: str) -> bool:
        """Check if player won the match"""
        participants = match.get('info', {}).get('participants', [])
        for participant in participants:
            if participant.get('puuid') == puuid:
                return participant.get('win', False)
        return False
    
    def _empty_stats(self) -> Dict[str, Any]:
        """Return empty stats structure"""
        return {
            'totalGames': 0,
            'totalWins': 0,
            'totalLosses': 0,
            'winRate': 0,
            'avgKDA': 0,
            'avgKills': 0,
            'avgDeaths': 0,
            'avgAssists': 0,
            'avgCS': 0,
            'avgGold': 0,
            'avgGameDuration': 0,
            'avgVisionScore': 0,
            'avgDamageDealt': 0,
            'avgDamageTaken': 0,
            'avgHealing': 0,
            'avgDamageMitigated': 0,
            'avgDragonKills': 0,
            'avgBaronKills': 0,
            'avgTurretKills': 0,
            'avgInhibitorKills': 0,
            'avgDamageShare': 0,
            'avgGoldShare': 0,
            'avgKillParticipation': 0,
            'earlyGamePerformance': 0,
            'midGamePerformance': 0,
            'lateGamePerformance': 0,
            'snowballRate': 0,
            'topChampions': [],
            'roleDistribution': {},
            'mostPlayedRole': 'Unknown',
            'bestPerformance': None,
            'bestGameKDA': 0,
            'pentakills': 0,
            'quadrakills': 0,
            'recentTrend': 'Unknown',
            'recentWinRate': 0,
            'monthlyPerformance': {}
        }


