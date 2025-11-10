# Simple Backend Deployment to AWS EC2
# Summoner Rewind Backend

Write-Host "Deploying Backend to AWS EC2..." -ForegroundColor Cyan

$APP_NAME = "summoner-rewind-backend"
$REGION = "us-east-1"
$INSTANCE_TYPE = "t3.micro"
$KEY_NAME = "summoner-rewind-key"

# Check AWS CLI
Write-Host "[1/5] Checking AWS CLI..."
$awsCheck = Get-Command aws -ErrorAction SilentlyContinue
if (-not $awsCheck) {
    Write-Host "ERROR: AWS CLI not installed" -ForegroundColor Red
    Write-Host "Install from: https://awscli.amazonaws.com/AWSCLIV2.msi"
    exit 1
}
Write-Host "OK: AWS CLI found" -ForegroundColor Green

# Check credentials
Write-Host "[2/5] Checking AWS credentials..."
$identity = aws sts get-caller-identity 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: AWS not configured. Run: aws configure" -ForegroundColor Red
    exit 1
}
Write-Host "OK: AWS authenticated" -ForegroundColor Green

# Get latest Ubuntu AMI
Write-Host "[3/5] Finding Ubuntu AMI..."
$AMI_ID = "ami-0e2c8caa4b6378d8c"  # Ubuntu 22.04 LTS in us-east-1
Write-Host "OK: Using AMI $AMI_ID" -ForegroundColor Green

# Create/Get security group
Write-Host "[4/5] Setting up security group..."
$sgCheck = aws ec2 describe-security-groups --group-names "$APP_NAME-sg" --region $REGION 2>&1
if ($LASTEXITCODE -eq 0) {
    $SG_JSON = aws ec2 describe-security-groups --group-names "$APP_NAME-sg" --region $REGION
    $SG_OBJ = $SG_JSON | ConvertFrom-Json
    $SG_ID = $SG_OBJ.SecurityGroups[0].GroupId
    Write-Host "OK: Using existing security group $SG_ID" -ForegroundColor Green
} else {
    $SG_JSON = aws ec2 create-security-group --group-name "$APP_NAME-sg" --description "Summoner Rewind Backend" --region $REGION
    $SG_OBJ = $SG_JSON | ConvertFrom-Json
    $SG_ID = $SG_OBJ.GroupId
    
    # Add firewall rules
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $REGION | Out-Null
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 8000 --cidr 0.0.0.0/0 --region $REGION | Out-Null
    Write-Host "OK: Created security group $SG_ID" -ForegroundColor Green
}

# Create key pair if needed
Write-Host "[5/5] Setting up SSH key..."
$keyCheck = aws ec2 describe-key-pairs --key-names $KEY_NAME --region $REGION 2>&1
if ($LASTEXITCODE -ne 0) {
    aws ec2 create-key-pair --key-name $KEY_NAME --region $REGION --query 'KeyMaterial' --output text | Out-File -FilePath "$KEY_NAME.pem" -Encoding ASCII
    Write-Host "OK: Key saved to $KEY_NAME.pem" -ForegroundColor Green
} else {
    Write-Host "OK: Key pair exists" -ForegroundColor Green
}

# Read environment variables
$RIOT_API_KEY = ""
$AWS_KEY_ID = ""
$AWS_SECRET = ""
if (Test-Path "backend\.env") {
    $envLines = Get-Content "backend\.env"
    foreach ($line in $envLines) {
        if ($line -match '^RIOT_API_KEY=(.+)$') {
            $RIOT_API_KEY = $matches[1].Trim()
        }
        if ($line -match '^AWS_ACCESS_KEY_ID=(.+)$') {
            $AWS_KEY_ID = $matches[1].Trim()
        }
        if ($line -match '^AWS_SECRET_ACCESS_KEY=(.+)$') {
            $AWS_SECRET = $matches[1].Trim()
        }
    }
}

# Create simple startup script
$USER_DATA = @"
#!/bin/bash
apt-get update
apt-get install -y python3-pip python3-venv git
mkdir -p /app/backend
cd /app
git clone https://github.com/YOUR_USERNAME/RiftRewindHackathon.git || echo "Clone manually"
cd /app/backend || exit
pip3 install fastapi uvicorn httpx pydantic pydantic-settings python-dotenv boto3
echo "RIOT_API_KEY=$RIOT_API_KEY" > .env
echo "AWS_ACCESS_KEY_ID=$AWS_KEY_ID" >> .env
echo "AWS_SECRET_ACCESS_KEY=$AWS_SECRET" >> .env
echo "AWS_REGION=us-east-1" >> .env
echo "Setup complete - upload your backend files and run: python3 -m uvicorn main:app --host 0.0.0.0 --port 8000"
"@

Write-Host ""
Write-Host "Launching EC2 instance..." -ForegroundColor Cyan
$LAUNCH_JSON = aws ec2 run-instances `
    --image-id $AMI_ID `
    --instance-type $INSTANCE_TYPE `
    --key-name $KEY_NAME `
    --security-group-ids $SG_ID `
    --user-data $USER_DATA `
    --region $REGION `
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$APP_NAME}]"

$LAUNCH_OBJ = $LAUNCH_JSON | ConvertFrom-Json
$INSTANCE_ID = $LAUNCH_OBJ.Instances[0].InstanceId

Write-Host "Instance launched: $INSTANCE_ID" -ForegroundColor Green
Write-Host "Waiting for instance to start (this takes 1-2 minutes)..." -ForegroundColor Yellow

aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

$DESC_JSON = aws ec2 describe-instances --instance-ids $INSTANCE_ID --region $REGION
$DESC_OBJ = $DESC_JSON | ConvertFrom-Json
$PUBLIC_IP = $DESC_OBJ.Reservations[0].Instances[0].PublicIpAddress

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Backend Deployed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Instance ID: $INSTANCE_ID"
Write-Host "Public IP: $PUBLIC_IP" -ForegroundColor Cyan
Write-Host "Region: $REGION"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait 2 minutes for setup to complete"
Write-Host "2. Upload backend files:"
Write-Host "   scp -i $KEY_NAME.pem -r backend ubuntu@${PUBLIC_IP}:/app/" -ForegroundColor Gray
Write-Host "3. SSH and start server:"
Write-Host "   ssh -i $KEY_NAME.pem ubuntu@$PUBLIC_IP" -ForegroundColor Gray
Write-Host "   cd /app/backend" -ForegroundColor Gray
Write-Host "   python3 -m uvicorn main:app --host 0.0.0.0 --port 8000" -ForegroundColor Gray
Write-Host ""
Write-Host "Backend URL: http://${PUBLIC_IP}:8000" -ForegroundColor Cyan
Write-Host ""

"Instance ID: $INSTANCE_ID
Public IP: $PUBLIC_IP
Backend URL: http://${PUBLIC_IP}:8000
SSH: ssh -i $KEY_NAME.pem ubuntu@$PUBLIC_IP
" | Out-File "backend-aws-info.txt"

Write-Host "Info saved to: backend-aws-info.txt" -ForegroundColor Green


