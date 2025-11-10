# 🎮 Riot API Analytics - Current & Enhanced

## 📊 Currently Using (3 APIs)

### ✅ **1. Summoner-V4 API**
**Endpoint:** `/lol/summoner/v4/summoners/by-name/{summonerName}`

**What We Get:**
- Summoner ID
- Account ID
- PUUID (Player UUID)
- Summoner Level
- Profile Icon ID
- Last time summoner was modified

**How We Use It:**
```python
await riot_client.get_summoner_by_name(region="na1", summoner_name="Doublelift")
```

**Analytics Extracted:**
- Player identification
- Account age proxy (summoner level)
- Profile customization

---

### ✅ **2. Match-V5 API**
**Endpoints:** 
- `/lol/match/v5/matches/by-puuid/{puuid}/ids` (Get match IDs)
- `/lol/match/v5/matches/{matchId}` (Get match details)

**What We Get (Per Match):**
```json
{
  "metadata": {
    "matchId": "NA1_1234567890",
    "participants": ["puuid1", "puuid2", ...]
  },
  "info": {
    "gameDuration": 1845,
    "gameCreation": 1731234567890,
    "gameMode": "CLASSIC",
    "queueId": 420,
    "participants": [
      {
        "puuid": "player_uuid",
        "championId": 157,
        "championName": "Yasuo",
        "kills": 12,
        "deaths": 3,
        "assists": 8,
        "totalDamageDealt": 185000,
        "goldEarned": 15000,
        "totalMinionsKilled": 245,
        "visionScore": 32,
        "win": true,
        "pentaKills": 0,
        "quadraKills": 1,
        "tripleKills": 2,
        "doubleKills": 4,
        "killingSprees": 3,
        "largestKillingSpree": 7,
        "teamPosition": "MIDDLE",
        "perks": {...},
        "challenges": {...}
      }
    ]
  }
}
```

**Analytics Extracted:**
- Win/Loss record
- KDA (Kills/Deaths/Assists)
- Damage dealt
- Gold earned
- CS (Creep Score)
- Vision score
- Multi-kills
- Role/Position
- Game duration
- Queue type (Ranked vs Normal)
- Time played (game creation timestamp)

---

### ✅ **3. Champion-Mastery-V4 API**
**Endpoint:** `/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}`

**What We Get:**
```json
[
  {
    "championId": 157,
    "championLevel": 7,
    "championPoints": 456789,
    "lastPlayTime": 1731234567890,
    "championPointsSinceLastLevel": 21600,
    "championPointsUntilNextLevel": 0,
    "tokensEarned": 2
  }
]
```

**Analytics Extracted:**
- Mastery level per champion
- Total mastery points
- Most played champions
- Champion diversity
- Last time played each champion
- Mastery progression

---

## 🚀 Additional Riot APIs Available (NOT Currently Using)

### ⭐ **4. League-V4 API** (RECOMMENDED TO ADD)
**Endpoints:**
- `/lol/league/v4/entries/by-summoner/{encryptedSummonerId}`

**What We'd Get:**
```json
[
  {
    "queueType": "RANKED_SOLO_5x5",
    "tier": "GOLD",
    "rank": "II",
    "leaguePoints": 67,
    "wins": 145,
    "losses": 132,
    "hotStreak": false,
    "veteran": true,
    "freshBlood": false,
    "inactive": false
  }
]
```

**New Analytics:**
- ✅ **Current Rank** (Bronze → Challenger)
- ✅ **LP (League Points)**
- ✅ **Ranked Win Rate**
- ✅ **Hot Streak Detection**
- ✅ **Veteran Status**
- ✅ **Activity Status**

**Why Add This:**
- Shows player skill level
- Rank progression over time
- Competitive context for stats

---

### ⭐ **5. Match-V5 Timeline API** (ADVANCED ANALYTICS)
**Endpoint:** `/lol/match/v5/matches/{matchId}/timeline`

**What We'd Get:**
```json
{
  "info": {
    "frameInterval": 60000,
    "frames": [
      {
        "timestamp": 60000,
        "participantFrames": {
          "1": {
            "totalGold": 1500,
            "level": 3,
            "xp": 1200,
            "minionsKilled": 18,
            "jungleMinionsKilled": 0,
            "position": {"x": 5000, "y": 8000}
          }
        },
        "events": [
          {
            "type": "CHAMPION_KILL",
            "timestamp": 65000,
            "killerId": 1,
            "victimId": 6,
            "position": {"x": 5000, "y": 8000}
          },
          {
            "type": "BUILDING_KILL",
            "buildingType": "TOWER_BUILDING",
            "teamId": 100,
            "timestamp": 120000
          }
        ]
      }
    ]
  }
}
```

