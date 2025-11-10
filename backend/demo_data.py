"""
Demo/Mock Data for Testing
Returns realistic sample data without calling Riot API
"""

def get_demo_player_data():
    """Returns comprehensive demo data showing all features"""
    return {
        "summoner": {
            "name": "DemoPlayer",
            "level": 247,
            "profileIconId": 5009,
            "puuid": "demo-puuid-12345",
            "is_playing_now": False
        },
        "stats": {
            "totalGames": 150,
            "wins": 82,
            "losses": 68,
            "winRate": 54.7,
            "avgKills": 8.4,
            "avgDeaths": 5.2,
            "avgAssists": 11.3,
            "avgKDA": 3.8,
            "avgDamage": 18500,
            "avgGold": 12300,
            "avgCS": 156,
            "avgVisionScore": 28,
            "mostPlayedRole": "MIDDLE",
            "recentTrend": "Improving",
            "recentWinRate": 58.3,
            "achievements": {
                "pentakills": 2,
                "quadrakills": 8,
                "triplekills": 45,
                "perfectGames": 12
            },
            "championStats": [
                {
                    "championId": 157,
                    "championName": "Yasuo",
                    "games": 28,
                    "wins": 17,
                    "losses": 11,
                    "winRate": 60.7,
                    "avgKDA": 4.2,
                    "avgKills": 9.5,
                    "avgDeaths": 4.8,
                    "avgAssists": 10.6
                },
                {
                    "championId": 238,
                    "championName": "Zed",
                    "games": 22,
                    "wins": 13,
                    "losses": 9,
                    "winRate": 59.1,
                    "avgKDA": 3.9,
                    "avgKills": 10.2,
                    "avgDeaths": 5.1,
                    "avgAssists": 9.8
                },
                {
                    "championId": 91,
                    "championName": "Talon",
                    "games": 18,
                    "wins": 11,
                    "losses": 7,
                    "winRate": 61.1,
                    "avgKDA": 4.1,
                    "avgKills": 11.0,
                    "avgDeaths": 4.5,
                    "avgAssists": 8.5
                }
            ],
            "monthlyStats": [
                {"month": "Jan", "winRate": 52, "games": 25},
                {"month": "Feb", "winRate": 54, "games": 28},
                {"month": "Mar", "winRate": 56, "games": 32},
                {"month": "Apr", "winRate": 55, "games": 30},
                {"month": "May", "winRate": 58, "games": 35}
            ]
        },
        "matchCount": 150,
        "enhanced_analytics": {
            "ranked": {
                "has_ranked": True,
                "tier": "GOLD",
                "rank": "II",
                "lp": 67,
                "full_rank": "GOLD II",
                "wins": 82,
                "losses": 68,
                "win_rate": 54.7,
                "mmr_proxy": 1367,
                "percentile": 65,
                "percentile_text": "Top 35%",
                "hot_streak": True,
                "veteran": False,
                "insights": [
                    "🔥 Currently on a hot streak!",
                    "📈 Strong 54.7% win rate - climbing fast!",
                    "🎯 Close to promos! (67 LP)"
                ],
                "rank_display": {
                    "tier_color": "#FFD700",
                    "tier_icon": "🥇"
                }
            },
            "challenges": {
                "available": True,
                "total_level": "GOLD",
                "total_current": 45000,
                "total_max": 100000,
                "rare_achievements": [
                    {
                        "challenge_id": 101000,
                        "percentile": 99.2,
                        "level": "MASTER",
                        "value": 150,
                        "rarity": "Legendary",
                        "icon": "🏆"
                    },
                    {
                        "challenge_id": 202001,
                        "percentile": 96.5,
                        "level": "PLATINUM",
                        "value": 85,
                        "rarity": "Epic",
                        "icon": "⭐"
                    },
                    {
                        "challenge_id": 303002,
                        "percentile": 92.8,
                        "level": "GOLD",
                        "value": 120,
                        "rarity": "Rare",
                        "icon": "💎"
                    }
                ],
                "category_strengths": {
                    "strongest_category": "TEAMWORK",
                    "strongest_points": 12000,
                    "all_categories": {
                        "TEAMWORK": 12000,
                        "EXPERTISE": 10500,
                        "IMAGINATION": 8500,
                        "VETERANCY": 7000,
                        "COLLECTION": 7000
                    },
                    "strength_info": {
                        "icon": "🤝",
                        "description": "Team player - excels at coordination"
                    }
                },
                "summary": "Earned 3 rare achievements (top 0.8%). Strongest at TEAMWORK."
            },
            "challenges_enriched": {
                "available": True,
                "enriched_challenges": [
                    {
                        "challenge_id": 101000,
                        "name": "Unkillable Demon King",
                        "description": "Die fewer than 5 times in 10 consecutive games",
                        "percentile": 99.2,
                        "level": "MASTER",
                        "value": 150,
                        "tags": ["Survivability", "Consistency"],
                        "rarity": "Legendary"
                    },
                    {
                        "challenge_id": 202001,
                        "name": "Vision Master",
                        "description": "Achieve 50+ vision score in 25 games",
                        "percentile": 96.5,
                        "level": "PLATINUM",
                        "value": 85,
                        "tags": ["Vision", "Teamwork"],
                        "rarity": "Epic"
                    }
                ],
                "has_named_challenges": True
            },
            "recent_match_timeline": {
                "available": True,
                "laning_phase": {
                    "cs_at_10": 85,
                    "cs_at_15": 132,
                    "cs_at_20": 175,
                    "cs_per_min_15": 8.8,
                    "gold_at_15": 6200
                },
                "comeback": {
                    "is_comeback": True,
                    "gold_deficit_15min": 800,
                    "message": "Came from behind to win!"
                },
                "first_blood": {
                    "participated": True,
                    "role": "killer",
                    "timestamp": 185
                },
                "early_game_rating": "Excellent"
            },
            "live_status": {
                "in_game": False,
                "message": "Offline or not in game"
            },
            "clash": {
                "has_participated": True,
                "total_tournaments": 7,
                "unique_teams": 3,
                "is_active": True,
                "competitive_level": "High",
                "insights": [
                    "🏆 Participated in 7 Clash tournaments",
                    "👥 Played with 3 different teams"
                ]
            },
            "mastery": {
                "total_score": 847000,
                "tier": "Master",
                "tier_emoji": "👑",
                "mastery_7_champions": 5,
                "mastery_6_champions": 8,
                "mastery_5_champions": 12,
                "diversity_score": 85,
                "diversity_rating": "High",
                "insights": [
                    "👑 Master mastery tier (847,000 points)",
                    "🏆 5 Mastery 7 champions",
                    "🎯 Diverse champion pool - adaptable player"
                ]
            },
            "free_rotation": {
                "available": True,
                "current_free_count": 15,
                "played_free_champions": 2,
                "free_usage_rate": 13.3,
                "uses_free_champions": True,
                "insights": [
                    "💎 Owns most played champions - committed player"
                ]
            }
        }
    }


