#!/bin/bash

# Deploy Summoner Rewind Frontend to GitHub Pages
# Backend must be deployed separately (Railway, Render, or AWS)

echo "🎮 Deploying Summoner Rewind to GitHub Pages..."

# 1. Build frontend for production
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

# 2. Create GitHub Pages branch
echo "🌿 Setting up gh-pages branch..."
cd ..
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# 3. Copy build files to root
echo "📋 Copying build files..."
cp -r frontend/dist/* .

# 4. Create .nojekyll file (important for Vite apps)
touch .nojekyll

# 5. Add CNAME if you have custom domain (optional)
# echo "your-domain.com" > CNAME

# 6. Commit and push
echo "🚀 Pushing to GitHub Pages..."
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

echo ""
echo "✅ Frontend deployed to GitHub Pages!"
echo ""
echo "⚠️  IMPORTANT: You still need to deploy the backend!"
echo ""
echo "Backend options:"
echo "  1. Railway: https://railway.app (Free tier, easy)"
echo "  2. Render: https://render.com (Free tier)"
echo "  3. AWS EC2: Your existing AWS account"
echo ""
echo "After deploying backend, update VITE_API_URL in frontend/.env.production"


