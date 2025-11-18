# AWS Cost Monitoring Setup for Rift Rewind

## 🎯 Quick Setup Guide (15 minutes)

Follow these steps to monitor your AWS spending and prevent surprise bills!

---

## Step 1: Enable Billing Alerts (5 min)

### A. Enable Billing Preferences
1. Go to: https://console.aws.amazon.com/billing/
2. Click **"Billing preferences"** in the left menu
3. Enable these checkboxes:
   - ✅ **Receive Billing Alerts**
   - ✅ **Receive Free Tier Usage Alerts**
   - ✅ **Receive CloudWatch Billing Alarms**
4. Enter your email address
5. Click **"Save preferences"**

---

## Step 2: Create a Monthly Budget (5 min)

### A. Navigate to Budgets
1. Go to: https://console.aws.amazon.com/billing/
2. Click **"Budgets"** in the left menu
3. Click **"Create budget"**

### B. Configure Budget
**Template Selection:**
- Select: **"Monthly cost budget"**
- Click **"Next"**

**Budget Details:**
```
Budget name: RiftRewind-Monthly-Budget
Period: Monthly
Budgeted amount: $50.00
(Adjust based on your needs: $30 minimal, $100 heavy testing)
```

**Budget Scope:**
- Select: **"All AWS services"**
- Click **"Next"**

### C. Set Up Alerts
Create 3 alert thresholds:

**Alert 1 - Warning:**
```
Alert threshold: 50% of budgeted amount ($25)
Email recipients: your-email@example.com
```

**Alert 2 - Critical:**
```
Alert threshold: 80% of budgeted amount ($40)
Email recipients: your-email@example.com
```

**Alert 3 - Over Budget:**
```
Alert threshold: 100% of budgeted amount ($50)
Email recipients: your-email@example.com
```

Click **"Create budget"**

---

## Step 3: Set Up Cost Anomaly Detection (3 min)

### A. Enable Anomaly Detection
1. Go to: https://console.aws.amazon.com/cost-management/home
2. Click **"Cost Anomaly Detection"** in left menu
3. Click **"Create monitor"**

### B. Configure Monitor
```
Monitor name: RiftRewind-Anomaly-Monitor
Monitor type: AWS services
Services: All AWS services (default)
Alert threshold: $5.00
(Alerts when daily spending increases by $5+ unexpectedly)
```

### C. Set Up Alert Subscription
```
Subscription name: RiftRewind-Anomaly-Alerts
Alert frequency: Daily
Email recipients: your-email@example.com
```

Click **"Create monitor"**

---

## Step 4: Create CloudWatch Billing Alarm (2 min)

### A. Navigate to CloudWatch
1. Go to: https://console.aws.amazon.com/cloudwatch/
2. **Important**: Change region to **US East (N. Virginia)** (top right)
   - Billing metrics only available in us-east-1!
3. Click **"Alarms"** in left menu
4. Click **"All alarms"**
5. Click **"Create alarm"**

### B. Configure Alarm
**Select Metric:**
- Click **"Select metric"**
- Choose **"Billing"** → **"Total Estimated Charge"**
- Select the **"USD"** metric
- Click **"Select metric"**

**Define Conditions:**
```
Threshold type: Static
Whenever EstimatedCharges is: Greater
than: 60
(Set to 120% of your budget as failsafe)
```

**Configure Actions:**
```
Alarm state trigger: In alarm
Send notification to: Create new topic
Topic name: RiftRewind-Billing-Alarm
Email: your-email@example.com
```

Click **"Create topic"** → Check your email and **confirm subscription**

**Name and Create:**
```
Alarm name: RiftRewind-High-Cost-Alert
Alarm description: Alert when estimated charges exceed $60
```

Click **"Create alarm"**

---

## Step 5: Daily Monitoring Routine (2 min/day)

### Quick Daily Check:
1. Go to: https://console.aws.amazon.com/billing/
2. Check **"Month-to-date"** total
3. Verify it's within expectations

### Weekly Deep Dive (once per week):
1. Go to: https://console.aws.amazon.com/cost-management/home
2. Click **"Cost Explorer"**
3. View **"Last 7 days"** costs
4. Group by: **"Service"**
5. Check top spending services

---

## 📊 Expected Costs Breakdown

### Current Setup (with optimizations):
```
Service                 Usage                   Cost/Month
─────────────────────────────────────────────────────────
EC2 (t2.micro)         Backend 24/7            $8.50
AWS Bedrock            ~500 AI calls/day       $15-25
  - AI Insights        ~15 calls/day           $5-8
  - Hidden Gems        ~15 calls/day           $5-8
  - Personality        ~15 calls/day           $5-8
  - Roasts             ~5 calls/day            $2-3
S3 (Frontend)          Static hosting          $0.50
Data Transfer          API calls               $1-2
CloudWatch             Basic monitoring        Free
─────────────────────────────────────────────────────────
TOTAL                                          $25-35/month
```

### Cost Spikes to Watch:
- **High traffic spike**: 1000+ searches/day = $100+/month
- **Testing loops**: Automated testing = $$$
- **Large match counts**: 50+ matches per search = 2x cost

---

## 🚨 Cost-Saving Actions

### Immediate Actions:

**1. Stop EC2 when not testing:**
```bash
# Stop (saves ~$0.012/hour)
aws ec2 stop-instances --instance-ids i-YOUR-INSTANCE-ID

# Start when needed
aws ec2 start-instances --instance-ids i-YOUR-INSTANCE-ID
```

**2. Use AWS Free Tier:**
- First 12 months: 750 hours/month t2.micro free
- Check status: Billing → Free Tier
- Shows remaining hours

