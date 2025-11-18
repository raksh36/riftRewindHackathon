# Simple AWS Backend Deployment Guide
## Step-by-Step Manual Deployment (20 minutes)

### Prerequisites
- ✅ AWS CLI installed and configured
- ✅ backend/.env file with RIOT_API_KEY and AWS credentials

---

## Step 1: Package Backend (2 minutes)

Run in PowerShell:
```powershell
cd C:\Users\raksh\OneDrive\Desktop\RiftRewindHackathon
Compress-Archive -Path backend\* -DestinationPath backend-deploy.zip -Force
```

**Result**: `backend-deploy.zip` file created

---

## Step 2: Create Security Group (1 minute)

```powershell
aws ec2 create-security-group --group-name rift-rewind-sg --description "Rift Rewind Backend" --region us-east-1

# Add firewall rules
aws ec2 authorize-security-group-ingress --group-name rift-rewind-sg --protocol tcp --port 22 --cidr 0.0.0.0/0 --region us-east-1
aws ec2 authorize-security-group-ingress --group-name rift-rewind-sg --protocol tcp --port 8000 --cidr 0.0.0.0/0 --region us-east-1
aws ec2 authorize-security-group-ingress --group-name rift-rewind-sg --protocol tcp --port 80 --cidr 0.0.0.0/0 --region us-east-1
```

**(If group already exists, that's fine - skip to next step)**

---

## Step 3: Launch EC2 Instance via Console (5 minutes)

### Option A: Quick Launch (Use this)

1. **Go to EC2 Console**: https://console.aws.amazon.com/ec2
2. **Click "Launch Instance"**
3. **Configure**:
   - **Name**: `rift-rewind-backend`
   - **OS Image**: Amazon Linux 2023 AMI (default)
   - **Instance type**: t3.small (or t2.micro for free tier)
   - **Key pair**: 
     - Click "Create new key pair"
     - Name: `rift-rewind-key`
     - Type: RSA
     - Format: .pem
     - **SAVE THE DOWNLOADED .pem FILE!**
   - **Network settings**:
     - Select existing security group: `rift-rewind-sg`
   - **Storage**: 8 GB (default)

4. **Click "Launch instance"**
5. **Wait** ~2 minutes for "Instance state" = "Running"
6. **Copy the "Public IPv4 address"** (e.g., 44.201.123.45)

**Write your EC2 IP here**: _________________________________

---

## Step 4: Connect to EC2 (2 minutes)

### Easiest Way: EC2 Instance Connect

1. In EC2 console, select your instance
2. Click "Connect" button
3. Choose "EC2 Instance Connect" tab
4. Click "Connect" → Opens browser terminal

**You're now in your EC2 server!**

---

## Step 5: Upload Backend Files (3 minutes)

### Method A: File Upload in Browser (Easiest)

In the EC2 Instance Connect window:

1. **Click "Actions" → "Upload file"**
2. **Select** `backend-deploy.zip` from your computer
3. **Wait** for upload to complete

### Method B: SCP from Local Machine

In a NEW PowerShell window on your computer:
```powershell
cd C:\Users\raksh\OneDrive\Desktop\RiftRewindHackathon
scp -i rift-rewind-key.pem backend-deploy.zip ec2-user@YOUR_EC2_IP:/home/ec2-user/
```
(Replace `YOUR_EC2_IP` with the IP you copied)

---

## Step 6: Setup Backend on EC2 (5 minutes)

In the EC2 terminal, run **each command** one at a time:

```bash
# 1. Install Python 3.11
sudo yum install -y python3.11 python3.11-pip unzip
python3.11 --version

# 2. Unzip backend files
cd /home/ec2-user
unzip backend-deploy.zip -d backend
cd backend
ls -la

# 3. Create .env file
nano .env
```

**In the nano editor, paste your .env content**:
```
RIOT_API_KEY=RGAPI-1d6837f2-6d29-401d-91c6-9aa28f03aabe
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_key_id
AWS_SECRET_ACCESS_KEY=your_actual_secret_key
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

```bash
# 4. Install Python dependencies (takes ~2 minutes)
python3.11 -m pip install -r requirements.txt

# 5. Start the backend server
nohup python3.11 -m uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &

# 6. Wait a moment and check it's running
sleep 5
curl http://localhost:8000/health
```

**Expected response**:
```json
{"status":"healthy","timestamp":"..."}
```

**If you see this, SUCCESS!** 🎉

---

## Step 7: Test from Your Computer (2 minutes)

On your local machine, open browser and test:

1. **Health Check**: 
   - http://YOUR_EC2_IP:8000/health
   - Should see `{"status":"healthy"}`

2. **API Docs**: 
   - http://YOUR_EC2_IP:8000/docs
   - Should see FastAPI Swagger UI

3. **Test API Call** (in PowerShell):
```powershell
$body = '{"region":"na1","summonerName":"Jojopyun#NA1","matchCount":5}'
$response = Invoke-RestMethod -Uri "http://YOUR_EC2_IP:8000/api/roast" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 60
$response.roast.roasts
```

**If you get roasts back, YOUR BACKEND IS LIVE!** 🚀

---

## Step 8: Update Frontend to Use AWS Backend (3 minutes)

On your local machine:

1. **Edit** `frontend/.env`:
```
VITE_API_URL=http://YOUR_EC2_IP:8000
```

2. **Save the file**

3. **Restart frontend**:
```powershell
cd C:\Users\raksh\OneDrive\Desktop\RiftRewindHackathon\frontend
# Stop current frontend (Ctrl+C in its terminal)
npm run dev
```

4. **Test**: Open http://localhost:5174 and search for a player

---

## 📝 Save This Info

**Backend Deployment**:
- EC2 IP: _________________________________
- API URL: http://_______________:8000
- Docs URL: http://_______________:8000/docs

**To view backend logs**:
```bash
ssh -i rift-rewind-key.pem ec2-user@YOUR_EC2_IP
tail -f /home/ec2-user/backend/app.log
```

**To restart backend**:
```bash
pkill -f uvicorn
cd /home/ec2-user/backend
nohup python3.11 -m uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &
```

**To stop EC2 instance** (save money):
```powershell
aws ec2 describe-instances --filters "Name=tag:Name,Values=rift-rewind-backend" --query 'Reservations[0].Instances[0].InstanceId' --output text --region us-east-1

# Use the instance ID from above:
aws ec2 stop-instances --instance-ids i-xxxxxxxxx --region us-east-1
```

---

## ✅ Success Checklist

- [ ] EC2 instance running
- [ ] Backend returns health check
- [ ] API docs load in browser
- [ ] Can generate roasts via API
- [ ] Frontend connects to AWS backend
- [ ] Can search for players from frontend

---

## 🆘 Troubleshooting

**Health check returns nothing**:
- Check backend is running: `ps aux | grep uvicorn`
- Check logs: `tail -f /home/ec2-user/backend/app.log`
- Restart backend (see commands above)

**"Connection timed out"**:
- Verify security group has port 8000 open
- Check EC2 instance is "Running"
- Try accessing from EC2 terminal first: `curl http://localhost:8000/health`

**AI features not working**:
- Verify .env has correct AWS credentials
- Check AWS Bedrock is enabled in your account
- Try accessing different models (see model_selector.py)

---

## 🎯 Next Steps

Once backend is working on AWS:
1. ✅ Test all endpoints thoroughly
2. ✅ Update frontend to use AWS backend URL
3. ✅ Test the full application end-to-end
4. ✅ Record demo video
5. ✅ Submit to hackathon!

**You've got this!** 🚀

