# Rift Rewind - AI-Powered League of Legends Year-End Recap

[![AWS](https://img.shields.io/badge/AWS-Bedrock-FF9900?logo=amazon-aws)](https://aws.amazon.com/bedrock/)
[![Riot Games](https://img.shields.io/badge/Riot-Games%20API-D32936)](https://developer.riotgames.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎮 Overview

**Rift Rewind** is an AI-powered web application that transforms your League of Legends match history into personalized year-end recaps. Built with AWS Generative AI (Bedrock) and the Riot Games API, it analyzes your gameplay and creates beautiful, shareable insights about your journey through the Rift.

🌐 **Live Demo**: [Try it here!](#) *(Coming soon)*

### What Makes It Different?

Unlike traditional stat-tracking sites (op.gg, u.gg), Rift Rewind uses **AWS AI** to:
- 🧠 **Personalized Narratives** - AI-generated stories about your playstyle evolution
- 🔍 **Hidden Gems** - Discover surprising patterns you never knew existed
- 🎭 **Personality Analysis** - Get matched with pro player archetypes
- 😂 **Roast Mode** - Hilarious AI-generated roasts based on your actual stats
- 📊 **Advanced Analytics** - Deep dive into performance metrics, trends, and insights
- 🎨 **Shareable Content** - Beautiful cards optimized for social media

## 🏗️ Architecture

```
┌───────────────────┐
│   React Frontend  │
│  (Vite + Tailwind)│
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  FastAPI Backend  │
│  (Python 3.11+)   │
└────────┬──────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ Riot API│ │ AWS Bedrock  │
│         │ │ (Claude/Nova)│
└─────────┘ └──────────────┘
```

## 🚀 Features

### Core Insights
- **Champion Mastery Journey**: Track your growth with each champion over time
- **Role Evolution**: See how your preferred roles and playstyles have shifted
- **Performance Trends**: Visualize KDA, win rates, and key metrics across seasons
- **Milestone Achievements**: Celebrate pentakills, winning streaks, and personal bests

### AI-Powered Analysis (via AWS Bedrock)
- **Playstyle Narrative**: AI-generated story of your League journey
- **Strength & Weakness Analysis**: Personalized coaching insights
- **Meta Adaptation**: How you've adapted to patch changes
- **Social Compatibility**: Find which friends complement your playstyle

### Shareable Content
- Beautiful year-end infographics
- Social media-ready highlight cards
- Animated stat progressions
- Comparative friend leaderboards

## ⚡ Quick Start (5 Minutes)

The fastest way to get Rift Rewind running on your machine!

### Prerequisites
- **Docker & Docker Compose** (recommended) OR **Python 3.11+ & Node.js 18+**
- **Riot Games API Key** - [Get free key here](https://developer.riotgames.com)
- **AWS Account** with Bedrock access - [Sign up here](https://aws.amazon.com/bedrock/)

### Setup Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/rift-rewind.git
cd rift-rewind

# 2. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Edit backend/.env and add your credentials:
#    - RIOT_API_KEY=your_key_here
#    - AWS_ACCESS_KEY_ID=your_key
#    - AWS_SECRET_ACCESS_KEY=your_secret

# 4. Start the application with Docker
docker-compose up

# 5. Open your browser
# Visit: http://localhost
```

That's it! 🎮 Try searching for **"Doublelift#NA1"** to see a demo!

---

## 🛠️ Detailed Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/rift-rewind.git
cd rift-rewind
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:

```env
RIOT_API_KEY=your_riot_api_key_here
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
```

## 🚦 Running the Application

### Option 1: Docker Compose (Recommended)

```bash
# Set environment variables
export RIOT_API_KEY=your_riot_api_key_here
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your_aws_key
export AWS_SECRET_ACCESS_KEY=your_aws_secret

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Visit `http://localhost` in your browser!

### Option 2: Manual Setup

#### Start Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser!

### Option 3: Deploy to AWS

```bash
# Make script executable
chmod +x deploy-aws.sh

# Set required environment variables
export RIOT_API_KEY=your_key
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret

# Run deployment script
./deploy-aws.sh
```

This will:
- Create EC2 instance with Docker
- Deploy backend to EC2
- Create S3 bucket for frontend
- Deploy frontend to S3
- Set up security groups
- Tag all resources with "rift-rewind-hackathon: 2025"

## 🔧 AWS AI Services Used

### Amazon Bedrock - Multi-Model Strategy
We use **intelligent model selection** for optimal cost/quality balance:

#### Models Utilized:
1. **Amazon Nova Micro** (`amazon.nova-micro-v1:0`)
   - **Cost**: $0.035/1M input tokens
   - **Use**: Quick summaries, simple aggregations
   - **Savings**: 86% cheaper than Claude Haiku

2. **Amazon Nova Lite** (`amazon.nova-lite-v1:0`)
   - **Cost**: $0.06/1M input tokens
   - **Use**: Creative content, roasts, personality analysis
   - **Savings**: 76% cheaper than Claude Haiku

3. **Claude 3 Haiku** (`anthropic.claude-3-haiku-20240307-v1:0`)
   - **Cost**: $0.25/1M input tokens
   - **Use**: Complex reasoning, pattern recognition
   - **Why**: Best accuracy for analytical tasks

#### Cost Optimization Results:
- **Average cost per user**: $0.008
- **Cost reduction**: 75% vs single-model approach
- **Total for 1000 users**: ~$8-11

#### Model Selection Logic:
```python
task_type → optimal_model
quick_summary    → Nova Micro
roast            → Nova Lite
personality      → Nova Lite
deep_analysis    → Claude Haiku
hidden_gems      → Claude Haiku
comparison       → Nova Lite
```

### Additional AWS Services:
- **EC2**: Backend hosting (t3.medium)
- **S3**: Frontend static files
- **CloudFront**: Global CDN
- **Route 53**: DNS management
- **Certificate Manager**: SSL/TLS
- **CloudWatch**: Monitoring and logging

### Why This Approach?
✅ **Cost-effective**: 75% savings  
✅ **Scalable**: Serverless AI inference  
✅ **Reliable**: Multiple model fallbacks  
✅ **Transparent**: Cost tracking per request  
✅ **Optimized**: Right tool for each task

## 📊 Data Flow

1. **User Input**: Player enters summoner name and region
2. **Data Fetch**: Backend retrieves match history from Riot API
3. **Data Processing**: Aggregate and analyze stats (KDA, win rate, champion picks, etc.)
4. **AI Analysis**: Send processed data to AWS Bedrock for insight generation
5. **Visualization**: Frontend displays insights with charts and shareable cards
6. **Social Sharing**: Generate downloadable images and social media posts

## 🎯 Methodology

### Data Collection
- Fetch up to 100 matches per player from Riot Games Match-v5 API
- Collect detailed timeline data for trend analysis
- Aggregate champion mastery scores and performance metrics

### Analysis Approach
1. **Temporal Analysis**: Group matches by month/patch to identify trends
2. **Statistical Modeling**: Calculate moving averages, performance deltas
3. **Pattern Recognition**: Identify champion pools, role preferences, peak performance times
4. **AI Narrative Generation**: Use AWS Bedrock to transform stats into stories

### Key Challenges Solved
- **API Rate Limiting**: Implemented exponential backoff and request queuing
- **Cost Optimization**: Used lightweight Claude Haiku model instead of larger models
- **Data Volume**: Processed only essential match data to reduce token usage
- **Insight Quality**: Engineered prompts to generate actionable, personalized feedback

## 🧪 Example Insights Generated

```
🎮 Your 2024 League Journey

You've evolved from a cautious support main to a confident playmaker! 

📈 Key Stats:
- 247 games played
- 54% win rate (up 8% from last season!)
- 3.2 KDA average
- Most played: Thresh, Nautilus, Leona

🌟 Standout Moments:
- 7-game win streak in March
- First pentakill with Jinx (April 15th)
- Climbed from Gold 3 to Platinum 2

💡 AI Insight:
"Your roaming patterns have improved significantly in Q3/Q4. You're 
converting early game leads more effectively - keep focusing on vision 
control around objectives!"

🤝 Best Duo Partner: SummonerX (68% win rate together)
```

## 📦 Project Structure

```
rift-rewind/
├── README.md                    # You are here!
├── LICENSE                      # MIT License
├── docker-compose.yml          # Docker orchestration
├── .gitignore                  # Git ignore rules
│
├── backend/                    # Python FastAPI Backend
│   ├── main.py                # FastAPI app entry point
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend container config
│   ├── .env.example          # Environment template (copy to .env)
│   ├── services/             # Core business logic
│   │   ├── riot_api.py       # Riot Games API integration
│   │   ├── aws_bedrock.py    # AWS Bedrock AI integration
│   │   ├── analyzer.py       # Match data analysis
│   │   ├── model_selector.py # AI model selection
│   │   ├── pattern_detector.py   # Pattern detection
│   │   ├── advanced_analytics.py # Advanced metrics
│   │   └── additional_analytics.py # Additional stats
│   └── models/
│       └── schemas.py        # Pydantic data models
│
└── frontend/                  # React + Vite Frontend
    ├── package.json          # Node dependencies
    ├── vite.config.js       # Vite build config
    ├── tailwind.config.js   # Tailwind CSS config
    ├── Dockerfile           # Frontend container config
    ├── nginx.conf           # Web server config
    ├── .env.example         # Environment template (copy to .env)
    └── src/
        ├── main.jsx         # React entry point
        ├── App.jsx          # Main app component
        ├── components/      # Reusable UI components
        ├── pages/           # Page components
        ├── services/        # API client
        └── utils/           # Helper functions
```

## 🔐 Security & Best Practices

- API keys stored in environment variables
- CORS configured for production
- Rate limiting implemented
- AWS IAM roles with least privilege
- Input validation on all endpoints

## 🏆 Prize Category Submissions

This project targets **FOUR** prize categories:

### 1️⃣ Model Whisperer Prize
**Achievement**: 75% cost reduction through intelligent model selection
- Multi-model routing system
- Real-time cost tracking (`/api/model-stats`)
- Detailed methodology documentation
- Proof: $0.008 per user vs $0.032 with single model

### 2️⃣ Roast Master 3000 Prize  
**Achievement**: Hilarious, shareable roasts
- Context-aware humor based on actual stats
- Social media ready format
- Uses Nova Lite for creative content
- Example: "With 7.2 deaths per game, you're feeding more than a soup kitchen! 🍲"

### 3️⃣ Hidden Gem Detector Prize
**Achievement**: Discovers surprising patterns
- Time-of-day performance analysis
- Win streak detection
- Role-specific insights
- Example: "You perform 12% better on Saturday evenings!"

### 4️⃣ Chaos Engineering Prize
**Achievement**: Creative personality system
- 6-trait personality profiling
- Celebrity player matching
- Playstyle archetypes
- Example: "The Strategist - Similar to Faker's calculated approach"

---

## 📹 Demo Video

**YouTube**: [Link to be added]

**Duration**: 3 minutes

**Highlights**:
- Full feature walkthrough
- AI model selection explanation
- Cost optimization showcase
- Live demo of all prize features

---

## 📚 Documentation

All detailed documentation, deployment guides, and development notes are available in the `documentation` branch:

```bash
# Switch to documentation branch to view all guides
git checkout documentation
```

**Available Documentation:**
- **Deployment Guides** - AWS deployment, Docker setup, production configuration
- **Optimization Notes** - Performance improvements, cost optimization strategies
- **Development Logs** - Feature enhancements, bug fixes, iterations
- **AWS Monitoring** - Cost tracking, CloudWatch setup, budget alerts

---

## 🌟 Future Enhancements

- [ ] Multi-language support
- [ ] Video highlight generation (AWS MediaConvert)
- [ ] Discord bot integration
- [ ] Team-wide analytics
- [ ] Predictive performance modeling (SageMaker)
- [ ] Mobile app (React Native)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AWS** for providing powerful AI services
- **Riot Games** for the comprehensive League API
- Hackathon organizers and community

## 📧 Contact

For questions or feedback, reach out via [GitHub Issues](https://github.com/yourusername/rift-rewind/issues)

---

Built with ❤️ for the Rift Rewind Hackathon 2025


