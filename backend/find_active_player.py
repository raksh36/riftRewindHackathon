"""Find an active player with recent match history"""
import asyncio
import os
from dotenv import load_dotenv
from services.riot_api import RiotAPIClient

load_dotenv()

async def find_active_player():
    api_key = os.getenv("RIOT_API_KEY")
    client = RiotAPIClient(api_key)
    
    # Test candidates - popular streamers and pro players
    candidates = [
        ("na1", "Sneaky#NA1"),
        ("na1", "Doublelift#NA1"),
        ("na1", "Tyler1#NA1"),
        ("kr", "Faker#KR1"),
        ("euw1", "Caps#EUW"),
    ]
    
    print("=" * 60)
    print("FINDING ACTIVE PLAYERS WITH MATCH HISTORY")
    print("=" * 60)
    
    for region, riot_id in candidates:
        print(f"\nTesting: {riot_id} ({region.upper()})")
        print("-" * 60)
        
        try:
            # Get summoner
            summoner = await client.get_summoner_by_name(region, riot_id)
            
            if not summoner:
                print(f"[SKIP] Player not found")
                continue
            
            print(f"[OK] Found summoner (Level {summoner.get('summonerLevel', 'N/A')})")
            
            # Try to get match history
            puuid = summoner.get('puuid')
            if not puuid:
                print(f"[SKIP] No PUUID")
                continue
            
            matches = await client.get_match_history(region, puuid, count=5)
            
            if matches and len(matches) > 0:
                print(f"[SUCCESS] Found {len(matches)} recent matches!")
                print(f"\n*** USE THIS PLAYER FOR TESTING ***")
                print(f"Summoner Name: {riot_id}")
                print(f"Region: {region.upper()}")
                print(f"Recent Matches: {len(matches)}")
                print("=" * 60)
                return riot_id, region
            else:
                print(f"[SKIP] No recent matches")
                
        except Exception as e:
            print(f"[ERROR] {str(e)}")
    
    print("\n[FINAL] Could not find any active players!")
    print("You may need to use your own League account for testing.")

if __name__ == "__main__":
    asyncio.run(find_active_player())

