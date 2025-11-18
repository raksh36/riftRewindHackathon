"""
Test script to check what fields are actually available from Riot API
"""
import asyncio
import os
from dotenv import load_dotenv
from services.riot_api import RiotAPIClient
import json

load_dotenv()

async def check_available_fields():
    api_key = os.getenv("RIOT_API_KEY")
    client = RiotAPIClient(api_key)
    
    print("=" * 60)
    print("CHECKING RIOT API AVAILABLE FIELDS")
    print("=" * 60)
    
    # Get a test player
    summoner = await client.get_summoner_by_name("na1", "Sneaky#NA1")
    
    if not summoner:
        print("Player not found")
        return
    
    # Get one match
    matches = await client.get_match_history("na1", summoner["puuid"], count=1)
    
    if not matches or len(matches) == 0:
        print("No matches found")
        return
    
    match = matches[0]
    participants = match.get('info', {}).get('participants', [])
    
    # Find our player's data
    player_data = None
    for p in participants:
        if p.get('puuid') == summoner['puuid']:
            player_data = p
            break
    
    if not player_data:
        print("Player data not found in match")
        return
    
    print(f"\nAvailable fields in participant data:\n")
    print("=" * 60)
    
    # Print all available fields
    for key in sorted(player_data.keys()):
        value = player_data[key]
        # Only show relevant stats (not long strings or complex objects)
        if isinstance(value, (int, float, bool)) and not isinstance(value, bool):
            print(f"{key:40} = {value}")
        elif isinstance(value, bool):
            print(f"{key:40} = {value}")
    
    print("\n" + "=" * 60)
    print("OBJECTIVE-RELATED FIELDS:")
    print("=" * 60)
    
    # Check for objective-related fields
    objective_fields = [
        'dragonKills', 'baronKills', 'turretKills', 'inhibitorKills',
        'objectives', 'challenges', 'teamEarlySurrendered'
    ]
    
    for field in objective_fields:
        if field in player_data:
            print(f"✅ {field:30} = {player_data[field]}")
        else:
            print(f"❌ {field:30} = NOT AVAILABLE")
    
    print("\n" + "=" * 60)
    print("CHALLENGES OBJECT (if available):")
    print("=" * 60)
    
    if 'challenges' in player_data:
        challenges = player_data['challenges']
        # Show objective-related challenges
        objective_challenges = [k for k in challenges.keys() if 'dragon' in k.lower() or 'baron' in k.lower() or 'turret' in k.lower()]
        for key in objective_challenges[:10]:
            print(f"{key:40} = {challenges[key]}")

if __name__ == "__main__":
    asyncio.run(check_available_fields())

