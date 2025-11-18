# 🎉 EC2 Instance is Ready!

## Your Backend Server Details

- **Instance ID**: `i-0be0119bfe0bb75d2`
- **Instance Type**: `t3.micro` (Cost-effective!)
- **Public IP**: `98.95.188.182` (Permanent Elastic IP)
- **Backend URL**: http://98.95.188.182:8000
- **Region**: us-east-1

---

## Next Steps: Upload and Start Backend (5 minutes)

### Step 1: Connect to EC2 (1 minute)

**Option A: EC2 Instance Connect (Easiest - Browser-based)**

1. Go to: https://console.aws.amazon.com/ec2/home?region=us-east-1#Instances:
2. Find instance: `rift-rewind-backend` (or ID: `i-0be0119bfe0bb75d2`)
3. Select it and click **"Connect"** button
4. Choose **"EC2 Instance Connect"** tab
5. Click **"Connect"** → Opens a browser terminal

**You're now in your server!** ✅

---

### Step 2: Upload Backend Files (2 minutes)

In the EC2 Instance Connect window:

1. **Click "Actions" menu** (top right)
2. **Select "Upload file"**
3. **Browse and select**: `C:\Users\raksh\OneDrive\Desktop\RiftRewindHackathon\backend-deploy.zip`
4. **Wait** for upload to complete (~30 seconds)
5. Click "Close"

---

### Step 3: Setup and Start Backend (3 minutes)

Copy and paste these commands **one at a time** into the EC2 terminal:

```bash
# Install Python 3.11 and unzip
sudo yum install -y python3.11 python3.11-pip unzip
```

Wait for this to complete, then:

```bash
# Extract backend files
cd /home/ec2-user
unzip backend-deploy.zip -d backend
cd backend
ls -la
```

You should see `main.py`, `requirements.txt`, `.env`, etc.

```bash
# Install Python dependencies (takes ~2 minutes)
python3.11 -m pip install --user -r requirements.txt
```

Wait for installation, then:

```bash
# Start the backend server
nohup python3.11 -m uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &
```

```bash
# Wait and check it's running
sleep 5
curl http://localhost:8000/health
```

**Expected response**:
```json
{"status":"healthy","timestamp":"2025-..."}
```

**If you see this, YOUR BACKEND IS LIVE!** 🎉

---

### Step 4: Test from Your Computer (1 minute)

Open these URLs in your browser:

1. **Health Check**: http://98.95.188.182:8000/health
   - Should show: `{"status":"healthy"}`

2. **API Docs**: http://98.95.188.182:8000/docs
   - Should show FastAPI Swagger UI

3. **Test a roast** (in PowerShell):

```powershell
$body = @{
    region = "na1"
    summonerName = "Jojopyun#NA1"
    matchCount = 5
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://98.95.188.182:8000/api/roast" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 120

$response.roast.roasts
```

**If you get roasts, YOUR BACKEND WORKS!** 🚀

---

## Next: Update Frontend to Use AWS Backend

Run these commands on your local machine:

```powershell
cd C:\Users\raksh\OneDrive\Desktop\RiftRewindHackathon\frontend

# Update the .env file
$envContent = "VITE_API_URL=http://98.95.188.182:8000"
$envContent | Out-File -FilePath ".env" -Encoding UTF8

# Restart the frontend
# (Stop the current one with Ctrl+C if running)
npm run dev
```

Open http://localhost:5174 and test searching for a player!

---

## 🆘 Troubleshooting

**Health check returns nothing**:
```bash
# Check if backend is running
ps aux | grep uvicorn

# Check logs
tail -f /home/ec2-user/backend/app.log

# Restart if needed
pkill -f uvicorn
cd /home/ec2-user/backend
nohup python3.11 -m uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &
```

**Connection timeout from browser**:
- Wait 1 more minute (instance might still be initializing)
- Check security group allows port 8000
- Try: http://98.95.188.182:8000/health

**AI features not working**:
- Check backend logs: `tail -f /home/ec2-user/backend/app.log`
- Verify .env has AWS credentials
- Test manually: `curl http://localhost:8000/api/roast -X POST -H "Content-Type: application/json" -d '{"region":"na1","summonerName":"Jojopyun#NA1","matchCount":5}'`

---

## 📋 Quick Reference

**Your URLs**:
- Backend API: http://98.95.188.182:8000
- API Docs: http://98.95.188.182:8000/docs
- Health Check: http://98.95.188.182:8000/health

**To view logs**:
```bash
tail -f /home/ec2-user/backend/app.log
```

**To restart backend**:
```bash
pkill -f uvicorn
cd /home/ec2-user/backend
nohup python3.11 -m uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &
```

**To stop EC2 (save money)**:
```powershell
aws ec2 stop-instances --instance-ids i-0be0119bfe0bb75d2 --region us-east-1
```

**To start EC2 again**:
```powershell
aws ec2 start-instances --instance-ids i-0be0119bfe0bb75d2 --region us-east-1
```

---

## ✅ Success Checklist

- [ ] Connected to EC2 via Instance Connect
- [ ] Uploaded backend-deploy.zip
- [ ] Installed Python and dependencies
- [ ] Started backend server
- [ ] Health check returns `{"status":"healthy"}`
- [ ] API docs load in browser
- [ ] Tested roast generation
- [ ] Updated frontend .env with AWS backend URL
- [ ] Frontend successfully connects to AWS backend

---

**You're almost done! Just follow the steps above and you'll have a fully working cloud deployment!** 🎯