**New Analytics:**
- ✅ **Minute-by-minute performance**
- ✅ **Gold lead/deficit tracking**
- ✅ **CS @ 10/15/20 minutes**
- ✅ **First blood participation**
- ✅ **Tower taking patterns**
- ✅ **Dragon/Baron timing**
- ✅ **Death locations (heatmap data)**
- ✅ **Comeback detection** (behind → ahead)

**Why Add This:**
- Deep game-flow analysis
- Laning phase metrics
- Objective control patterns
- **PERFECT for Hidden Gem Detector prize**

---

### ⭐ **6. Spectator-V4 API** (REAL-TIME)
**Endpoint:** `/lol/spectator/v4/active-games/by-summoner/{encryptedSummonerId}`

**What We'd Get:**
- Currently playing game info
- Live match data
- Champion selections
- Teammate information

**New Analytics:**
- ✅ **"Currently in game" status**
- ✅ **Live match tracking**
- ✅ **Real-time updates**

**Why Add This:**
- Show if player is active NOW
- Live game commentary
- Real-time insights

---

### 🎯 **7. Challenges-V1 API** (ACHIEVEMENTS)
**Endpoint:** `/lol/challenges/v1/player-data/{puuid}`

**What We'd Get:**
```json
{
  "totalPoints": {
    "level": "GOLD",
    "current": 45000,
    "max": 100000
  },
  "categoryPoints": {
    "TEAMWORK": 12000,
    "EXPERTISE": 15000,
    "IMAGINATION": 8000
  },
  "challenges": [
    {
      "challengeId": 101000,
      "percentile": 75.5,
      "level": "GOLD",
      "value": 150
    }
  ]
}
```

**New Analytics:**
- ✅ **Challenge completion rates**
- ✅ **Rare achievements**
- ✅ **Category strengths** (Teamwork, Expertise, etc.)
- ✅ **Percentile rankings**
- ✅ **Unique accomplishments**

**Why Add This:**
- **PERFECT for Hidden Gem Detector**
- Shows rare achievements
- Highlights unique playstyles
- Community comparison

---

### 📊 **8. League-V4 Entries API** (LEADERBOARD)
**Endpoint:** `/lol/league/v4/entries/{queue}/{tier}/{division}`

**What We'd Get:**
- Top players in each tier
- Leaderboard rankings
- Comparative data

**New Analytics:**
- ✅ **Rank percentile** (top X% of players)
- ✅ **Regional comparisons**
- ✅ **Peer benchmarking**

---

## 🔧 **Enhanced Analytics Implementation**

Let me create an enhanced API client with these new endpoints:

### **File: `backend/services/riot_api_enhanced.py`**

