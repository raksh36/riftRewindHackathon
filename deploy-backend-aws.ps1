# Deploy Backend Only to AWS EC2
# Summoner Rewind - Hackathon Backend Deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy Backend to AWS EC2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$APP_NAME = "summoner-rewind-backend"
$REGION = "us-east-1"
$INSTANCE_TYPE = "t3.micro"  # Free tier eligible
$KEY_NAME = "summoner-rewind-key"

# Check AWS CLI
Write-Host "[1/6] Checking AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✓ AWS CLI found" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI not found" -ForegroundColor Red
    Write-Host "Install from: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
    exit 1
}

# Check credentials
Write-Host "[2/6] Checking AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "✓ Authenticated as: $($identity.Arn)" -ForegroundColor Green
} catch {
    Write-Host "✗ Not authenticated. Run: aws configure" -ForegroundColor Red
    exit 1
}

# Get latest Ubuntu AMI
Write-Host "[3/6] Finding Ubuntu AMI..." -ForegroundColor Yellow
$AMI_ID = aws ec2 describe-images `
    --owners 099720109477 `
    --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" `
    --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' `
    --output text `
    --region $REGION

Write-Host "✓ Using AMI: $AMI_ID" -ForegroundColor Green

# Create security group
Write-Host "[4/6] Creating security group..." -ForegroundColor Yellow
try {
    $SG_ID = aws ec2 create-security-group `
        --group-name "$APP_NAME-sg" `
        --description "Security group for Summoner Rewind backend" `
        --region $REGION `
        --query 'GroupId' `
        --output text 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        # Security group might already exist
        $SG_ID = aws ec2 describe-security-groups `
            --group-names "$APP_NAME-sg" `
            --region $REGION `
            --query 'SecurityGroups[0].GroupId' `
            --output text 2>&1
        Write-Host "✓ Using existing security group: $SG_ID" -ForegroundColor Green
    } else {
        Write-Host "✓ Created security group: $SG_ID" -ForegroundColor Green
        
        # Add rules
        aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $REGION | Out-Null
        aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 8000 --cidr 0.0.0.0/0 --region $REGION | Out-Null
        aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $REGION | Out-Null
        aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $REGION | Out-Null
        Write-Host "✓ Security group rules added" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Security group creation failed" -ForegroundColor Red
    exit 1
}

# Create key pair if doesn't exist
Write-Host "[5/6] Checking SSH key pair..." -ForegroundColor Yellow
$keyExists = aws ec2 describe-key-pairs --key-names $KEY_NAME --region $REGION 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating new key pair..." -ForegroundColor Yellow
    aws ec2 create-key-pair --key-name $KEY_NAME --region $REGION --query 'KeyMaterial' --output text | Out-File -FilePath "$KEY_NAME.pem" -Encoding ASCII
    Write-Host "✓ Key pair saved to: $KEY_NAME.pem" -ForegroundColor Green
} else {
    Write-Host "✓ Key pair exists" -ForegroundColor Green
}

# Read environment variables
Write-Host "[6/6] Reading environment variables..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    $envContent = Get-Content "backend\.env" -Raw
    if ($envContent -match 'RIOT_API_KEY=([^\r\n]+)') {
        $RIOT_API_KEY = $matches[1].Trim()
        Write-Host "✓ Riot API key found" -ForegroundColor Green
    }
    if ($envContent -match 'AWS_ACCESS_KEY_ID=([^\r\n]+)') {
        $AWS_KEY_ID = $matches[1].Trim()
        Write-Host "✓ AWS Access Key found" -ForegroundColor Green
    }
    if ($envContent -match 'AWS_SECRET_ACCESS_KEY=([^\r\n]+)') {
        $AWS_SECRET = $matches[1].Trim()
        Write-Host "✓ AWS Secret Key found" -ForegroundColor Green
    }
    if ($envContent -match 'AWS_REGION=([^\r\n]+)') {
        $AWS_BEDROCK_REGION = $matches[1].Trim()
    } else {
        $AWS_BEDROCK_REGION = "us-east-1"
    }
    Write-Host "✓ Environment variables loaded" -ForegroundColor Green
} else {
    Write-Host "✗ backend/.env not found" -ForegroundColor Red
    exit 1
}

# Create user data script
$USER_DATA = @"
#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Python 3.11
apt-get install -y python3.11 python3.11-venv python3-pip git

# Create app directory
mkdir -p /app
cd /app

# Clone or copy application (for now, we'll set it up manually)
# You'll need to either git clone or scp your files

