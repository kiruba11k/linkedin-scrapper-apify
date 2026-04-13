#  Deployment Guide - LinkedIn Scraper to Apify

## Prerequisites

1. **Apify Account**: Create free account at https://apify.com (no credit card required)
2. **Node.js**: Version 18+ installed
3. **Apify CLI**: Install globally

```bash
npm install -g apify-cli
```

## Step-by-Step Deployment

### Step 1: Authenticate with Apify

```bash
apify login
```

This opens a browser window. Copy your API token from https://console.apify.com/account/integrations

### Step 2: Initialize (if starting fresh)

If you cloned this repo, skip to Step 3.

```bash
# Create new actor project
apify create my-linkedin-scraper

# Choose "Empty project" template
```

### Step 3: Deploy to Apify Platform

Navigate to the project directory:

```bash
cd linkedin-scraper
```

Push the actor to Apify:

```bash
apify push
```

This will:
- Build the Docker image
- Upload your code to Apify
- Create the actor in your account

Expected output:
```
Building actor...
Uploading build...
Actor build created: https://console.apify.com/actors/YOUR_ACTOR_ID
```

### Step 4: Run Your Actor

#### Option A: Via Apify Console (Recommended)

1. Go to https://console.apify.com/actors
2. Click on your actor: **linkedin-profile-scraper**
3. Click **"Try it"** or **"Start"**
4. Configure input:
   ```json
   {
     "profileUrls": [
       "https://www.linkedin.com/in/williamhgates",
       "https://www.linkedin.com/in/jeffweiner08"
     ],
     "maxProfiles": 5,
     "delayBetweenRequests": 3000
   }
   ```
5. Click **"Start"** button
6. View results in the **Dataset** tab

#### Option B: Via API

```bash
curl -X POST \
  https://api.apify.com/v2/acts/YOUR_USERNAME~linkedin-profile-scraper/runs \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileUrls": [
      "https://www.linkedin.com/in/williamhgates"
    ],
    "maxProfiles": 5
  }'
```

#### Option C: Via Apify CLI

```bash
apify call
```

### Step 5: Monitor & Download Results

#### Check Run Status:
```bash
apify info
```

#### Download Dataset:
1. Go to console.apify.com
2. Navigate to: **Storage** → **Datasets**
3. Select your latest dataset
4. Click **"Export"** → Choose format (JSON, CSV, Excel)

Or via CLI:
```bash
# Get latest run dataset
apify dataset get
```

## Updating Your Actor

After making changes to the code:

```bash
# Build locally to test
npm install
npm start

# If tests pass, push update
apify push
```

Apify will create a new build automatically.

## Free Tier Optimization

### Memory Settings

Default memory is **1024 MB**. Reduce it to save costs:

1. Go to actor **Settings**
2. Under **Build**, set **Memory** to **256 MB** or **512 MB**
3. Click **Save**

Lower memory = lower compute units = more runs with $5 credit

### Cost Calculation

**Free tier**: $5/month = ~5,000 Compute Units (CUs)

**CheerioCrawler** (this actor):
- 256 MB memory
- ~10 seconds per profile
- **Cost**: ~0.001 CU per profile
- **Monthly capacity**: ~5,000 profiles

**With Proxy** enabled:
- Adds ~0.002 CU per request
- **Monthly capacity**: ~1,600 profiles

### Monitoring Usage

Check your usage:
```
https://console.apify.com/billing
```

View:
- Compute units used
- Remaining credits
- Usage history

## Troubleshooting

### Error: "Actor build failed"

**Cause**: Docker build issue

**Solution**:
```bash
# Check Dockerfile syntax
cat Dockerfile

# Verify package.json dependencies
npm install
```

### Error: "Authentication required"

**Cause**: Not logged in

**Solution**:
```bash
apify login
```

### Error: "Actor not found"

**Cause**: Actor name doesn't match

**Solution**:
```bash
# Check actor name in .actor/actor.json
# Push again
apify push
```

### Warning: "No data scraped"

**Cause**: LinkedIn profiles are private or URLs invalid

**Solution**:
- Use public profile URLs
- Test with known public profiles (e.g., /in/williamhgates)
- Check if LinkedIn is blocking requests

## Scheduling Runs

Set up automatic runs:

1. Go to **Actor** → **Schedules**
2. Click **"Create schedule"**
3. Set **Cron expression** (e.g., `0 9 * * 1` = Every Monday 9am)
4. Add input configuration
5. Click **"Save"**

Example schedules:
- Daily: `0 9 * * *`
- Weekly: `0 9 * * 1`
- Monthly: `0 9 1 * *`

## Webhooks (Advanced)

Send results to your app automatically:

1. Go to **Actor** → **Settings** → **Webhooks**
2. Add **Webhook URL**: `https://your-app.com/webhook`
3. Select **Event**: `ACTOR.RUN.SUCCEEDED`
4. Click **"Save"**

Your endpoint will receive:
```json
{
  "actorId": "...",
  "actorRunId": "...",
  "eventType": "ACTOR.RUN.SUCCEEDED",
  "datasetId": "..."
}
```

## Integration Examples

### Node.js Integration

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: 'YOUR_API_TOKEN',
});

// Run the actor
const run = await client.actor('YOUR_USERNAME/linkedin-profile-scraper').call({
  profileUrls: ['https://www.linkedin.com/in/example'],
  maxProfiles: 10,
});

// Get results
const { items } = await client.dataset(run.defaultDatasetId).listItems();
console.log(items);
```

### Python Integration

```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

# Run the actor
run = client.actor('YOUR_USERNAME/linkedin-profile-scraper').call(
    run_input={
        'profileUrls': ['https://www.linkedin.com/in/example'],
        'maxProfiles': 10
    }
)

# Get results
dataset = client.dataset(run['defaultDatasetId']).list_items()
print(dataset.items)
```

## Best Practices

1. **Start small**: Test with 5-10 profiles first
2. **Monitor costs**: Check billing after each run
3. **Use delays**: 3000-5000ms between requests
4. **Avoid proxies** (unless necessary) to save credits
5. **Clean up old datasets** to free storage
6. **Set max profiles limit** to prevent runaway costs


---

**Remember**: Scraping LinkedIn violates their ToS. Use responsibly and consider using the official LinkedIn API for production use.
