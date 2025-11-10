# AWS Deployment Script for Windows (PowerShell)
# Rift Rewind - Hackathon Submission

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Rift Rewind AWS Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$APP_NAME = "rift-rewind"
$REGION = "us-east-1"
$INSTANCE_TYPE = "t3.small"
$FRONTEND_BUCKET = "$APP_NAME-frontend-$(Get-Date -Format 'yyyyMMdd')"

# Check for AWS CLI
Write-Host "[1/10] Checking AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✓ AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI not found. Installing..." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install AWS CLI:" -ForegroundColor Yellow
    Write-Host "1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor White
    Write-Host "2. Run the installer" -ForegroundColor White
    Write-Host "3. Restart PowerShell and run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "OR use AWS Console Manual Deployment (see MANUAL_DEPLOY.md)" -ForegroundColor Cyan
    exit 1
}

# Check AWS credentials
Write-Host "[2/10] Checking AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "✓ Authenticated as: $($identity.Arn)" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS credentials not configured" -ForegroundColor Red
    Write-Host "Run: aws configure" -ForegroundColor Yellow
    exit 1
}

# Read backend .env for Riot API key
Write-Host "[3/10] Reading environment variables..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    $envContent = Get-Content "backend\.env" -Raw
    if ($envContent -match 'RIOT_API_KEY=([^\r\n]+)') {
        $RIOT_API_KEY = $matches[1]
        Write-Host "✓ Riot API key found" -ForegroundColor Green
    } else {
        Write-Host "✗ RIOT_API_KEY not found in backend/.env" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ backend/.env not found" -ForegroundColor Red
    exit 1
}

# Build frontend
Write-Host "[4/10] Building frontend..." -ForegroundColor Yellow
Set-Location frontend
if (!(Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend built successfully" -ForegroundColor Green
Set-Location ..

# Create S3 bucket for frontend
Write-Host "[5/10] Creating S3 bucket..." -ForegroundColor Yellow
try {
    aws s3 mb s3://$FRONTEND_BUCKET --region $REGION 2>&1 | Out-Null
    Write-Host "✓ S3 bucket created: $FRONTEND_BUCKET" -ForegroundColor Green
} catch {
    Write-Host "⚠ Bucket might already exist, continuing..." -ForegroundColor Yellow
}

# Configure S3 bucket for static website hosting
Write-Host "[6/10] Configuring S3 for static hosting..." -ForegroundColor Yellow
aws s3 website s3://$FRONTEND_BUCKET --index-document index.html --error-document index.html

# Upload frontend to S3
Write-Host "[7/10] Uploading frontend to S3..." -ForegroundColor Yellow
aws s3 sync frontend/dist/ s3://$FRONTEND_BUCKET --delete --acl public-read
Write-Host "✓ Frontend uploaded" -ForegroundColor Green

# Get S3 website URL
$FRONTEND_URL = "http://$FRONTEND_BUCKET.s3-website-$REGION.amazonaws.com"
Write-Host "✓ Frontend URL: $FRONTEND_URL" -ForegroundColor Green

# Create EC2 Security Group
Write-Host "[8/10] Setting up EC2 security group..." -ForegroundColor Yellow
try {
    $SG_ID = aws ec2 create-security-group `
        --group-name "$APP_NAME-sg" `
        --description "Security group for $APP_NAME" `
        --output text 2>&1
    
    # Allow HTTP (8000), SSH (22)
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 8000 --cidr 0.0.0.0/0 2>&1 | Out-Null
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 2>&1 | Out-Null
    
    Write-Host "✓ Security group created: $SG_ID" -ForegroundColor Green
} catch {
    Write-Host "⚠ Security group might already exist, looking it up..." -ForegroundColor Yellow
    $SG_ID = aws ec2 describe-security-groups --group-names "$APP_NAME-sg" --query 'SecurityGroups[0].GroupId' --output text
}

# Create user data script for EC2
$USER_DATA = @"
#!/bin/bash
set -e

# Update system
yum update -y

# Install Python 3.11
yum install -y python3.11 python3.11-pip git

# Clone repository (replace with your repo)
cd /home/ec2-user
git clone https://github.com/yourusername/$APP_NAME.git || echo "Using manual upload"
cd $APP_NAME/backend

# Create .env file
cat > .env << EOL
RIOT_API_KEY=$RIOT_API_KEY
AWS_REGION=$REGION
EOL

# Install Python dependencies
python3.11 -m pip install -r requirements.txt

# Start FastAPI with nohup
nohup python3.11 -m uvicorn main:app --host 0.0.0.0 --port 8000 > /var/log/rift-rewind.log 2>&1 &

echo "Deployment complete!"
"@

# Save user data to file
$USER_DATA | Out-File -FilePath "user-data.sh" -Encoding ASCII

Write-Host "[9/10] Launching EC2 instance..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠ IMPORTANT: EC2 deployment requires:" -ForegroundColor Yellow
Write-Host "  1. An EC2 key pair (for SSH access)" -ForegroundColor White
Write-Host "  2. Your code pushed to a GitHub repository" -ForegroundColor White
Write-Host ""
Write-Host "Since this is a hackathon with time constraints," -ForegroundColor Cyan
Write-Host "I recommend using the MANUAL deployment guide instead." -ForegroundColor Cyan
Write-Host ""

# Output summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend (S3):" -ForegroundColor Yellow
Write-Host "  URL: $FRONTEND_URL" -ForegroundColor White
Write-Host "  Bucket: $FRONTEND_BUCKET" -ForegroundColor White
Write-Host ""
Write-Host "Backend (EC2):" -ForegroundColor Yellow
Write-Host "  Status: Pending manual deployment" -ForegroundColor White
Write-Host "  See: MANUAL_DEPLOY.md for EC2 setup" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Update frontend/.env with backend URL" -ForegroundColor White
Write-Host "  2. Rebuild and re-upload frontend" -ForegroundColor White
Write-Host "  3. Test the application" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Save deployment info
$deploymentInfo = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    frontend_url = $FRONTEND_URL
    frontend_bucket = $FRONTEND_BUCKET
    region = $REGION
    security_group = $SG_ID
} | ConvertTo-Json

$deploymentInfo | Out-File -FilePath "deployment-info.json"
Write-Host "✓ Deployment info saved to deployment-info.json" -ForegroundColor Green

