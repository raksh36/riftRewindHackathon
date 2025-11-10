#!/bin/bash

# Rift Rewind AWS Deployment Script
# This script automates deployment to AWS

set -e

echo "🚀 Starting Rift Rewind AWS Deployment..."

# Configuration
REGION="us-east-1"
INSTANCE_TYPE="t3.medium"
KEY_NAME="rift-rewind-key"
SECURITY_GROUP="rift-rewind-sg"
TAG_KEY="rift-rewind-hackathon"
TAG_VALUE="2025"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI found${NC}"

# Check environment variables
if [ -z "$RIOT_API_KEY" ]; then
    echo -e "${RED}❌ RIOT_API_KEY not set${NC}"
    exit 1
fi

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo -e "${RED}❌ AWS credentials not set${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Step 1: Create Security Group
echo -e "${YELLOW}📝 Creating security group...${NC}"
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name $SECURITY_GROUP \
    --description "Security group for Rift Rewind" \
    --region $REGION \
    --output text 2>/dev/null || \
    aws ec2 describe-security-groups \
        --group-names $SECURITY_GROUP \
        --region $REGION \
        --query 'SecurityGroups[0].GroupId' \
        --output text)

echo -e "${GREEN}✅ Security group: $SECURITY_GROUP_ID${NC}"

# Add rules to security group
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $REGION 2>/dev/null || true

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region $REGION 2>/dev/null || true

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0 \
    --region $REGION 2>/dev/null || true

# Step 2: Create key pair (if doesn't exist)
echo -e "${YELLOW}🔑 Creating/checking key pair...${NC}"
aws ec2 create-key-pair \
    --key-name $KEY_NAME \
    --query 'KeyMaterial' \
    --output text \
    --region $REGION > ${KEY_NAME}.pem 2>/dev/null || true

if [ -f "${KEY_NAME}.pem" ]; then
    chmod 400 ${KEY_NAME}.pem
    echo -e "${GREEN}✅ Key pair created/exists${NC}"
fi

# Step 3: Launch EC2 instance
echo -e "${YELLOW}🖥️  Launching EC2 instance...${NC}"

# Get latest Amazon Linux 2 AMI
AMI_ID=$(aws ec2 describe-images \
    --owners amazon \
    --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" \
    --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
    --output text \
    --region $REGION)

echo "Using AMI: $AMI_ID"

# Create user data script
cat > user-data.sh << 'EOF'
#!/bin/bash
yum update -y
yum install -y docker git

# Start Docker
service docker start
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone repository (replace with your repo)
cd /home/ec2-user
git clone https://github.com/yourusername/rift-rewind.git
cd rift-rewind

# Create .env file
cat > backend/.env << ENVEOF
RIOT_API_KEY=${RIOT_API_KEY}
AWS_REGION=${AWS_REGION}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENVEOF

# Start services
docker-compose up -d

echo "Deployment complete!"
EOF

# Launch instance
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-group-ids $SECURITY_GROUP_ID \
    --user-data file://user-data.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=$TAG_KEY,Value=$TAG_VALUE},{Key=Name,Value=rift-rewind-server}]" \
    --region $REGION \
    --query 'Instances[0].InstanceId' \
    --output text)

echo -e "${GREEN}✅ Instance launched: $INSTANCE_ID${NC}"

# Wait for instance to be running
echo -e "${YELLOW}⏳ Waiting for instance to be running...${NC}"
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --region $REGION)

echo -e "${GREEN}✅ Instance running at: $PUBLIC_IP${NC}"

# Step 4: Create S3 bucket for frontend
echo -e "${YELLOW}📦 Creating S3 bucket for frontend...${NC}"
BUCKET_NAME="rift-rewind-frontend-$(date +%s)"

aws s3 mb s3://$BUCKET_NAME --region $REGION
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Set bucket policy for public access
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

echo -e "${GREEN}✅ S3 bucket created: $BUCKET_NAME${NC}"

# Step 5: Deploy frontend to S3
echo -e "${YELLOW}📤 Building and deploying frontend...${NC}"
cd frontend
npm install
npm run build
aws s3 sync dist/ s3://$BUCKET_NAME --delete

echo -e "${GREEN}✅ Frontend deployed to S3${NC}"

# Cleanup
rm -f user-data.sh bucket-policy.json

# Print summary
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Backend API: http://$PUBLIC_IP:8000"
echo "Frontend: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""
echo "SSH access: ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP"
echo ""
echo "To set up CloudFront (recommended):"
echo "1. Go to AWS CloudFront console"
echo "2. Create distribution with S3 origin: $BUCKET_NAME"
echo "3. Point domain to CloudFront distribution"
echo ""
echo "Don't forget to tag your resources with:"
echo "  Key: $TAG_KEY"
echo "  Value: $TAG_VALUE"

