# 🚀 Deploy Backend to AWS - Quick Steps

## Step 1: Launch EC2 Instance (3 minutes)

1. **Open AWS Console**: https://console.aws.amazon.com/ec2/
2. **Click "Launch Instance"** (big orange button)

3. **Configure these settings:**

   **Name and tags:**
   - Name: `summoner-rewind-backend`

   **Application and OS Images:**
   - Quick Start: **Ubuntu**
   - AMI: **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**
   - Architecture: **64-bit (x86)**

   **Instance type:**
   - **t3.micro** (Free tier eligible - 1 GB RAM, 2 vCPUs)

   **Key pair (login):**
   - Click "**Create new key pair**"
   - Key pair name: `summoner-rewind-key`
   - Key pair type: RSA
   - Private key file format: **.pem**
   - Click "Create key pair" - **file will download!**
   - **IMPORTANT**: Save this file! Move it to your project folder

   **Network settings:**
   - Click "**Edit**"
   - Keep "Allow SSH traffic from: Anywhere"
   - ✅ Check "Allow HTTP traffic from the internet"
   - Click "**Add security group rule**"
     - Type: **Custom TCP**
     - Port range: **8000**
     - Source type: **Anywhere**
     - Description: Backend API

   **Configure storage:**
   - 8 GB (default is fine)

   **Advanced details:**
   - Scroll down to "User data" (at the bottom)
   - Paste this script:

```bash
#!/bin/bash
apt-get update
apt-get install -y python3-pip python3-venv
mkdir -p /home/ubuntu/app
```

4. **Click "Launch Instance"** (bottom right)
5. **Wait 30 seconds**, then click "View all instances"
6. **Copy the Public IPv4 address** (looks like: `54.123.45.67`)

---

## Step 2: Move Key File (30 seconds)

```powershell
# Move downloaded key to project folder
Move-Item -Path "$env:USERPROFILE\Downloads\summoner-rewind-key.pem" -Destination "C:\Users\raksh\OneDrive\Desktop\RiftRewindHackathon\"
```

---

## Step 3: Upload Backend Files (2 minutes)

```powershell
cd C:\Users\raksh\OneDrive\Desktop\RiftRewindHackathon

# Replace YOUR-IP with the Public IP from Step 1
$EC2_IP = "YOUR-IP-HERE"

# Upload backend
scp -i summoner-rewind-key.pem -r backend ubuntu@${EC2_IP}:/home/ubuntu/app/
```

**If you get "WARNING: UNPROTECTED PRIVATE KEY FILE":**
- Right-click `summoner-rewind-key.pem`
- Properties → Security → Advanced
- Disable inheritance → Remove all inherited permissions
- Add → Select a principal → Enter your username → OK
- Give Full Control → OK → OK

---

## Step 4: SSH and Setup (3 minutes)

```powershell
# SSH into server
ssh -i summoner-rewind-key.pem ubuntu@YOUR-IP-HERE
```

**Once connected, run:**

```bash
# Install Python packages
cd /home/ubuntu/app/backend
pip3 install -r requirements.txt

# Start the server
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**You should see:**
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Step 5: Test (30 seconds)

**Open new PowerShell window:**

```powershell
# Test health endpoint (replace YOUR-IP)
curl http://YOUR-IP:8000/health

# Should return:
# {"status":"healthy","services":{"riot_api":"configured","aws_bedrock":"configured"}}
```

---

## ✅ Done! Your Backend is Live

**Backend URL:** `http://YOUR-IP:8000`

### For Hackathon Submission:
- **Public URL**: `http://YOUR-IP:8000`
- **Health Check**: `http://YOUR-IP:8000/health`
- **API Docs**: `http://YOUR-IP:8000/docs`

### Update Frontend (if deploying it):
Create `frontend/.env.production`:
```
VITE_API_URL=http://YOUR-IP:8000
```

---

## 🎥 Keep Server Running (Optional)

The server stops when you close SSH. To keep it running:

```bash
# Install screen
sudo apt-get install -y screen

# Start in screen session
screen -S backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000

# Detach: Press Ctrl+A, then D
# Server keeps running!

# To reattach later:
screen -r backend
```

---

## 🐛 Troubleshooting

**Can't SSH:**
```powershell
# Check security group in AWS Console
# Make sure port 22 is open
```

**Backend won't start:**
```bash
# Check Python version
python3 --version  # Should be 3.10+

# Check if .env file exists
ls -la /home/ubuntu/app/backend/.env

# View errors
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level debug
```

**API returns 500 errors:**
```bash
# Check backend logs for errors
# Usually it's missing .env variables
```

---

## 💰 Cost Warning

t3.micro costs ~$0.0104/hour = ~$7.50/month

**Free tier:** 750 hours/month for 12 months

**For hackathon (3 days):** $0.75 total ✅

**Don't forget to STOP instance after hackathon!**

---

## 🎯 Quick Commands

```bash
# View logs in real-time
tail -f /home/ubuntu/app/backend/logs/*.log

# Check if server is running
ps aux | grep uvicorn

# Kill server
pkill -f uvicorn

# Restart server
cd /home/ubuntu/app/backend && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

