# LinkedIn Profile Scraper for Apify

A lightweight LinkedIn profile scraper optimized for Apify's free tier ($5/month credits).

## ⚠️ LEGAL DISCLAIMER

**IMPORTANT**: This scraper is provided for **educational purposes only**.

- Scraping LinkedIn **violates their Terms of Service**
- You may face **account bans**, cease-and-desist letters, or legal action
- Ensure compliance with **GDPR, CCPA**, and other privacy laws
- **Use at your own risk**

For legitimate LinkedIn data access, use the [LinkedIn API](https://developer.linkedin.com/).

## 🎯 Features

- ✅ Scrapes public LinkedIn profile data (no login required)
- ✅ Optimized for Apify **free tier** (minimal memory usage)
- ✅ Configurable rate limiting to avoid detection
- ✅ Optional proxy support
- ✅ Clean JSON output with error handling
- ✅ Uses CheerioCrawler (8-16x cheaper than Playwright)

## 📊 What Data is Scraped?

From **public profiles** (visible without login):
- Name
- Headline
- Location
- About section
- Experience (limited)
- Education (limited)
- Skills (very limited)

**Note**: Most detailed LinkedIn data requires login and will not be accessible.

## 🚀 Quick Start

### Option 1: Deploy Directly to Apify (Recommended)

1. **Create Apify Account**: Sign up at [apify.com](https://apify.com) (free tier, no credit card required)

2. **Install Apify CLI**:
   ```bash
   npm install -g apify-cli
   ```

3. **Login to Apify**:
   ```bash
   apify login
   ```

4. **Navigate to the project folder**:
   ```bash
   cd linkedin-scraper
   ```

5. **Push to Apify**:
   ```bash
   apify push
   ```

6. **Run the Actor**:
   - Go to [console.apify.com](https://console.apify.com)
   - Navigate to **Actors** → **linkedin-profile-scraper**
   - Click **Start**
   - Add LinkedIn profile URLs in the input
   - Click **Start**

### Option 2: Test Locally First

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create input file** `apify_storage/key_value_stores/default/INPUT.json`:
   ```json
   {
     "profileUrls": [
       "https://www.linkedin.com/in/example-profile-1",
       "https://www.linkedin.com/in/example-profile-2"
     ],
     "maxProfiles": 10,
     "delayBetweenRequests": 3000
   }
   ```

3. **Run locally**:
   ```bash
   npm start
   ```

4. **Check results**:
   Results will be saved in `apify_storage/datasets/default/`

## 🎛️ Configuration Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `profileUrls` | Array | Required | List of LinkedIn profile URLs to scrape |
| `maxProfiles` | Integer | 50 | Maximum number of profiles (helps control costs) |
| `delayBetweenRequests` | Integer | 2000 | Delay in ms between requests (2000-5000 recommended) |
| `proxyConfiguration.useApifyProxy` | Boolean | false | Enable Apify proxy (costs extra credits) |

## 💰 Free Tier Optimization

The free tier includes:
- **$5 in monthly credits** (renews each month)
- **4GB Actor RAM**
- **7-day data retention**
- Limited proxy access

### Cost Estimates (Free Tier)

With **CheerioCrawler** (no browser):
- ~0.001 CU per profile
- **$5 = ~5,000 profiles/month**

If you enable **proxy**:
- Costs increase significantly
- ~1,000-2,000 profiles with $5

### Tips to Maximize Free Tier:
1. **Don't use proxies** unless necessary
2. **Batch requests** - scrape multiple profiles per run
3. **Increase delays** between requests (3000-5000ms)
4. **Lower memory** setting to 256MB if possible
5. **Limit max profiles** to control costs

## 📋 Sample Input

```json
{
  "profileUrls": [
    "https://www.linkedin.com/in/williamhgates",
    "https://www.linkedin.com/in/jeffweiner08",
    "https://www.linkedin.com/in/satyanadella"
  ],
  "maxProfiles": 20,
  "delayBetweenRequests": 3000,
  "proxyConfiguration": {
    "useApifyProxy": false
  }
}
```

## 📤 Sample Output

```json
{
  "url": "https://www.linkedin.com/in/example",
  "scrapedAt": "2026-04-13T10:30:00.000Z",
  "status": "success",
  "name": "John Doe",
  "headline": "Software Engineer at Tech Company",
  "location": "San Francisco, CA",
  "about": "Passionate about building great products...",
  "experience": [
    {
      "title": "Software Engineer",
      "company": "Tech Company",
      "duration": "2020 - Present"
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Bachelor's in Computer Science",
      "years": "2016 - 2020"
    }
  ],
  "skills": ["JavaScript", "Python", "React"]
}
```

## 🔧 Troubleshooting

### "Limited data extracted" warning
- Profile is private or requires login
- LinkedIn's public view has very limited info
- Solution: This is expected for most profiles

### High costs on free tier
- Disable proxy if not needed
- Increase `delayBetweenRequests`
- Reduce `maxProfiles`
- Check memory allocation (use 256MB instead of default)

### Actor fails immediately
- Check that profile URLs are valid LinkedIn URLs
- Ensure you provided at least one URL
- Check logs in Apify Console for specific errors

### Getting blocked/rate limited
- Increase `delayBetweenRequests` to 5000+ ms
- Enable proxy (costs more credits)
- Scrape fewer profiles per run
- Use different LinkedIn profile formats

## 📁 File Structure

```
linkedin-scraper/
├── .actor/
│   ├── actor.json           # Actor configuration
│   └── input_schema.json    # Input form definition
├── src/
│   └── main.js              # Main scraper logic
├── Dockerfile               # Docker build configuration
├── package.json             # Dependencies
└── README.md               # This file
```

## 🚨 Rate Limiting & Best Practices

To avoid detection and bans:
1. **Never exceed 100 requests/hour**
2. **Use delays of 3000-5000ms** between requests
3. **Rotate IPs** using proxy (if affordable)
4. **Don't create fake accounts** - use your real account or scrape public data only
5. **Respect robots.txt** (LinkedIn blocks most bots)
6. **Monitor your logs** for errors or blocks

## 🔐 Privacy & Compliance

If you collect personal data:
- **Implement data retention policies**
- **Provide deletion mechanisms** (GDPR)
- **Don't resell scraped data** without consent
- **Inform users** if you store their data
- **Keep retention periods short**

## 🆘 Support

For Apify platform issues:
- [Apify Documentation](https://docs.apify.com)
- [Apify Discord](https://discord.gg/apify)
- Email: support@apify.com

## 📜 License

ISC License - Use at your own risk.

## ⚖️ Final Warning

This tool is for **educational purposes**. Scraping LinkedIn:
- Violates LinkedIn's Terms of Service
- May result in account suspension
- Could lead to legal action
- Requires privacy law compliance (GDPR, CCPA)

**Recommended alternative**: Use the [LinkedIn API](https://developer.linkedin.com/) for legitimate data access.