```python
"""
Enhanced Riot Games API Client with Advanced Analytics
"""
import httpx
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime

class EnhancedRiotAPIClient:
    """Enhanced client with additional endpoints for better analytics"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_urls = {
            "americas": "https://americas.api.riotgames.com",
            "europe": "https://europe.api.riotgames.com",
            "asia": "https://asia.api.riotgames.com",
            "sea": "https://sea.api.riotgames.com"
        }
        self.routing_map = {
            "na1": "americas", "br1": "americas", "la1": "americas", "la2": "americas",
            "euw1": "europe", "eune1": "europe", "tr1": "europe", "ru": "europe",
            "kr": "asia", "jp1": "asia",
            "oc1": "sea", "ph2": "sea", "sg2": "sea", "th2": "sea", "tw2": "sea", "vn2": "sea"
        }
        self.headers = {"X-Riot-Token": self.api_key}
    
    def _get_routing_value(self, platform: str) -> str:
        return self.routing_map.get(platform.lower(), "americas")
    
    async def _make_request(self, url: str, retries: int = 3, backoff: float = 1.0) -> Optional[Dict[Any, Any]]:
        """Make HTTP request with retry logic"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(retries):
                try:
                    response = await client.get(url, headers=self.headers)
                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code == 429:
                        retry_after = int(response.headers.get("Retry-After", backoff))
                        await asyncio.sleep(retry_after)
                        continue
                    elif response.status_code == 404:
                        return None
                except Exception as e:
                    if attempt < retries - 1:
                        await asyncio.sleep(backoff * (attempt + 1))
                        continue
            return None
    
    # ========== NEW ENDPOINTS ==========
    
    async def get_ranked_stats(self, region: str, summoner_id: str) -> List[Dict[str, Any]]:
        """
        Get ranked league entries for a summoner
        
        NEW ANALYTICS:
        - Current rank (tier + division)
        - League Points
        - Wins/Losses
        - Hot streak status
        """
        url = f"https://{region}.api.riotgames.com/lol/league/v4/entries/by-summoner/{summoner_id}"
        result = await self._make_request(url)
        return result if result else []
    
    async def get_match_timeline(self, region: str, match_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed match timeline with minute-by-minute data
        
        NEW ANALYTICS:
        - CS @ 10/15/20 minutes
        - Gold difference over time
        - First blood timing
        - Objective control
        - Death locations
        - Comeback patterns
        """
        routing = self._get_routing_value(region)
        url = f"{self.base_urls[routing]}/lol/match/v5/matches/{match_id}/timeline"
        return await self._make_request(url)
    
    async def get_active_game(self, region: str, summoner_id: str) -> Optional[Dict[str, Any]]:
        """
        Get current active game if player is in match
        
        NEW ANALYTICS:
        - Currently playing status
        - Live match data
        - Real-time insights
        """
        url = f"https://{region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/{summoner_id}"
        return await self._make_request(url)
    
    async def get_challenges(self, region: str, puuid: str) -> Optional[Dict[str, Any]]:
        """
        Get challenge achievements and progression
        
        NEW ANALYTICS:
        - Rare achievements
        - Challenge completion rates
        - Category strengths (Teamwork, Expertise, etc.)
        - Percentile rankings
        """
        url = f"https://{region}.api.riotgames.com/lol/challenges/v1/player-data/{puuid}"
        return await self._make_request(url)
    
    async def get_summoner_by_puuid(self, region: str, puuid: str) -> Optional[Dict[str, Any]]:
        """Get summoner info by PUUID (needed for some cross-API calls)"""
        url = f"https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}"
        return await self._make_request(url)
```

---

## 📈 **New Analytics Calculations**

### **1. Rank Progression Analytics**

```python
class RankAnalyzer:
    """Analyze ranked progression"""
    
    RANK_VALUES = {
        "IRON": 0, "BRONZE": 400, "SILVER": 800, 
        "GOLD": 1200, "PLATINUM": 1600, "EMERALD": 2000,
        "DIAMOND": 2400, "MASTER": 2800, "GRANDMASTER": 3200, "CHALLENGER": 3600
    }
    
    DIVISION_VALUES = {"IV": 0, "III": 100, "II": 200, "I": 300}
    
    def calculate_mmr_proxy(self, tier: str, rank: str, lp: int) -> int:
        """Calculate approximate MMR for comparisons"""
        base = self.RANK_VALUES.get(tier, 0)
        division = self.DIVISION_VALUES.get(rank, 0)
        return base + division + lp
    
    def get_rank_percentile(self, tier: str, rank: str) -> float:
        """Get approximate percentile for rank"""
        percentiles = {
            "IRON": 5, "BRONZE": 20, "SILVER": 45, "GOLD": 65,
            "PLATINUM": 80, "EMERALD": 90, "DIAMOND": 96,
            "MASTER": 98.5, "GRANDMASTER": 99.5, "CHALLENGER": 99.9
        }
        return percentiles.get(tier, 50)
```

### **2. Timeline Analytics**

```python
class TimelineAnalyzer:
    """Analyze match timelines for advanced metrics"""
    
    def calculate_cs_at_time(self, timeline: Dict, participant_id: int, minutes: int) -> int:
        """Get CS at specific time (e.g., 10 minutes)"""
        target_frame = minutes  # Frames are every minute
        if target_frame >= len(timeline['info']['frames']):
            return 0
        
        frame = timeline['info']['frames'][target_frame]
        participant_frame = frame['participantFrames'][str(participant_id)]
        
        return participant_frame['minionsKilled'] + participant_frame['jungleMinionsKilled']
    
    def detect_comeback(self, timeline: Dict, participant_id: int, win: bool) -> Dict:
        """Detect if player came from behind to win"""
        if not win:
            return {"comeback": False}
        
        # Check gold differential at 15 minutes
        frame_15 = timeline['info']['frames'][15] if len(timeline['info']['frames']) > 15 else None
        if not frame_15:
            return {"comeback": False}
        
        participant_frame = frame_15['participantFrames'][str(participant_id)]
        participant_gold = participant_frame['totalGold']
        
        # Compare to team average (simplified)
        return {
            "comeback": participant_gold < 5000,  # Behind in gold at 15 min
            "gold_deficit": 5000 - participant_gold
        }
    
    def get_first_blood_participation(self, timeline: Dict, participant_id: int) -> bool:
        """Check if participated in first blood"""
        for frame in timeline['info']['frames']:
            for event in frame['events']:
                if event['type'] == 'CHAMPION_KILL' and event.get('firstBlood'):
                    return event['killerId'] == participant_id or participant_id in event.get('assistingParticipantIds', [])
        return False
```

