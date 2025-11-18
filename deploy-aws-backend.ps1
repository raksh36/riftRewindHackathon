# Rift Rewind AWS Backend Deployment Script
# PowerShell version for Windows

$ErrorActionPreference = "Stop"

Write-Host "🚀 Rift Rewind AWS Backend Deployment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$REGION = "us-east-1"
$INSTANCE_TYPE = "t3.small"
$KEY_NAME = "rift-rewind-key"
$SECURITY_GROUP = "rift-rewind-sg"
$BACKEND_PORT = 8000

# Step 1: Check AWS CLI
Write-Host "📋 Step 1: Checking prerequisites..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version
    Write-Host "✅ AWS CLI installed: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}

# Step 2: Check AWS credentials
Write-Host "`n🔐 Step 2: Verifying AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity | ConvertFrom-Json
    Write-Host "✅ Authenticated as: $($identity.Arn)" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS credentials not configured. Run 'aws configure' first." -ForegroundColor Red
    exit 1
}

# Step 3: Check .env file
Write-Host "`n📄 Step 3: Checking .env file..." -ForegroundColor Yellow
if (!(Test-Path "backend\.env")) {
    Write-Host "❌ backend\.env file not found!" -ForegroundColor Red
    Write-Host "   Create it with your RIOT_API_KEY and AWS credentials" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content "backend\.env" -Raw
if ($envContent -match "RIOT_API_KEY=(.+)") {
    Write-Host "✅ RIOT_API_KEY found in .env" -ForegroundColor Green
} else {
    Write-Host "❌ RIOT_API_KEY not found in .env" -ForegroundColor Red
    exit 1
}

# Step 4: Create Security Group
Write-Host "`n🔒 Step 4: Creating/checking security group..." -ForegroundColor Yellow
try {
    $sgExists = aws ec2 describe-security-groups --group-names $SECURITY_GROUP --region $REGION 2>$null | ConvertFrom-Json
    $SECURITY_GROUP_ID = $sgExists.SecurityGroups[0].GroupId
    Write-Host "✅ Security group exists: $SECURITY_GROUP_ID" -ForegroundColor Green
} catch {
    Write-Host "Creating new security group..." -ForegroundColor Yellow
    $sg = aws ec2 create-security-group `
        --group-name $SECURITY_GROUP `
        --description "Rift Rewind Backend" `
        --region $REGION | ConvertFrom-Json
    $SECURITY_GROUP_ID = $sg.GroupId
    
    # Add ingress rules
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $REGION 2>$null
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port $BACKEND_PORT --cidr 0.0.0.0/0 --region $REGION 2>$null
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $REGION 2>$null
    
    Write-Host "✅ Security group created: $SECURITY_GROUP_ID" -ForegroundColor Green
}

# Step 5: Create Key Pair
Write-Host "`n🔑 Step 5: Creating/checking key pair..." -ForegroundColor Yellow
if (!(Test-Path "$KEY_NAME.pem")) {
    try {
        $keyMaterial = aws ec2 create-key-pair --key-name $KEY_NAME --region $REGION --query 'KeyMaterial' --output text
        $keyMaterial | Out-File -FilePath "$KEY_NAME.pem" -Encoding ASCII
        Write-Host "✅ Key pair created: $KEY_NAME.pem" -ForegroundColor Green
        Write-Host "   SAVE THIS FILE! You need it to access your server." -ForegroundColor Yellow
    } catch {
        Write-Host "✅ Key pair already exists in AWS" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Key pair file exists: $KEY_NAME.pem" -ForegroundColor Green
}

# Step 6: Get latest Amazon Linux AMI
Write-Host "`n💿 Step 6: Finding latest Amazon Linux AMI..." -ForegroundColor Yellow
$query = "Images | sort_by(@, ``&CreationDate) | [-1].ImageId"
$AMI_ID = aws ec2 describe-images --owners amazon --filters "Name=name,Values=al2023-ami-*-x86_64" "Name=state,Values=available" --query $query --output text --region $REGION
Write-Host "✅ Using AMI: $AMI_ID" -ForegroundColor Green

# Step 7: Create backend package
Write-Host "`n📦 Step 7: Packaging backend files..." -ForegroundColor Yellow
if (Test-Path "backend-deploy.zip") {
    Remove-Item "backend-deploy.zip" -Force
}
Compress-Archive -Path "backend\*" -DestinationPath "backend-deploy.zip" -Force
Write-Host "✅ Backend packaged: backend-deploy.zip" -ForegroundColor Green

# Step 8: Create user data script
Write-Host "`n📝 Step 8: Creating deployment script..." -ForegroundColor Yellow
$userData = @"
#!/bin/bash
set -e

# Update system
yum update -y

# Install Python 3.11
yum install -y python3.11 python3.11-pip unzip

# Create app directory
mkdir -p /home/ec2-user/backend
cd /home/ec2-user/backend

echo "Waiting for files to be uploaded..."
# Files will be uploaded via SCP after instance is ready
"@

$userDataBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($userData))

# Step 9: Launch EC2 instance
Write-Host "`n🚀 Step 9: Launching EC2 instance..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray

$instanceParams = @{
    ImageId = $AMI_ID
    InstanceType = $INSTANCE_TYPE
    KeyName = $KEY_NAME
    SecurityGroupIds = $SECURITY_GROUP_ID
    UserData = $userDataBase64
    TagSpecifications = "ResourceType=instance,Tags=[{Key=Name,Value=rift-rewind-backend},{Key=rift-rewind-hackathon,Value=2025}]"
}

$instance = aws ec2 run-instances `
    --image-id $AMI_ID `
    --instance-type $INSTANCE_TYPE `
    --key-name $KEY_NAME `
    --security-group-ids $SECURITY_GROUP_ID `
    --user-data $userDataBase64 `
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=rift-rewind-backend},{Key=rift-rewind-hackathon,Value=2025}]" `
    --region $REGION | ConvertFrom-Json

