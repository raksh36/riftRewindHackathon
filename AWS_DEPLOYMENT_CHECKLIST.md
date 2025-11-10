# AWS Deployment Checklist
## Step-by-Step Guide for Console Deployment

Print this and check off each step as you complete it.

---

## 📋 Prerequisites

- [ ] AWS account logged in: https://console.aws.amazon.com
- [ ] Backend .env file has Riot API key
- [ ] Backend .env file has AWS credentials
- [ ] Node.js installed (check: `node --version`)
- [ ] Python installed (check: `python --version`)

---

## Part 1: Frontend Deployment (S3) - 5 minutes

### Build Phase
- [ ] Open PowerShell in project root
- [ ] Run: `cd frontend`
- [ ] Run: `npm install` (if not done already)
- [ ] Run: `npm run build`
- [ ] Verify `dist/` folder created with files inside

### S3 Bucket Creation
- [ ] Open https://s3.console.aws.amazon.com/s3
- [ ] Click "Create bucket"
- [ ] Enter name: `rift-rewind-frontend-YOURNAME` (must be unique globally)
- [ ] Select region: `us-east-1`
- [ ] UNCHECK "Block all public access"
- [ ] Check the acknowledgment box
- [ ] Click "Create bucket"
- [ ] Write your bucket name here: _______________________________

### Upload Files
- [ ] Click on your new bucket name
- [ ] Click "Upload"
- [ ] Drag ALL files from `frontend/dist/` (not the dist folder itself)
- [ ] Should include: `index.html`, `assets/` folder, `vite.svg`
- [ ] Click "Upload"
- [ ] Wait for "Upload succeeded" message
- [ ] Click "Close"

### Enable Website Hosting
- [ ] In your bucket, click "Properties" tab
- [ ] Scroll to "Static website hosting"
- [ ] Click "Edit"
- [ ] Select "Enable"
- [ ] Index document: `index.html`
- [ ] Error document: `index.html`
- [ ] Click "Save changes"
- [ ] Copy the endpoint URL shown
- [ ] Write your frontend URL here: _______________________________

### Make Bucket Public
- [ ] Click "Permissions" tab
- [ ] Click "Bucket Policy"
- [ ] Click "Edit"
- [ ] Paste the policy (replace YOUR-BUCKET-NAME):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```
- [ ] Click "Save changes"
- [ ] Test frontend URL in browser - should see landing page

### Tag Resources (Optional for hackathon)
- [ ] Click "Properties" tab
- [ ] Scroll to "Tags"
- [ ] Click "Edit"
- [ ] Add tag: Key=`rift-rewind-hackathon`, Value=`2025`
- [ ] Click "Save changes"

---

## Part 2: Backend Deployment (EC2) - 10 minutes

### Launch Instance
- [ ] Open https://console.aws.amazon.com/ec2
- [ ] Click "Launch Instance"
- [ ] Name: `rift-rewind-backend`
- [ ] Application and OS Images: Select "Amazon Linux 2023 AMI"
- [ ] Instance type: Select `t3.micro` (free tier) or `t3.small`
- [ ] Key pair:
  - [ ] Click "Create new key pair"
  - [ ] Name: `rift-rewind-key`
  - [ ] Key pair type: RSA
  - [ ] Private key format: `.pem` (or `.ppk` if using PuTTY)
  - [ ] Click "Create key pair"
  - [ ] SAVE the downloaded key file safely!
  - [ ] Write key file location: _______________________________

### Configure Network
- [ ] In "Network settings", click "Edit"
- [ ] Security group name: `rift-rewind-sg`
- [ ] Rule 1 (already there):
  - [ ] Type: SSH
  - [ ] Port: 22
  - [ ] Source: My IP (or Anywhere for testing)
- [ ] Click "Add security group rule"
  - [ ] Type: Custom TCP
  - [ ] Port: `8000`
  - [ ] Source: Anywhere (0.0.0.0/0)
- [ ] Click "Add security group rule"
  - [ ] Type: HTTP
  - [ ] Port: `80`
  - [ ] Source: Anywhere (0.0.0.0/0)

### Configure Storage & Tags
- [ ] Storage: 8 GB (default is fine)
- [ ] Expand "Advanced details"
- [ ] Scroll to "User data" (skip for now, we'll deploy manually)
- [ ] Click "Launch instance"
- [ ] Click "View all instances"
- [ ] Wait for "Instance state" to be "Running" (takes 1-2 minutes)
- [ ] Select your instance
- [ ] Copy "Public IPv4 address"
- [ ] Write your EC2 IP here: _______________________________

### Add Tags to Instance
- [ ] Select your instance
- [ ] Click "Tags" tab
- [ ] Click "Manage tags"
- [ ] Add tag: Key=`rift-rewind-hackathon`, Value=`2025`
- [ ] Click "Save"

### Connect to Instance
- [ ] Select your instance
- [ ] Click "Connect" button
- [ ] Choose "EC2 Instance Connect" tab
- [ ] Click "Connect" (opens browser terminal)
- [ ] You should see a Linux terminal

### Setup Backend on EC2
Run these commands in the EC2 terminal:

- [ ] Update system:
```bash
sudo yum update -y
```

- [ ] Install Python 3.11:
```bash
sudo yum install -y python3.11 python3.11-pip
python3.11 --version
```

- [ ] Install Git:
```bash
sudo yum install -y git
```

- [ ] Create directory:
```bash
cd /home/ec2-user
mkdir backend
cd backend
```

### Upload Backend Files
Option A: Use SCP from your local machine (new PowerShell window):

- [ ] Create zip file locally:
```powershell
cd C:\Users\raksh\OneDrive\Desktop\RiftRewindHackathon
Compress-Archive -Path backend\* -DestinationPath backend.zip -Force
```

- [ ] Upload to EC2:
```powershell
scp -i "path\to\rift-rewind-key.pem" backend.zip ec2-user@YOUR-EC2-IP:/home/ec2-user/
```

- [ ] Back on EC2, unzip:
```bash
cd /home/ec2-user
unzip backend.zip -d backend
cd backend
```

Option B: Copy files manually via the web console (slower but simpler):
- [ ] In EC2 terminal, create files one by one
- [ ] Copy contents from local files

### Create .env File on EC2
- [ ] In EC2 terminal:
```bash
cd /home/ec2-user/backend
nano .env
```

- [ ] Type/paste (replace with your actual values):
```
RIOT_API_KEY=***REMOVED***
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_key
AWS_SECRET_ACCESS_KEY=your_actual_secret
```

- [ ] Press `Ctrl+X`, then `Y`, then `Enter` to save

### Install Python Dependencies
- [ ] Run:
```bash
python3.11 -m pip install -r requirements.txt
```
- [ ] Wait 1-2 minutes for installation

### Start Backend Server
- [ ] Run:
```bash
nohup python3.11 -m uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &
```

- [ ] Verify it's running:
```bash
curl http://localhost:8000/health
```

- [ ] Should see: `{"status":"healthy",...}`

### Test Backend from Local Machine
- [ ] Open browser on your local machine
- [ ] Visit: `http://YOUR-EC2-IP:8000/docs`
- [ ] Should see FastAPI documentation page
- [ ] Test health endpoint: `http://YOUR-EC2-IP:8000/health`

