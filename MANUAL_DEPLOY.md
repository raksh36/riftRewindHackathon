# Manual AWS Deployment Guide
## Rift Rewind - No CLI Required

This guide walks you through deploying to AWS using only the web console.  
**Time Required:** 15-20 minutes

---

## 📋 Prerequisites

- [ ] AWS Account with console access
- [ ] Riot API Key (in `backend/.env`)
- [ ] AWS credentials (Access Key + Secret Key)

---

## Part 1: Deploy Frontend to S3 (5 minutes)

### Step 1.1: Build Frontend

```powershell
cd C:\Users\raksh\OneDrive\Desktop\RiftRewindHackathon\frontend

# Install dependencies (if not done)
npm install

# Build for production
npm run build
```

✅ **Result:** A `dist/` folder will be created with your built frontend.

### Step 1.2: Create S3 Bucket

1. Go to [S3 Console](https://s3.console.aws.amazon.com/s3)
2. Click **"Create bucket"**
3. **Bucket name:** `rift-rewind-frontend-yourname` (must be globally unique)
4. **Region:** `us-east-1` (or your preferred region)
5. **Block Public Access:** UNCHECK all boxes (we need public access for website)
6. Click **"Create bucket"**

### Step 1.3: Upload Frontend Files

1. Open your new bucket
2. Click **"Upload"**
3. Drag the **entire contents** of the `frontend/dist/` folder (not the dist folder itself)
   - Should include: `index.html`, `assets/` folder, etc.
4. Click **"Upload"**
5. Wait for upload to complete

### Step 1.4: Enable Static Website Hosting

1. In your bucket, go to the **"Properties"** tab
2. Scroll down to **"Static website hosting"**
3. Click **"Edit"**
4. Select **"Enable"**
5. **Index document:** `index.html`
6. **Error document:** `index.html`
7. Click **"Save changes"**
8. **Note the endpoint URL** shown (e.g., `http://rift-rewind-frontend.s3-website-us-east-1.amazonaws.com`)

### Step 1.5: Make Bucket Public

1. Go to **"Permissions"** tab
2. Click **"Bucket Policy"** → **"Edit"**
3. Paste this policy (replace `YOUR-BUCKET-NAME`):

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

4. Click **"Save changes"**

✅ **Frontend is now live!** Test by visiting the S3 website URL.

---

## Part 2: Deploy Backend to EC2 (10 minutes)

### Step 2.1: Launch EC2 Instance

1. Go to [EC2 Console](https://console.aws.amazon.com/ec2)
2. Click **"Launch Instance"**
3. **Name:** `rift-rewind-backend`
4. **AMI:** Amazon Linux 2023 (free tier eligible)
5. **Instance type:** `t3.micro` or `t3.small`
6. **Key pair:** 
   - Click "Create new key pair"
   - Name: `rift-rewind-key`
   - Type: RSA
   - Format: `.pem` (for SSH) or `.ppk` (for PuTTY on Windows)
   - Download and save it!
7. **Network settings:**
   - Allow SSH (port 22) from "My IP"
   - Click "Add security group rule"
   - Type: Custom TCP
   - Port: 8000
   - Source: Anywhere (0.0.0.0/0)
8. **Configure storage:** 8 GB (default is fine)
9. Click **"Launch instance"**

### Step 2.2: Connect to Your Instance

**Option A: Using EC2 Instance Connect (Browser-based - Easiest)**

1. Go to **Instances** in EC2 console
2. Select your instance
3. Click **"Connect"**
4. Choose **"EC2 Instance Connect"**
5. Click **"Connect"** (opens terminal in browser)

**Option B: Using SSH (Windows PowerShell)**

```powershell
# Replace with your key path and instance public IP
ssh -i "path\to\rift-rewind-key.pem" ec2-user@YOUR-INSTANCE-PUBLIC-IP
```

### Step 2.3: Install Dependencies on EC2

```bash
# Update system
sudo yum update -y

# Install Python 3.11 and Git
sudo yum install -y python3.11 python3.11-pip git

# Verify installation
python3.11 --version
```

### Step 2.4: Upload Backend Code

**Option A: Manual Upload (Easiest)**

1. On your local machine, zip the backend folder:
```powershell
Compress-Archive -Path backend\* -DestinationPath backend.zip
```

2. Use SCP to upload (from your local PowerShell):
```powershell
scp -i "path\to\rift-rewind-key.pem" backend.zip ec2-user@YOUR-INSTANCE-PUBLIC-IP:/home/ec2-user/
```

3. On EC2, unzip:
```bash
cd /home/ec2-user
unzip backend.zip
```

**Option B: Using Git (If you pushed to GitHub)**

```bash
cd /home/ec2-user
git clone https://github.com/yourusername/rift-rewind.git
cd rift-rewind/backend
```

### Step 2.5: Configure Backend

```bash
cd /home/ec2-user/backend

# Create .env file
nano .env
```

Paste your credentials:
```env
RIOT_API_KEY=***REMOVED***
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

### Step 2.6: Install Python Dependencies

```bash
python3.11 -m pip install -r requirements.txt
```

### Step 2.7: Start the Backend

```bash
# Start in background
nohup python3.11 -m uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &

# Check it's running
curl http://localhost:8000/health

# View logs if needed
tail -f app.log
```

✅ **Get your backend URL:**
- Go to EC2 console
- Select your instance
- Copy the **Public IPv4 address**
- Your backend URL is: `http://YOUR-INSTANCE-IP:8000`

### Step 2.8: Test Backend

```bash
# From EC2 instance
curl http://localhost:8000/api/regions

# From your local machine
curl http://YOUR-INSTANCE-IP:8000/api/regions
```

---

## Part 3: Connect Frontend to Backend (3 minutes)

### Step 3.1: Update Frontend Configuration

On your local machine:

1. Edit `frontend/.env`:
```env
VITE_API_URL=http://YOUR-INSTANCE-IP:8000
```

2. Rebuild frontend:
```powershell
cd frontend
npm run build
```

### Step 3.2: Re-upload Frontend

1. Go to S3 Console → Your bucket
2. Select all files → **Delete**
3. Upload the new `dist/` folder contents
4. Test the website!

---

## Part 4: Testing & Validation

### Test 1: Frontend Loads
Visit: `http://your-bucket.s3-website-us-east-1.amazonaws.com`
- Should see the landing page
- No console errors

### Test 2: API Connection
1. Open the website
2. Enter a summoner name (e.g., "Doublelift", region "na1")
3. Click "Get My Recap"
4. Should see loading → results

### Test 3: All Features Work
- ✅ Stats Overview
- ✅ Performance Charts
- ✅ AI Insights (if AWS Bedrock is configured)
- ✅ Champion Mastery
- ✅ Special Features (Roast, Gems, Personality)

---

## 📊 Final URLs

**Frontend:** `http://your-bucket-name.s3-website-us-east-1.amazonaws.com`  
**Backend:** `http://your-ec2-ip:8000`  
**API Docs:** `http://your-ec2-ip:8000/docs`

---

## 🎯 Troubleshooting

### Frontend shows blank page
- Check browser console for errors
- Verify VITE_API_URL is correct
- Check CORS settings in backend

### Can't connect to backend
- Verify security group allows port 8000
- Check backend is running: `curl http://localhost:8000/health` on EC2
- Check EC2 instance public IP is correct

### Backend crashes
- View logs: `tail -f /home/ec2-user/app.log`
- Check .env file has all credentials
- Verify Python dependencies installed

### AI features not working
- Check AWS credentials in backend/.env
- Verify AWS Bedrock is enabled in your region
- Check CloudWatch logs for Bedrock errors

---

## 💰 Cost Optimization

To avoid unnecessary charges:
1. **Stop EC2 when not in use:** EC2 Console → Instance → Stop
2. **Delete S3 bucket after demo:** S3 Console → Empty bucket → Delete bucket
3. **Remove security group:** EC2 Console → Security Groups → Delete

---

## 🚀 Next Steps

1. Test all features thoroughly
2. Record demo video using the live URL
3. Document the URLs in your submission
4. Add AWS resource tags: `Key: rift-rewind-hackathon, Value: 2025`
5. Submit to hackathon!

---

## 📝 Submission URLs

```
Public URL: http://your-bucket-name.s3-website-us-east-1.amazonaws.com
Code Repository: https://github.com/yourusername/rift-rewind
Demo Video: [YouTube/Vimeo URL]
```

Good luck! 🎮✨