**3. Monitor Bedrock Token Usage:**
```
Cost Explorer → Filter by:
- Service: AWS Bedrock
- Usage Type: Group by API calls
```

**4. Set up local dev environment:**
- Use local backend for development
- Only use AWS for production testing
- Saves 90% during development

### Already Implemented ✅:
- ✅ On-demand AI loading (saves ~70% Bedrock costs)
- ✅ Match count optimization (20 instead of 50)
- ✅ Parallel API calls (reduces timeout waste)
- ✅ Component persistence (no duplicate loads)

---

## 📈 Monitoring Dashboard Quick Links

Save these for quick access:

### Daily Checks:
- **Billing Dashboard**: https://console.aws.amazon.com/billing/
- **Current Charges**: Check "Month-to-Date" box

### Weekly Review:
- **Cost Explorer**: https://console.aws.amazon.com/cost-management/home#/cost-explorer
- **Budgets**: https://console.aws.amazon.com/billing/home#/budgets

### Monthly Review:
- **Cost & Usage Report**: https://console.aws.amazon.com/billing/home#/reports
- **Invoice**: Billing → Invoices

### Emergency:
- **Stop All Services**: EC2 → Instances → Stop
- **Disable Bedrock**: IAM → User → Remove Bedrock permissions

---

## 🔔 Alert Configuration Summary

After setup, you'll receive emails for:

| Alert Type | Trigger | Action |
|------------|---------|--------|
| Budget 50% | $25 spent | Review spending |
| Budget 80% | $40 spent | Stop non-essential services |
| Budget 100% | $50 spent | Stop EC2, investigate |
| Anomaly | +$5 unusual spike | Check logs immediately |
| CloudWatch | >$60 total | Emergency - stop all |

---

## 📱 Mobile Monitoring (Optional)

### AWS Mobile App:
1. Download: **AWS Console Mobile App**
2. Login with your AWS credentials
3. Quick view: Dashboard shows current spending
4. Push notifications for budget alerts

---

## 🧪 Test Your Setup

After completing all steps, test the monitoring:

### 1. Check Budget:
```bash
# Should see your $50 budget with 0% used (if new month)
```

### 2. Test Alert Email:
- Wait for first bill update (~24 hours)
- Should receive anomaly detection enrollment confirmation

### 3. Verify CloudWatch Alarm:
- CloudWatch → Alarms → Should show "OK" status
- If in "INSUFFICIENT_DATA", wait 24 hours

---

## 💡 Pro Tips

### Tip 1: Set Multiple Budgets
Create separate budgets for each service:
- **EC2 Budget**: $10/month
- **Bedrock Budget**: $30/month
- **Total Budget**: $50/month

### Tip 2: Use Tags
Tag your resources:
```
Project: RiftRewind
Environment: Production
Owner: YourName
```
Then filter Cost Explorer by tags!

### Tip 3: Schedule Cost Reviews
- **Daily**: Quick dashboard check (2 min)
- **Weekly**: Cost Explorer review (10 min)
- **Monthly**: Full analysis + optimization (30 min)

### Tip 4: Document Anomalies
Keep a log of any cost spikes:
```
Date: 2025-11-17
Spike: $15 unexpected
Cause: Forgot to stop EC2 overnight
Action: Set up stop/start schedule
```

---

## 🆘 What to Do if Costs Spike

### Immediate Actions (< 5 min):
1. **Stop EC2 instance** (saves compute costs)
2. **Check recent activity** (CloudWatch Logs)
3. **Disable IAM user** (if compromised)
4. **Contact AWS Support** (if unable to stop charges)

### Investigation (15 min):
1. Cost Explorer → Filter by "Last 7 days"
2. Identify which service caused spike
3. Check CloudWatch logs for unusual activity
4. Review recent code deployments

### Prevention:
1. Set lower budget thresholds
2. Enable MFA on AWS account
3. Rotate access keys regularly
4. Use least-privilege IAM permissions

---

## ✅ Setup Checklist

Copy this checklist and mark items as you complete them:

```
□ Enabled billing alerts in preferences
□ Enabled Free Tier alerts
□ Created monthly budget ($50)
□ Set up 3 budget alert thresholds (50%, 80%, 100%)
□ Created Cost Anomaly Detection monitor
□ Set up anomaly alert subscription
□ Created CloudWatch billing alarm ($60)
□ Confirmed email subscriptions (check inbox!)
□ Bookmarked billing dashboard
□ Bookmarked Cost Explorer
□ Set daily reminder to check costs
□ Tested stopping/starting EC2
□ Reviewed expected costs
□ Documented AWS account credentials safely
```

---

## 📞 Support Resources

### AWS Cost Support:
- **AWS Support Center**: https://console.aws.amazon.com/support/
- **Billing Support**: Free for all accounts
- **Phone**: Available in AWS Console

### Documentation:
- **AWS Billing Docs**: https://docs.aws.amazon.com/awsaccountbilling/
- **Cost Optimization**: https://aws.amazon.com/pricing/cost-optimization/
- **Free Tier**: https://aws.amazon.com/free/

### Community:
- **AWS Forums**: https://forums.aws.amazon.com/
- **Reddit r/aws**: https://reddit.com/r/aws
- **Stack Overflow**: Tag `amazon-web-services`

---

## 🎉 You're All Set!

After completing this setup, you'll have:
- ✅ Real-time cost monitoring
- ✅ Email alerts for spending thresholds
- ✅ Anomaly detection for unusual charges
- ✅ Daily/weekly monitoring routine
- ✅ Emergency procedures

**Remember**: Check your billing dashboard daily (takes 2 minutes) to catch issues early!

---

**Questions or issues with setup?** Let me know which step you're on and I can help troubleshoot! 🚀



