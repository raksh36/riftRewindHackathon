# 🚀 Deploy to GitHub Pages

## ⚠️ Important Understanding

**GitHub Pages = Static Sites Only (HTML/CSS/JS)**

Your app has TWO parts:
1. **Frontend** (React) → ✅ Can deploy to GitHub Pages
2. **Backend** (FastAPI) → ❌ Needs a server (Railway/Render/AWS)

---

## 📋 Step-by-Step Deployment

### Step 1: Deploy Frontend to GitHub Pages

**Option A: Automated Script (Windows)**
```powershell
.\deploy-github-pages.ps1
```

**Option B: Manual Steps**

1. **Build frontend:**
```powershell
cd frontend
npm install
npm run build
cd ..
```

2. **Enable GitHub Pages:**
   - Go to your GitHub repository
   - Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` → `/` (root)
   - Save

3. **Push to gh-pages branch:**
```powershell
# Create gh-pages branch
git checkout --orphan gh-pages

# Copy build files
Copy-Item -Path "frontend/dist/*" -Destination "." -Recurse -Force

# Create .nojekyll (important!)
New-Item -Path ".nojekyll" -ItemType File -Force

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages -f

# Go back to main
git checkout main
```

4. **Your frontend will be live at:**
```
https://YOUR_GITHUB_USERNAME.github.io/RiftRewindHackathon/
```

---

### Step 2: Deploy Backend

**⚠️ Backend MUST be deployed to a server!**

#### Option 1: Railway (Recommended - Free Tier)

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `RiftRewindHackathon`
5. Railway will auto-detect Python/FastAPI
6. Add environment variables:
   - `RIOT_API_KEY` = your key
   - `AWS_ACCESS_KEY_ID` = your AWS key
   - `AWS_SECRET_ACCESS_KEY` = your AWS secret
   - `AWS_REGION` = us-east-1
7. Deploy! You'll get a URL like: `https://your-app.railway.app`

#### Option 2: Render (Free Tier)

1. Go to https://render.com
2. Sign in with GitHub
3. "New" → "Web Service"
4. Connect your repository
5. Settings:
   - **Name**: summoner-rewind-api
   - **Root Directory**: `backend`
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (same as Railway)
7. Deploy! URL: `https://summoner-rewind-api.onrender.com`

#### Option 3: AWS EC2 (You already have AWS)

Use the existing `deploy-aws.ps1` script:
```powershell
.\deploy-aws.ps1
```

---

### Step 3: Connect Frontend to Backend

1. **Create production environment file:**

```powershell
# Create frontend/.env.production
@"
VITE_API_URL=https://your-backend-url.com
"@ | Out-File -FilePath frontend/.env.production -Encoding utf8
```

2. **Replace with your actual backend URL:**
   - Railway: `https://your-app.railway.app`
   - Render: `https://summoner-rewind-api.onrender.com`
   - AWS: `http://your-ec2-ip:8000`

3. **Rebuild and redeploy frontend:**
```powershell
cd frontend
npm run build
cd ..
git checkout gh-pages
Copy-Item -Path "frontend/dist/*" -Destination "." -Recurse -Force
git add .
git commit -m "Update API URL"
git push origin gh-pages -f
git checkout main
```

---

## ✅ Verification

1. **Frontend**: Visit `https://YOUR_USERNAME.github.io/RiftRewindHackathon/`
2. **Backend**: Visit `https://your-backend-url.com/health`

Should see:
```json
{"status":"healthy","services":{"riot_api":"configured","aws_bedrock":"configured"}}
```

---

## 🎯 For Hackathon Submission

**Public URL to provide:**

```
Frontend: https://YOUR_USERNAME.github.io/RiftRewindHackathon/
Backend API: https://your-backend-url.com
GitHub Repo: https://github.com/YOUR_USERNAME/RiftRewindHackathon
```

---

## 🐛 Troubleshooting

**Issue**: Blank page on GitHub Pages
- **Fix**: Make sure you created `.nojekyll` file
- **Fix**: Check `vite.config.js` has correct `base` path

**Issue**: API calls failing
- **Fix**: Check `frontend/.env.production` has correct `VITE_API_URL`
- **Fix**: Ensure backend is running (check /health endpoint)
- **Fix**: Enable CORS in backend if needed

**Issue**: 404 errors on page refresh
- **Fix**: GitHub Pages doesn't support SPA routing natively
- **Solution**: Add a 404.html that redirects to index.html

---

## 💡 Quick Deploy Commands

```powershell
# Full deployment (run these in order)

# 1. Deploy backend to Railway/Render (manual, get URL)

# 2. Update frontend with backend URL
"VITE_API_URL=https://your-backend-url.com" | Out-File frontend/.env.production

# 3. Deploy frontend to GitHub Pages
.\deploy-github-pages.ps1

# Done! 🎉
```

---

## 📝 Alternative: All-in-One AWS Deploy

If you want everything on AWS:

```powershell
.\deploy-aws.ps1
```

This deploys:
- Backend → AWS EC2
- Frontend → AWS S3 + CloudFront
- Everything in one place!

---

**Need help? The backend deployment is the only manual step!**


