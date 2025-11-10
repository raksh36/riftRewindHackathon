# Rift Rewind Quick Start Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Rift Rewind - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if .env exists
if (!(Test-Path "backend\.env")) {
    Write-Host "`n⚠️  Please create backend\.env file first!" -ForegroundColor Yellow
    Write-Host "See QUICK_START.md for instructions" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✓ Found .env file" -ForegroundColor Green

# Install backend dependencies
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
pip install fastapi uvicorn python-dotenv boto3 httpx python-multipart --quiet

# Test setup
Write-Host "`n🧪 Testing setup..." -ForegroundColor Cyan
python test_setup.py

# Start backend
Write-Host "`n🚀 Starting backend server..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "`nAPI will be available at: http://localhost:8000" -ForegroundColor Green
Write-Host "Docs available at: http://localhost:8000/docs" -ForegroundColor Green

uvicorn main:app --reload --port 8000