$INSTANCE_ID = $instance.Instances[0].InstanceId
Write-Host "✅ Instance launched: $INSTANCE_ID" -ForegroundColor Green

# Step 10: Wait for instance
Write-Host "`n⏳ Step 10: Waiting for instance to be ready..." -ForegroundColor Yellow
Write-Host "   Status: Starting..." -ForegroundColor Gray

aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Get public IP
$instanceInfo = aws ec2 describe-instances `
    --instance-ids $INSTANCE_ID `
    --region $REGION | ConvertFrom-Json

$PUBLIC_IP = $instanceInfo.Reservations[0].Instances[0].PublicIpAddress
Write-Host "✅ Instance running at: $PUBLIC_IP" -ForegroundColor Green

# Step 11: Wait for SSH to be ready
Write-Host "`n⏳ Step 11: Waiting for SSH to be ready (60 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Step 12: Display manual deployment instructions
Write-Host "`n" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 EC2 Instance Ready!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps - Connect to Your Server:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option A: Use EC2 Instance Connect (Easiest)" -ForegroundColor Green
Write-Host "1. Go to: https://console.aws.amazon.com/ec2" -ForegroundColor White
Write-Host "2. Select your instance: $INSTANCE_ID" -ForegroundColor White
Write-Host "3. Click 'Connect' button" -ForegroundColor White
Write-Host "4. Choose 'EC2 Instance Connect' tab" -ForegroundColor White
Write-Host "5. Click 'Connect'" -ForegroundColor White
Write-Host ""

Write-Host "Then run these commands in the EC2 terminal:" -ForegroundColor Yellow
$ec2SetupInstructions = @"
# Create directory
mkdir -p /home/ec2-user/backend
cd /home/ec2-user/backend

# You'll need to upload the backend-deploy.zip file
# Use the 'Actions' menu in the EC2 console to upload files
# Or use the SCP command below from your local machine
"@
Write-Host $ec2SetupInstructions -ForegroundColor White

Write-Host ""
Write-Host "Option B: Upload files from your local machine" -ForegroundColor Green
Write-Host "Run this in a NEW PowerShell window:" -ForegroundColor Yellow
$scpInstructions = @"
# Convert PEM to PPK if using PuTTY, or use this SCP command:
scp -i "$KEY_NAME.pem" backend-deploy.zip ec2-user@${PUBLIC_IP}:/home/ec2-user/

# Then SSH to the server:
ssh -i "$KEY_NAME.pem" ec2-user@$PUBLIC_IP
"@
Write-Host $scpInstructions -ForegroundColor White

Write-Host ""
Write-Host "Once connected to EC2, run:" -ForegroundColor Yellow
$ec2Instructions = @"
# Unzip files
cd /home/ec2-user
unzip backend-deploy.zip -d backend
cd backend

# Install dependencies
python3.11 -m pip install -r requirements.txt

# Start the server
nohup python3.11 -m uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT > app.log 2>&1 &

# Check it's running
sleep 5
curl http://localhost:$BACKEND_PORT/health
"@
Write-Host $ec2Instructions -ForegroundColor White

Write-Host ""
Write-Host "🌐 Your Backend URLs:" -ForegroundColor Cyan
Write-Host "   API: http://${PUBLIC_IP}:${BACKEND_PORT}" -ForegroundColor White
Write-Host "   Docs: http://${PUBLIC_IP}:${BACKEND_PORT}/docs" -ForegroundColor White
Write-Host "   Health: http://${PUBLIC_IP}:${BACKEND_PORT}/health" -ForegroundColor White
Write-Host ""

Write-Host "💾 Important Info Saved:" -ForegroundColor Cyan
Write-Host "   Instance ID: $INSTANCE_ID" -ForegroundColor White
Write-Host "   Public IP: $PUBLIC_IP" -ForegroundColor White
Write-Host "   Key File: $KEY_NAME.pem" -ForegroundColor White
Write-Host "   Security Group: $SECURITY_GROUP_ID" -ForegroundColor White
Write-Host ""

# Save deployment info
$deploymentInfo = @"
Rift Rewind Backend Deployment Info
====================================
Date: $(Get-Date)
Instance ID: $INSTANCE_ID
Public IP: $PUBLIC_IP
Region: $REGION
Security Group: $SECURITY_GROUP_ID
Key Pair: $KEY_NAME.pem

API Endpoint: http://${PUBLIC_IP}:${BACKEND_PORT}
API Docs: http://${PUBLIC_IP}:${BACKEND_PORT}/docs
Health Check: http://${PUBLIC_IP}:${BACKEND_PORT}/health

SSH Command:
ssh -i $KEY_NAME.pem ec2-user@$PUBLIC_IP

To stop the instance (save money):
aws ec2 stop-instances --instance-ids $INSTANCE_ID --region $REGION

To start the instance again:
aws ec2 start-instances --instance-ids $INSTANCE_ID --region $REGION

To terminate the instance (delete):
aws ec2 terminate-instances --instance-ids $INSTANCE_ID --region $REGION
"@

$deploymentInfo | Out-File -FilePath "deployment-info.txt" -Encoding UTF8
Write-Host "✅ Deployment info saved to: deployment-info.txt" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next: Follow the instructions above to upload and start your backend!" -ForegroundColor Yellow

