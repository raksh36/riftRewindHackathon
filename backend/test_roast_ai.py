import asyncio
import sys
sys.path.insert(0, '.')

from services.aws_bedrock import BedrockAIService

async def test_roast():
    service = BedrockAIService(
        region="us-east-1",
        model_id="amazon.nova-lite-v1:0"
    )
    
    test_stats = {
        "avgDeaths": 8.4,
        "winRate": 40.0,
        "avgKDA": 1.62,
        "recentTrend": "Declining"
    }
    
    print("Testing AI roast generation...")
    print(f"Stats: {test_stats}")
    print("-" * 50)
    
    try:
        result = await service.generate_roast(
            summoner_name="TestPlayer",
            stats=test_stats
        )
        print("\n✅ SUCCESS!")
        print(f"Result: {result}")
        print("\nRoasts:")
        for i, roast in enumerate(result.get("roasts", []), 1):
            print(f"  {i}. {roast}")
    except Exception as e:
        print(f"\n❌ FAILED!")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_roast())

