# Quick Start Guide

## Backend Setup (5 minutes)

### 1. Create .env files

**File: backend/.env**
```env
RIOT_API_KEY=***REMOVED***
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### 2. Install Dependencies
```bash
cd backend
pip install fastapi uvicorn python-dotenv boto3 httpx python-multipart
```

### 3. Start Backend
```bash
uvicorn main:app --reload --port 8000
```

Test: http://localhost:8000/health

---

## Frontend Setup (5 minutes)

### 1. Create .env file

**File: frontend/.env**
```env
VITE_API_URL=http://localhost:8000
```

### 2. Install & Run
```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:5173

---

## Quick Test

1. Enter summoner name (e.g., "Faker")
2. Select region (e.g., "kr")
3. Click "Get My Recap"

---

## API Endpoints to Test

```bash
# Health check
curl http://localhost:8000/health

# Get regions
curl http://localhost:8000/api/regions

# Get player stats
curl "http://localhost:8000/api/player/na1/YourName?match_count=10"
```

---

## If Dependencies Fail

Just install manually:
```bash
pip install fastapi uvicorn python-dotenv boto3 httpx python-multipart
```

All Python 3.13 compatible!

