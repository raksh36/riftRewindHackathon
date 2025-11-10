"""
Riot Games API Client
Handles all interactions with League of Legends API
"""
import httpx
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta


class RiotAPIClient:
    """Client for interacting with Riot Games API"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_urls = {
            "americas": "https://americas.api.riotgames.com",
            "europe": "https://europe.api.riotgames.com",
            "asia": "https://asia.api.riotgames.com",
            "sea": "https://sea.api.riotgames.com"
        }
        
        # Map platform routes to regional routing
        self.routing_map = {
            "na1": "americas",
            "br1": "americas",
            "la1": "americas",
            "la2": "americas",
            "euw1": "europe",
            "eune1": "europe",
            "tr1": "europe",
            "ru": "europe",
            "kr": "asia",
            "jp1": "asia",
            "oc1": "sea",
            "ph2": "sea",
            "sg2": "sea",
            "th2": "sea",
            "tw2": "sea",
            "vn2": "sea"
        }
        
        self.headers = {
            "X-Riot-Token": self.api_key
        }
    
    def _get_routing_value(self, platform: str) -> str:
        """Get routing value for regional API"""
        return self.routing_map.get(platform.lower(), "americas")
    
    async def _make_request(
        self,
        url: str,
        retries: int = 3,
        backoff: float = 1.0
    ) -> Optional[Dict[Any, Any]]:
        """Make HTTP request with retry logic"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(retries):
                try:
                    response = await client.get(url, headers=self.headers)
                    
                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code == 429:
                        # Rate limited - wait and retry
                        retry_after = int(response.headers.get("Retry-After", backoff))
                        await asyncio.sleep(retry_after)
                        continue
                    elif response.status_code == 404:
                        return None
                    else:
                        print(f"API Error: {response.status_code} - {response.text}")
                        
                except Exception as e:
                    print(f"Request error (attempt {attempt + 1}/{retries}): {str(e)}")
                    if attempt < retries - 1:
                        await asyncio.sleep(backoff * (attempt + 1))
                        continue
                    
            return None
    
    async def get_summoner_by_name(
        self,
        region: str,
        summoner_name: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get summoner information by name (supports both old names and Riot IDs)
        
        Args:
            region: Platform region (e.g., na1, euw1)
            summoner_name: Summoner name or Riot ID (GameName#TAG)
            
        Returns:
            Summoner data or None if not found
        """
        # Try new Riot ID format first (GameName#TAG)
        if '#' in summoner_name:
            parts = summoner_name.split('#')
            game_name = parts[0]
            tag_line = parts[1] if len(parts) > 1 else region.upper()
            
            # Use Account-V1 API for Riot ID
            routing = self._get_routing_value(region)
            account_url = f"{self.base_urls[routing]}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
            account_data = await self._make_request(account_url)
            
            if account_data and account_data.get('puuid'):
                # Get summoner data by PUUID
                summoner_url = f"https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{account_data['puuid']}"
                summoner_data = await self._make_request(summoner_url)
                if summoner_data:
                    # Add game name and tag line to response
                    summoner_data['gameName'] = account_data.get('gameName')
                    summoner_data['tagLine'] = account_data.get('tagLine')
                return summoner_data
        
        # Fallback to old summoner name API (still works for some accounts)
        url = f"https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summoner_name}"
        return await self._make_request(url)
    
    async def get_match_history(
        self,
        region: str,
        puuid: str,
        count: int = 20,
        queue_type: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get match history for a player
        
        Args:
            region: Platform region
            puuid: Player UUID
            count: Number of matches to fetch (max 100)
            queue_type: Optional queue filter (420 = Ranked Solo/Duo)
            
        Returns:
            List of detailed match data
        """
        routing = self._get_routing_value(region)
        
        # Get match IDs
        match_ids_url = f"{self.base_urls[routing]}/lol/match/v5/matches/by-puuid/{puuid}/ids"
        params = f"?start=0&count={min(count, 100)}"
        
        if queue_type:
            params += f"&queue={queue_type}"
        
        match_ids = await self._make_request(match_ids_url + params)
        
        if not match_ids:
            return []
        
        # Fetch detailed match data in parallel batches to avoid rate limiting
        async def fetch_match(match_id: str):
            match_url = f"{self.base_urls[routing]}/lol/match/v5/matches/{match_id}"
            return await self._make_request(match_url)
        
        # Process in batches of 10 to respect rate limits
        batch_size = 10
        matches = []
        
        for i in range(0, len(match_ids), batch_size):
            batch = match_ids[i:i + batch_size]
            batch_results = await asyncio.gather(*[fetch_match(mid) for mid in batch], return_exceptions=True)
            
            # Filter out None and exceptions
            for match_data in batch_results:
                if match_data and not isinstance(match_data, Exception):
                    matches.append(match_data)
            
            # Small delay between batches
            if i + batch_size < len(match_ids):
                await asyncio.sleep(0.1)
        
        return matches
    
    async def get_champion_mastery(
        self,
        region: str,
        puuid: str
    ) -> List[Dict[str, Any]]:
        """
        Get champion mastery data
        
        Args:
            region: Platform region
            puuid: Player UUID
            
        Returns:
            List of champion mastery data
        """
        url = f"https://{region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}"
        result = await self._make_request(url)
        return result if result else []
    
    async def get_ranked_stats(
        self,
        region: str,
        puuid: str
    ) -> List[Dict[str, Any]]:
        """
        Get ranked league entries for a summoner
        
        Args:
            region: Platform region
            puuid: Player UUID
            
        Returns:
            List of ranked entries (Solo/Duo, Flex, etc.)
        """
        url = f"https://{region}.api.riotgames.com/lol/league/v4/entries/by-puuid/{puuid}"
        result = await self._make_request(url)
        return result if result else []
    
    async def get_match_timeline(
        self,
        region: str,
        match_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get detailed match timeline with minute-by-minute data
        
        Args:
            region: Platform region
            match_id: Match ID
            
        Returns:
            Timeline data with frames and events
        """
        routing = self._get_routing_value(region)
        url = f"{self.base_urls[routing]}/lol/match/v5/matches/{match_id}/timeline"
        return await self._make_request(url)
    
    async def get_challenges(
        self,
        region: str,
        puuid: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get challenge achievements and progression
        
        Args:
            region: Platform region
            puuid: Player UUID
            
        Returns:
            Challenge data with achievements and percentiles
        """
        url = f"https://{region}.api.riotgames.com/lol/challenges/v1/player-data/{puuid}"
        return await self._make_request(url)
    
    async def get_active_game(
        self,
        region: str,
        puuid: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get current active game if player is in a match
        
        Args:
            region: Platform region
            puuid: Player UUID
            
        Returns:
            Active game data or None if not in game
        """
        url = f"https://{region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/{puuid}"
        return await self._make_request(url)
    
    async def get_top_champion_masteries(
        self,
        region: str,
        puuid: str,
        count: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get top champion masteries (more efficient than getting all)
        
        Args:
            region: Platform region
            puuid: Player UUID
            count: Number of top champions (default 10)
            
        Returns:
            List of top champion mastery data
        """
        url = f"https://{region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top"
        params = f"?count={count}"
        result = await self._make_request(url + params)
        return result if result else []
    
    async def get_total_mastery_score(
        self,
        region: str,
        puuid: str
    ) -> int:
        """
        Get total mastery score across all champions
        
        Args:
            region: Platform region
            puuid: Player UUID
            
        Returns:
            Total mastery score
        """
        url = f"https://{region}.api.riotgames.com/lol/champion-mastery/v4/scores/by-puuid/{puuid}"
        result = await self._make_request(url)
        return result if result else 0
    
    async def get_clash_data(
        self,
        region: str,
        puuid: str
    ) -> List[Dict[str, Any]]:
        """
        Get Clash tournament participation data
        
        Args:
            region: Platform region
            puuid: Player UUID
            
        Returns:
            List of Clash participation data
        """
        url = f"https://{region}.api.riotgames.com/lol/clash/v1/players/by-puuid/{puuid}"
        result = await self._make_request(url)
        return result if result else []
    
    async def get_champion_rotations(
        self,
        region: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get current free champion rotation
        
        Args:
            region: Platform region
            
        Returns:
            Free champion rotation data
        """
        url = f"https://{region}.api.riotgames.com/lol/platform/v3/champion-rotations"
        return await self._make_request(url)
    
    async def get_challenge_config(
        self,
        region: str
    ) -> List[Dict[str, Any]]:
        """
        Get challenge configuration (names, descriptions, thresholds)
        
        Args:
            region: Platform region
            
        Returns:
            List of challenge configurations
        """
        url = f"https://{region}.api.riotgames.com/lol/challenges/v1/challenges/config"
        result = await self._make_request(url)
        return result if result else []


