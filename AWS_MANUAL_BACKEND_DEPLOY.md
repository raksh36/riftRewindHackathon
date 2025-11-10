# Manual Backend Deployment to AWS EC2

## ⚡ Quick Steps (Without AWS CLI)

### Step 1: Launch EC2 Instance

1. **Go to AWS Console**: https://console.aws.amazon.com/ec2/
2. **Click "Launch Instance"**
3. **Configure:**
   - **Name**: `summoner-rewind-backend`
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance type**: t3.micro (Free tier)
   - **Key pair**: Create new or use existing
     - If creating: Download the `.pem` file and save it!
   - **Network settings**:
     - ✅ Allow SSH traffic from: Anywhere
     - ✅ Allow HTTP traffic from: Anywhere
     - ✅ Add rule: Custom TCP, Port 8000, Source: 0.0.0.0/0
   - **Storage**: 8 GB (default)
   - **Advanced**: Add tag
     - Key: `rift-rewind-hackathon`
     - Value: `2025`

4. **Click "Launch Instance"**
5. **Note the Public IP address** (e.g., `54.123.45.67`)

### Step 2: Upload Backend Files

**Windows (PowerShell):**
```powershell
# Navigate to your project
cd C:\Users\raksh\OneDrive\Desktop\RiftRewindHackathon

# Upload backend directory (replace YOUR-KEY.pem and IP)
scp -i YOUR-KEY.pem -r backend ubuntu@YOUR-PUBLIC-IP:/home/ubuntu/
```

**Alternative - Use WinSCP (GUI):**
1. Download WinSCP: https://winscp.net/
2. Connect to `ubuntu@YOUR-PUBLIC-IP` with your `.pem` key
3. Upload the `backend` folder to `/home/ubuntu/`

### Step 3: SSH Into Instance

```powershell
ssh -i YOUR-KEY.pem ubuntu@YOUR-PUBLIC-IP
```

### Step 4: Setup Backend on EC2

Once connected via SSH, run:

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Python 3.11
sudo apt-get install -y python3-pip python3-venv

# Navigate to backend
cd /home/ubuntu/backend

# Install dependencies
pip3 install -r requirements.txt

# Create .env file (copy from your local)
nano .env
```

**Paste your env variables:**
```
RIOT_API_KEY=your-riot-api-key-here
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

Save with `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Start Backend Server

**Option A: Temporary (for testing):**
```bash
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Option B: Permanent (keeps running):**
```bash
# Install screen
sudo apt-get install -y screen

# Start in screen session
screen -S backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000

# Detach with: Ctrl+A then D
# Reattach with: screen -r backend
```

**Option C: Systemd Service (best):**
```bash
# Create service file
sudo nano /etc/systemd/system/summoner-rewind.service
```

Paste:
```ini
[Unit]
Description=Summoner Rewind Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/backend
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
ExecStart=/usr/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Save and start:
```bash
sudo systemctl daemon-reload
sudo systemctl start summoner-rewind
sudo systemctl enable summoner-rewind
sudo systemctl status summoner-rewind
```

### Step 6: Test Backend

```bash
# From EC2 instance
curl http://localhost:8000/health

# From your computer
curl http://YOUR-PUBLIC-IP:8000/health
```

Should return:
```json
{"status":"healthy","services":{"riot_api":"configured","aws_bedrock":"configured"}}
```

### Step 7: Update Frontend

**Update frontend/.env.production:**
```
VITE_API_URL=http://YOUR-PUBLIC-IP:8000
```

---

## 🎯 Your Backend URL

```
http://YOUR-PUBLIC-IP:8000
```

Example API endpoints:
- Health: `http://YOUR-PUBLIC-IP:8000/health`
- Player: `http://YOUR-PUBLIC-IP:8000/api/player/na1/Jojopyun%23NA1`
- Demo: `http://YOUR-PUBLIC-IP:8000/api/demo/player`

---

## 📝 For Hackathon Submission

**Public URL:** `http://YOUR-PUBLIC-IP:8000`

**Note**: This is HTTP only. For production, you'd want:
- Domain name (Route 53)
- SSL certificate (Certificate Manager)
- Load balancer (ALB)

But for hackathon demo, HTTP with public IP works fine!

---

## 🐛 Troubleshooting

**Can't SSH:**
- Check security group allows port 22 from your IP
- Check `.pem` file permissions: `chmod 400 YOUR-KEY.pem` (Mac/Linux)

**Backend won't start:**
```bash
# Check logs
sudo journalctl -u summoner-rewind -f

# Check if port is in use
sudo lsof -i :8000

# Check Python installation
python3 --version
which python3
```

**API returns errors:**
- Check `.env` file has correct keys
- Test Riot API key: `curl -H "X-Riot-Token: YOUR_KEY" "https://na1.api.riotgames.com/lol/platform/v3/champion-rotations"`
- Check AWS credentials: `aws sts get-caller-identity` (if AWS CLI installed)

**504 timeout:**
- Increase timeout in frontend: `timeout: 120000` in `api.js`
- Check backend logs for errors

---

## 💡 Quick Commands Reference

```bash
# Start service
sudo systemctl start summoner-rewind

# Stop service
sudo systemctl stop summoner-rewind

# Restart service
sudo systemctl restart summoner-rewind

# View logs
sudo journalctl -u summoner-rewind -f

# View last 100 lines
sudo journalctl -u summoner-rewind -n 100

# Check status
sudo systemctl status summoner-rewind
```

---

**You're almost done! Just need to:**
1. ✅ Launch EC2 instance
2. ✅ Upload backend files
3. ✅ Start the service
4. ✅ Get the public IP for submission