# For now, create placeholder structure
mkdir -p /app/backend

# Install Python dependencies
cat > /app/backend/requirements.txt <<'REQUIREMENTS'
fastapi>=0.104.0
uvicorn>=0.24.0
httpx>=0.25.0
pydantic>=2.4.0
pydantic-settings>=2.0.0
python-dotenv>=1.0.0
boto3>=1.28.0
REQUIREMENTS

pip3 install -r /app/backend/requirements.txt

# Create environment file
cat > /app/backend/.env <<'ENV'
RIOT_API_KEY=$RIOT_API_KEY
AWS_ACCESS_KEY_ID=$AWS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET
AWS_REGION=$AWS_BEDROCK_REGION
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
ENV

# Create systemd service
cat > /etc/systemd/system/summoner-rewind.service <<'SERVICE'
[Unit]
Description=Summoner Rewind Backend API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/app/backend
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

# Note: User needs to upload backend files manually
echo "EC2 instance setup complete!"
echo "Next steps:"
echo "1. Upload backend files to /app/backend/"
echo "2. Start service: sudo systemctl start summoner-rewind"
echo "3. Enable on boot: sudo systemctl enable summoner-rewind"
"@

# Launch EC2 instance
Write-Host ""
Write-Host "Launching EC2 instance..." -ForegroundColor Cyan
$INSTANCE_ID = aws ec2 run-instances `
    --image-id $AMI_ID `
    --instance-type $INSTANCE_TYPE `
    --key-name $KEY_NAME `
    --security-group-ids $SG_ID `
    --user-data $USER_DATA `
    --region $REGION `
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$APP_NAME},{Key=Project,Value=RiftRewind},{Key=rift-rewind-hackathon,Value=2025}]" `
    --query 'Instances[0].InstanceId' `
    --output text

Write-Host "✓ Instance launched: $INSTANCE_ID" -ForegroundColor Green

# Wait for instance to be running
Write-Host "Waiting for instance to start..." -ForegroundColor Yellow
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Get public IP
$PUBLIC_IP = aws ec2 describe-instances `
    --instance-ids $INSTANCE_ID `
    --region $REGION `
    --query 'Reservations[0].Instances[0].PublicIpAddress' `
    --output text

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ EC2 Instance Created!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Instance ID: $INSTANCE_ID" -ForegroundColor Cyan
Write-Host "Public IP: $PUBLIC_IP" -ForegroundColor Cyan
Write-Host "Region: $REGION" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Wait 2-3 minutes for instance to fully initialize" -ForegroundColor White
Write-Host ""
Write-Host "2. Upload backend files:" -ForegroundColor White
Write-Host "   scp -i $KEY_NAME.pem -r backend ubuntu@${PUBLIC_IP}:/app/" -ForegroundColor Gray
Write-Host ""
Write-Host "3. SSH into instance:" -ForegroundColor White
Write-Host "   ssh -i $KEY_NAME.pem ubuntu@$PUBLIC_IP" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start the service:" -ForegroundColor White
Write-Host "   sudo systemctl start summoner-rewind" -ForegroundColor Gray
Write-Host "   sudo systemctl enable summoner-rewind" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Check status:" -ForegroundColor White
Write-Host "   sudo systemctl status summoner-rewind" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Test the API:" -ForegroundColor White
Write-Host "   curl http://${PUBLIC_IP}:8000/health" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backend API URL: http://${PUBLIC_IP}:8000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Remember to update frontend/.env.production with:" -ForegroundColor Yellow
Write-Host "VITE_API_URL=http://${PUBLIC_IP}:8000" -ForegroundColor White
Write-Host ""

# Save details to file
@"
Backend Deployment Details
==========================

Instance ID: $INSTANCE_ID
Public IP: $PUBLIC_IP
Region: $REGION
Security Group: $SG_ID
Key Pair: $KEY_NAME.pem

API Endpoints:
- Health: http://${PUBLIC_IP}:8000/health
- Player: http://${PUBLIC_IP}:8000/api/player/{region}/{summoner}
- Demo: http://${PUBLIC_IP}:8000/api/demo/player

SSH Command:
ssh -i $KEY_NAME.pem ubuntu@$PUBLIC_IP

Frontend Environment Variable:
VITE_API_URL=http://${PUBLIC_IP}:8000
"@ | Out-File -FilePath "backend-deployment-info.txt" -Encoding UTF8

Write-Host "Deployment details saved to: backend-deployment-info.txt" -ForegroundColor Green
Write-Host ""


