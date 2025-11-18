"""
Debug script to test Riot API calls directly
"""
import asyncio
import os
from dotenv import load_dotenv
from services.riot_api import RiotAPIClient

load_dotenv()

async def test_riot_api():
    api_key = os.getenv("RIOT_API_KEY")
    
    print("=" * 60)
    print("RIOT API DEBUG TEST")
    print("=" * 60)
    
    if not api_key:
        print("[ERROR] No RIOT_API_KEY found in .env file!")
        return
    
    print(f"[OK] API Key found: {api_key[:20]}...{api_key[-10:]}")
    print()
    
    client = RiotAPIClient(api_key)
    
    # Test cases with different player formats
    test_cases = [
        ("na1", "Doublelift"),
        ("na1", "Doublelift#NA1"),
        ("na1", "TSM Doublelift"),
        ("kr", "Hide on bush"),  # Faker's account
        ("kr", "Faker#KR1"),
    ]
    
    for region, summoner_name in test_cases:
        print(f"\n{'='*60}")
        print(f"Testing: {summoner_name} ({region.upper()})")
        print(f"{'='*60}")
        
        try:
            # Test the API call
            result = await client.get_summoner_by_name(region, summoner_name)
            
            if result:
                print(f"[SUCCESS] Found player!")
                print(f"   PUUID: {result.get('puuid', 'N/A')[:20]}...")
                print(f"   Summoner Level: {result.get('summonerLevel', 'N/A')}")
                print(f"   Account ID: {result.get('accountId', 'N/A')[:20]}...")
                if 'gameName' in result:
                    print(f"   Riot ID: {result['gameName']}#{result.get('tagLine', 'N/A')}")
            else:
                print(f"[NOT FOUND] Player not found (404)")
                
        except Exception as e:
            print(f"[ERROR] {str(e)}")
    
    print(f"\n{'='*60}")
    print("TESTING ACCOUNT-V1 API DIRECTLY")
    print(f"{'='*60}")
    
    # Test Account-V1 API with known format
    import httpx
    
    test_riot_ids = [
        ("americas", "Doublelift", "NA1"),
        ("americas", "Sneaky", "NA1"),
        ("asia", "Faker", "KR1"),
    ]
    
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        for routing, game_name, tag_line in test_riot_ids:
            url = f"https://{routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
            print(f"\nTesting URL: {url}")
            
            try:
                response = await http_client.get(
                    url,
                    headers={"X-Riot-Token": api_key}
                )
                
                print(f"Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"[SUCCESS] Found: {data.get('gameName')}#{data.get('tagLine')}")
                    print(f"   PUUID: {data.get('puuid', 'N/A')[:20]}...")
                elif response.status_code == 403:
                    print(f"[ERROR] 403 Forbidden - API Key invalid!")
                    print(f"   Response: {response.text}")
                elif response.status_code == 404:
                    print(f"[NOT FOUND] 404 - Player doesn't exist")
                else:
                    print(f"[ERROR] HTTP {response.status_code}")
                    print(f"   Response: {response.text}")
                    
            except Exception as e:
                print(f"[ERROR] Request failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_riot_api())