---

## Part 3: Connect Frontend to Backend - 3 minutes

### Update Frontend Configuration
- [ ] On your local machine, edit `frontend/.env`
- [ ] Change to: `VITE_API_URL=http://YOUR-EC2-IP:8000`
- [ ] Save file

### Rebuild Frontend
- [ ] Open PowerShell
- [ ] Run:
```powershell
cd C:\Users\raksh\OneDrive\Desktop\RiftRewindHackathon\frontend
npm run build
```

### Re-upload to S3
- [ ] Go to S3 Console
- [ ] Open your bucket
- [ ] Select all files
- [ ] Click "Delete"
- [ ] Confirm deletion
- [ ] Click "Upload"
- [ ] Drag ALL files from `frontend/dist/` again
- [ ] Click "Upload"
- [ ] Wait for completion

---

## Part 4: Final Testing - 5 minutes

### Test 1: Frontend Loads
- [ ] Visit your S3 website URL
- [ ] Should see landing page with search box
- [ ] Check browser console (F12) - no errors

### Test 2: API Connection
- [ ] Enter summoner name: `Doublelift`
- [ ] Select region: `na1`
- [ ] Click "Get My Recap"
- [ ] Should see loading animation
- [ ] Should see results dashboard

### Test 3: All Features
- [ ] Overview tab shows stats
- [ ] AI Insights tab (works if AWS Bedrock configured)
- [ ] Champions tab shows top champions
- [ ] Special tab shows roasts/gems/personality

### Test 4: Mobile Responsiveness
- [ ] Press F12 in browser
- [ ] Click device toolbar icon
- [ ] Test on iPhone/iPad view
- [ ] Everything should still work

---

## 📝 Record Your Deployment Info

**Frontend:**
- S3 Bucket: _______________________________
- Frontend URL: _______________________________

**Backend:**
- EC2 Instance ID: _______________________________
- EC2 Public IP: _______________________________
- Backend API URL: http://_____________:8000
- API Docs URL: http://_____________:8000/docs

**Credentials Used:**
- AWS Region: _______________________________
- Key Pair Name: _______________________________
- Security Group: _______________________________

---

## 🎯 Submission URLs

Copy these for your hackathon submission:

```
Public URL: [Your S3 website URL]
API Endpoint: http://[Your EC2 IP]:8000
Code Repository: https://github.com/yourusername/rift-rewind
Demo Video: [YouTube/Vimeo URL - record after deployment]
```

---

## ✅ Success Checklist

- [ ] Frontend loads successfully
- [ ] Can search for any summoner
- [ ] Results page displays correctly
- [ ] All 4 tabs work
- [ ] Charts render properly
- [ ] AI features work (if Bedrock configured)
- [ ] No console errors
- [ ] Mobile view works

---

## 🎬 Next Steps

- [ ] Test thoroughly
- [ ] Fix any bugs
- [ ] Record 3-minute demo video (follow DEMO_SCRIPT.md)
- [ ] Upload video to YouTube/Vimeo
- [ ] Fill out hackathon submission form
- [ ] Submit before deadline!

---

## 🆘 Troubleshooting

**Frontend shows CORS error:**
- Backend needs to allow your S3 domain
- Check main.py CORS configuration

**Backend not responding:**
- Check EC2 security group allows port 8000
- Verify backend is running: `ps aux | grep uvicorn`
- Check logs: `tail -f /home/ec2-user/backend/app.log`

**AI features not working:**
- Verify AWS credentials in .env
- Check AWS Bedrock is enabled in us-east-1
- Test with: `aws bedrock list-foundation-models`

**EC2 connection timeout:**
- Check security group allows SSH (port 22)
- Verify instance is running
- Check you're using correct key file

---

## 💰 Cost Management

**To avoid charges:**
- [ ] Stop EC2 instance when not testing
- [ ] Delete S3 bucket after submission
- [ ] Remove EC2 instance after hackathon
- [ ] Delete security groups and key pairs

**To monitor costs:**
- [ ] Set up billing alerts in AWS
- [ ] Check AWS Cost Explorer daily
- [ ] Use free tier eligible resources

---

**✨ You've got this! Follow each step carefully and you'll have a working deployment in 20 minutes! ✨**

