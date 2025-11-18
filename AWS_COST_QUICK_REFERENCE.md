# AWS Cost Monitoring - Quick Reference Card

## 🔗 Essential Links (Bookmark These!)

| Tool | URL | Use Case |
|------|-----|----------|
| **Billing Dashboard** | https://console.aws.amazon.com/billing/ | Daily cost check |
| **Cost Explorer** | https://console.aws.amazon.com/cost-management/home#/cost-explorer | Weekly deep dive |
| **Budgets** | https://console.aws.amazon.com/billing/home#/budgets | View alerts |
| **CloudWatch** | https://console.aws.amazon.com/cloudwatch/ | Technical metrics |
| **EC2 Instances** | https://console.aws.amazon.com/ec2/home#Instances | Stop/start backend |

---

## 💰 Expected Monthly Costs

```
EC2 (t2.micro):      $8.50
AWS Bedrock:         $15-25
S3 Hosting:          $0.50
Data Transfer:       $1-2
─────────────────────────
TOTAL:               $25-35/month
```

---

## 🚨 Action Thresholds

| Cost | Action |
|------|--------|
| **$25** (50%) | ✅ Normal - review spending |
| **$40** (80%) | ⚠️ Warning - stop non-essential services |
| **$50** (100%) | 🚨 Critical - stop EC2, investigate |
| **$60+** | 🆘 Emergency - stop all services, contact AWS |

---

## ⚡ Emergency Commands

### Stop EC2 (Save $0.012/hour):
```bash
# Find instance ID
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,Tags[?Key==`Name`].Value|[0]]' --output table

# Stop instance
aws ec2 stop-instances --instance-ids i-YOUR-INSTANCE-ID

# Start when needed
aws ec2 start-instances --instance-ids i-YOUR-INSTANCE-ID
```

### Via AWS Console:
```
1. Go to: EC2 → Instances
2. Select instance
3. Instance state → Stop instance
```

---

## 📅 Daily Monitoring Routine (2 minutes)

### Every Morning:
1. Open: https://console.aws.amazon.com/billing/
2. Check "Month-to-Date Costs"
3. Expected: ~$1/day average
4. If higher: Check Cost Explorer by service

### Quick Check Command:
```bash
# View current month estimate
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost
```

---

## 📊 Weekly Review (10 minutes)

### Every Sunday:
1. Cost Explorer → Last 7 days
2. Group by: Service
3. Top 3 should be:
   - AWS Bedrock: $5-8
   - EC2: $2
   - Other: <$1
4. Look for anomalies

---

## 🔔 Email Alerts You'll Receive

| Alert | Means | Do This |
|-------|-------|---------|
| "Budget at 50%" | $25 spent | Review spending, all OK |
| "Budget at 80%" | $40 spent | Stop testing, investigate |
| "Budget exceeded" | $50 spent | Stop EC2 immediately |
| "Cost anomaly detected" | Unusual spike | Check logs, review activity |
| "CloudWatch alarm" | >$60 total | Emergency stop all |

---

## 💡 Cost-Saving Tips

### Development:
- ✅ Use local backend (`uvicorn main:app`)
- ✅ Only deploy to AWS for final testing
- ✅ Stop EC2 when not in use

### Testing:
- ✅ Use `matchCount=10` for testing (not 50)
- ✅ Test with 1-2 players, not bulk tests
- ✅ On-demand AI loading already saves 70%

### Production:
- ✅ Monitor daily usage
- ✅ Set up auto-stop for EC2 (cron job)
- ✅ Cache AI responses (future enhancement)

---

## 📱 AWS Mobile App

**Download**: AWS Console Mobile App
- iOS: App Store
- Android: Play Store

**Quick Check**:
1. Open app
2. See current month spending
3. Tap service for details

---

## 🆘 If Costs Spike Unexpectedly

### Immediate (< 2 min):
```
1. Stop EC2: console.aws.amazon.com/ec2/
2. Check billing: console.aws.amazon.com/billing/
3. Identify service causing spike
```

### Investigate (5 min):
```
1. Cost Explorer → Filter Last 24 hours
2. Group by: Usage Type
3. Look for unusual API calls
4. Check CloudWatch Logs
```

### Contact AWS:
```
Support: console.aws.amazon.com/support/
Billing Team: Available 24/7 (free)
Chat: Usually responds in minutes
```

---

## 🎯 Optimization Checklist

```
□ EC2 stopped when not testing
□ Using t2.micro (not larger)
□ Match count set to 20 (not 50)
□ On-demand AI loading enabled ✅
□ Local development for coding
□ AWS only for production testing
□ Daily cost monitoring
□ Budget alerts enabled
□ Free tier maximized
```

---

## 📞 Emergency Contacts

| Issue | Contact |
|-------|---------|
| **Billing question** | AWS Billing Support (free) |
| **Unexpected charges** | AWS Support Center |
| **Account compromise** | AWS Security Team (immediate) |
| **Technical issue** | AWS Technical Support |

**Phone**: Available in AWS Console → Support

---

## 🔐 Security Best Practices

### Protect Your Account:
- ✅ Enable MFA on root account
- ✅ Use IAM user (not root) for daily work
- ✅ Rotate access keys every 90 days
- ✅ Set up CloudTrail for audit logging
- ✅ Never commit credentials to GitHub

### If Compromised:
```
1. Immediately: Disable IAM user access keys
2. Stop all EC2 instances
3. Rotate all credentials
4. Contact AWS Security
5. Review CloudTrail logs
```

---

## 📈 Cost Trends to Watch

### Good Trends:
- ✅ Steady $25-35/month
- ✅ EC2 ~25% of total cost
- ✅ Bedrock ~70% of total cost
- ✅ Predictable daily spending

### Bad Trends:
- 🚨 Sudden 2x spike
- 🚨 Bedrock >$50/month
- 🚨 EC2 >$20/month (wrong instance type)
- 🚨 Data transfer >$5 (leak?)

---

## 🎓 Learn More

- **AWS Free Tier**: https://aws.amazon.com/free/
- **Cost Optimization**: https://aws.amazon.com/pricing/cost-optimization/
- **Pricing Calculator**: https://calculator.aws/
- **Billing Docs**: https://docs.aws.amazon.com/awsaccountbilling/

---

**Print this page and keep it near your desk for quick reference!** 🖨️



