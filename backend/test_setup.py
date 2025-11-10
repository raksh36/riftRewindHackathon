"""Quick test script to verify setup"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("Rift Rewind - Setup Verification")
print("=" * 60)

# Check Python version
print(f"\n✓ Python version: {sys.version.split()[0]}")

# Check environment variables
riot_key = os.getenv("RIOT_API_KEY")
aws_region = os.getenv("AWS_REGION")
aws_key = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")

print("\nEnvironment Variables:")
print(f"  {'✓' if riot_key else '✗'} RIOT_API_KEY: {'Set' if riot_key else 'Missing'}")
print(f"  {'✓' if aws_region else '✗'} AWS_REGION: {aws_region or 'Missing'}")
print(f"  {'✓' if aws_key else '✗'} AWS_ACCESS_KEY_ID: {'Set' if aws_key else 'Missing'}")
print(f"  {'✓' if aws_secret else '✗'} AWS_SECRET_ACCESS_KEY: {'Set' if aws_secret else 'Missing'}")

# Check required modules
print("\nRequired Modules:")
modules = ["fastapi", "uvicorn", "boto3", "httpx", "dotenv"]
for module in modules:
    try:
        __import__(module)
        print(f"  ✓ {module}")
    except ImportError:
        print(f"  ✗ {module} - Run: pip install {module}")

# Test Riot API connection
if riot_key:
    print("\nTesting Riot API...")
    try:
        import httpx
        response = httpx.get(
            "https://na1.api.riotgames.com/lol/platform/v3/champion-rotations",
            headers={"X-Riot-Token": riot_key},
            timeout=10
        )
        if response.status_code == 200:
            print("  ✓ Riot API key is valid!")
        else:
            print(f"  ✗ Riot API error: {response.status_code}")
    except Exception as e:
        print(f"  ✗ Connection error: {e}")

# Test AWS connection
if aws_key and aws_secret:
    print("\nTesting AWS Bedrock...")
    try:
        import boto3
        bedrock = boto3.client(
            'bedrock-runtime',
            region_name=aws_region or 'us-east-1',
            aws_access_key_id=aws_key,
            aws_secret_access_key=aws_secret
        )
        print("  ✓ AWS credentials configured!")
    except Exception as e:
        print(f"  ✗ AWS error: {e}")

print("\n" + "=" * 60)
print("Setup Status:")
if riot_key and aws_key:
    print("✓ Ready to start! Run: uvicorn main:app --reload --port 8000")
elif riot_key:
    print("⚠ Riot API ready. Add AWS credentials for AI features.")
else:
    print("✗ Please configure .env file with API keys")
print("=" * 60 + "\n")

