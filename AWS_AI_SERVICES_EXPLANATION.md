# AWS AI Services Used in Summoner Rewind

## 🤖 AWS Service: Amazon Bedrock

**Amazon Bedrock** is the core AWS AI service powering all intelligent features in our application. It provides access to multiple foundation models through a single API.

### What is Amazon Bedrock?
Amazon Bedrock is AWS's fully managed service that offers high-performing foundation models from leading AI companies through one unified API. We use it to generate all AI insights, personality analysis, roasts, and recommendations.

---

## 🧠 5 AI Models We Use (All via Amazon Bedrock)

### 1. **Amazon Nova Micro**
- **What it does**: Quick, simple tasks
- **We use it for**: Basic validations, role detection
- **Cost**: Super cheap ($0.035 per million words)

### 2. **Amazon Nova Lite**
- **What it does**: Standard analysis
- **We use it for**: Match summaries, playstyle analysis
- **Cost**: Very cheap ($0.06 per million words)

### 3. **Claude 3 Haiku**
- **What it does**: Balanced, general-purpose analysis
- **We use it for**: Player insights, strategy tips
- **Cost**: Affordable ($0.25 per million words)

### 4. **DeepSeek V3**
- **What it does**: Complex reasoning and patterns
- **We use it for**: Advanced trend analysis, hidden gems
- **Cost**: Moderate ($0.27 per million words)

### 5. **Claude Sonnet 4**
- **What it does**: Creative, nuanced content
- **We use it for**: Funny roasts, personality profiles
- **Cost**: Premium ($3.00 per million words)

---

## 📊 How It Works

```
1. Player enters summoner name
   ↓
2. We fetch their game data from Riot API
   ↓
3. Our backend analyzes the stats
   ↓
4. Amazon Bedrock AI generates insights
   ↓
5. Beautiful dashboard shows results
```

---

## 💡 Smart Model Selection

We automatically pick the right AI model for each task:

- **Simple stuff** → Cheap models (Nova Micro/Lite)
- **Standard analysis** → Balanced models (Claude Haiku)
- **Creative content** → Premium models (Claude Sonnet 4)

This saves **93% on costs** compared to using only the expensive model!

---

## 📈 Data We Analyze

From Riot Games API:
- ✅ Match history (wins, losses, KDA)
- ✅ Ranked stats (tier, LP, win rate)
- ✅ Champion mastery (favorite champions)
- ✅ Challenges (achievements, percentiles)
- ✅ Live game status
- ✅ Timeline data (CS @ 10 min, first blood)

Then Amazon Bedrock AI turns this data into:
- 🎯 Personalized insights
- 😂 Funny roasts
- 💎 Hidden strengths
- 🧠 Personality analysis
- 📊 Performance predictions

---

## 🎯 Why Amazon Bedrock?

1. **Multiple models** - Pick the best tool for each job
2. **Fully managed** - No servers to maintain
3. **Pay per use** - Only pay for what we use
4. **Enterprise-ready** - Secure, scalable, reliable
5. **Easy integration** - Simple API, works with Python

---

## 💰 Cost Efficiency

**Average cost per player analysis**: $0.003 (less than 1 cent!)

By using different models for different tasks, we keep costs low while maintaining high quality.

---

## 🔒 Security

- All API keys secured via AWS IAM
- No player data stored
- Encrypted communications
- Follows AWS best practices

---

**Bottom Line**: Amazon Bedrock gives us access to 5 powerful AI models through one service, letting us deliver smart, personalized gaming insights at minimal cost.
