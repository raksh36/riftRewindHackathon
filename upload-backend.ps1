# Quick Backend Upload Script
# Run this AFTER creating EC2 instance

# Replace with your EC2 Public IP from AWS Console
$EC2_IP = Read-Host "Enter your EC2 Public IP address"

Write-Host "Moving key file from Downloads..." -ForegroundColor Cyan
if (Test-Path "$env:USERPROFILE\Downloads\summoner-rewind-key.pem") {
    Move-Item -Path "$env:USERPROFILE\Downloads\summoner-rewind-key.pem" -Destination "." -Force
    Write-Host "✓ Key moved to current directory" -ForegroundColor Green
} elseif (Test-Path "summoner-rewind-key.pem") {
    Write-Host "✓ Key already exists" -ForegroundColor Green
} else {
    Write-Host "⚠ Key not found. Make sure you downloaded it!" -ForegroundColor Yellow
    Write-Host "Place summoner-rewind-key.pem in: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "Uploading backend files to EC2..." -ForegroundColor Cyan
scp -i summoner-rewind-key.pem -r backend ubuntu@${EC2_IP}:/home/ubuntu/app/

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "  ✅ Upload Complete!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now SSH into your server:" -ForegroundColor Yellow
    Write-Host "ssh -i summoner-rewind-key.pem ubuntu@$EC2_IP" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then run these commands:" -ForegroundColor Yellow
    Write-Host "cd /home/ubuntu/app/backend" -ForegroundColor Cyan
    Write-Host "pip3 install -r requirements.txt" -ForegroundColor Cyan
    Write-Host "python3 -m uvicorn main:app --host 0.0.0.0 --port 8000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your Backend URL: http://${EC2_IP}:8000" -ForegroundColor Green
    Write-Host ""
    
    # Save for reference
    "Backend URL: http://${EC2_IP}:8000
SSH: ssh -i summoner-rewind-key.pem ubuntu@$EC2_IP
Health: http://${EC2_IP}:8000/health
API Docs: http://${EC2_IP}:8000/docs
" | Out-File "backend-url.txt"
    
    Write-Host "Info saved to: backend-url.txt" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Upload failed! Check:" -ForegroundColor Red
    Write-Host "1. EC2 IP address is correct" -ForegroundColor Yellow
    Write-Host "2. Security group allows SSH (port 22)" -ForegroundColor Yellow
    Write-Host "3. Key file permissions (see DEPLOY_BACKEND_STEPS.md)" -ForegroundColor Yellow
}

