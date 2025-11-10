# Deploy Summoner Rewind Frontend to GitHub Pages
# Backend must be deployed separately (Railway, Render, or AWS)

Write-Host "🎮 Deploying Summoner Rewind to GitHub Pages..." -ForegroundColor Cyan

# 1. Build frontend for production
Write-Host "`n📦 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build

# 2. Go back to root
Set-Location ..

# 3. Create gh-pages branch if it doesn't exist
Write-Host "`n🌿 Setting up gh-pages branch..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
git checkout gh-pages 2>$null
if ($LASTEXITCODE -ne 0) {
    git checkout --orphan gh-pages
    git rm -rf .
}

# 4. Copy build files from frontend/dist
Write-Host "`n📋 Copying build files..." -ForegroundColor Yellow
Copy-Item -Path "frontend/dist/*" -Destination "." -Recurse -Force

# 5. Create .nojekyll file (important for Vite apps)
New-Item -Path ".nojekyll" -ItemType File -Force | Out-Null

# 6. Create GitHub Pages config
Write-Host "`n⚙️  Creating GitHub Pages config..." -ForegroundColor Yellow

# 7. Commit and push
Write-Host "`n🚀 Pushing to GitHub Pages..." -ForegroundColor Yellow
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages -f

# 8. Switch back to main branch
git checkout $currentBranch

Write-Host "`n✅ Frontend deployed to GitHub Pages!" -ForegroundColor Green
Write-Host "`nYour site will be available at:" -ForegroundColor Cyan
Write-Host "https://YOUR_USERNAME.github.io/RiftRewindHackathon/" -ForegroundColor White
Write-Host "`n⚠️  IMPORTANT: You still need to deploy the backend!" -ForegroundColor Red
Write-Host "`nBackend deployment options:" -ForegroundColor Yellow
Write-Host "  1. Railway (Recommended): https://railway.app" -ForegroundColor White
Write-Host "     - Sign in with GitHub" -ForegroundColor Gray
Write-Host "     - Deploy from repo" -ForegroundColor Gray
Write-Host "     - Free tier available" -ForegroundColor Gray
Write-Host "`n  2. Render: https://render.com" -ForegroundColor White
Write-Host "     - Free tier available" -ForegroundColor Gray
Write-Host "`n  3. AWS EC2: Your existing AWS account" -ForegroundColor White
Write-Host "`nAfter deploying backend, create frontend/.env.production with:" -ForegroundColor Yellow
Write-Host "VITE_API_URL=https://your-backend-url.com" -ForegroundColor Gray