### **3. Challenge Analytics**

```python
class ChallengeAnalyzer:
    """Analyze challenge achievements"""
    
    def find_rare_achievements(self, challenges: Dict) -> List[Dict]:
        """Find achievements in top percentiles"""
        rare = []
        for challenge in challenges.get('challenges', []):
            if challenge.get('percentile', 0) >= 90:  # Top 10%
                rare.append({
                    "challenge_id": challenge['challengeId'],
                    "percentile": challenge['percentile'],
                    "level": challenge['level'],
                    "rarity": "rare" if challenge['percentile'] >= 95 else "uncommon"
                })
        return rare
    
    def get_strength_categories(self, challenges: Dict) -> Dict[str, str]:
        """Identify player's strongest categories"""
        categories = challenges.get('categoryPoints', {})
        if not categories:
            return {}
        
        max_category = max(categories.items(), key=lambda x: x[1])
        return {
            "strongest": max_category[0],
            "points": max_category[1],
            "all_categories": categories
        }
```

---

## 🎯 **Analytics Enhancements Summary**

### **Currently Tracking:**
1. ✅ Win/Loss (82 wins, 68 losses)
2. ✅ KDA (3.2 average)
3. ✅ Champion mastery (Top 5 champions)
4. ✅ Damage per game (18,500 avg)
5. ✅ Gold per game (15,000 avg)
6. ✅ Multi-kills (Pentakills, Quadras)

### **Adding With New APIs:**
7. ✅ **Current Rank** (Gold II, 67 LP)
8. ✅ **Rank Percentile** (Top 35% of players)
9. ✅ **Hot Streak** (Currently on winning streak)
10. ✅ **CS @ 10min** (85 CS avg - above average)
11. ✅ **First Blood Rate** (23% participation)
12. ✅ **Comeback Rate** (35% win when behind @ 15min)
13. ✅ **Objective Control** (Dragon secure rate: 65%)
14. ✅ **Rare Achievements** ("Unkillable Demon King" - Top 5%)
15. ✅ **Category Strengths** (Best at: TEAMWORK)
16. ✅ **Vision Score Trends** (Improving +12% over 30 days)
17. ✅ **Laning Phase** (Gold diff @ 15min: +245 avg)
18. ✅ **Death Heatmap Data** (Most deaths in enemy jungle)
19. ✅ **Tower Damage** (12,500 avg structure damage)
20. ✅ **Active Status** ("Currently in game" / "Last played 2h ago")

---

## 📊 **Data Visualization Opportunities**

With enhanced APIs, we can create:

1. **Rank Progression Chart** (Bronze → Gold over time)
2. **CS/Min Heatmap** (Performance by game time)
3. **Comeback Potential Graph** (Win% when behind)
4. **Objective Control Pie Chart** (Dragon/Baron/Tower %)
5. **Death Location Heatmap** (Where you die most)
6. **Gold Differential Timeline** (Lead/Behind tracking)
7. **Rare Achievement Badges** (Top 10% accomplishments)
8. **Category Strength Radar** (Teamwork vs Expertise vs Imagination)

---

## 🚀 **Priority Implementation Order**

### **Phase 1: Easy Wins** (5 minutes)
1. Add `get_ranked_stats()` - Shows current rank
2. Display rank badge on profile
3. Add "Top X% of players" badge

### **Phase 2: Enhanced Insights** (15 minutes)
4. Add `get_challenges()` - Rare achievements
5. Display top 3 rare achievements
6. Add achievement badges

### **Phase 3: Deep Analytics** (30 minutes)
7. Add `get_match_timeline()` for recent matches
8. Calculate CS@10, Gold@15
9. Detect comebacks
10. Show laning phase metrics

---

Would you like me to implement these enhanced analytics now?

