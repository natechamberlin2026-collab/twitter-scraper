# Twitter/X Scraper — CLI Usage Guide

---

## Installation

```bash
git clone https://github.com/natechamberlin2026-collab/twitter-scraper
cd twitter-scraper
npm install
npx playwright install chromium
cp .env.example .env
# Edit .env with your Twitter auth cookies
```

---

## Authentication (Required)

Twitter/X requires authentication for most scraping. Export cookies from browser:

1. Log into Twitter/X in Chrome/Firefox
2. Open DevTools → Application → Cookies → https://twitter.com
3. Copy these values:
   - `auth_token` → `TWITTER_AUTH_TOKEN`
   - `ct0` → `TWITTER_CT0`

```bash
# .env
TWITTER_AUTH_TOKEN=your_auth_token_here
TWITTER_CT0=your_csrf_token_here
HEADLESS=true
SCROLL_DELAY_MS=2000
MAX_TWEETS=100
OUTPUT_DIR=./output
OUTPUT_FORMAT=json
```

---

## Commands

### Scrape User Timeline
```bash
# Basic
npm run scrape:user -- elonmusk

# With options
npm run scrape:user -- elonmusk --max 50 --headless --output ./data --format csv

# Or direct
node dist/index.js user elonmusk --max 50 --headless
```

### Scrape Search Results
```bash
# Basic
npm run scrape:search -- "ai automation"

# With options
npm run scrape:search -- "open source" --max 100 --format json
```

### Scrape Hashtag
```bash
# Basic
npm run scrape:hashtag -- "#buildinpublic"

# With options
npm run scrape:hashtag -- "#typescript" --max 200 --output ./hashtag-data
```

---

## Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--max` | `-m` | Maximum tweets to scrape | 100 |
| `--headless` | | Run browser headless | true |
| `--output` | `-o` | Output directory | ./output |
| `--format` | `-f` | Output format (json/csv) | json |

---

## Output Format

### JSON (Default)
```json
[
  {
    "id": "1234567890",
    "url": "https://twitter.com/user/status/1234567890",
    "text": "Tweet content here...",
    "author": {
      "id": "12345",
      "username": "elonmusk",
      "displayName": "Elon Musk",
      "verified": true
    },
    "metrics": {
      "likes": 10000,
      "retweets": 5000,
      "replies": 2000,
      "quotes": 500
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "media": [
      { "type": "photo", "url": "https://pbs.twimg.com/media/xxx.jpg" }
    ],
    "isRetweet": false,
    "isReply": false
  }
]
```

### CSV
| tweet_id | url | text | author_username | author_display_name | verified | likes | retweets | replies | quotes | created_at | is_retweet | is_reply |
|----------|-----|------|-----------------|---------------------|----------|-------|----------|---------|--------|------------|------------|----------|

---

## Architecture

```
src/
├── index.ts              # CLI entry (commander.js)
├── browser.ts            # Playwright setup + cookie auth
├── scrapers/
│   ├── user.ts           # User timeline/likes
│   ├── search.ts         # Search queries
│   └── hashtag.ts        # Hashtag pages
├── utils/
│   ├── logger.ts         # Winston logging
│   └── output.ts         # JSON/CSV export
└── types.ts              # Shared interfaces
```

---

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/scraper.yml
# Runs daily at 6 AM UTC, or manual trigger
# Artifacts uploaded as downloadable JSON/CSV
```

**Trigger manually:**
1. GitHub → Actions → Twitter Scraper Demo → Run workflow
2. Choose: user/search/hashtag
3. Enter target + max tweets
3. Download artifacts from run summary

---

## Limitations & Ethics

⚠️ **Important:**
- Respect Twitter's Terms of Service
- Rate limit: ~100 tweets/minute recommended
- Only scrape public data
- Don't spam or harass
- Consider official API for production use

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Login required" | Refresh auth_token/ct0 cookies |
| "Rate limited" | Increase SCROLL_DELAY_MS, reduce MAX_TWEETS |
| "No tweets found" | Check account exists, tweets not protected |
| Playwright errors | `npx playwright install chromium --with-deps` |
| Empty output | Verify cookies valid, try smaller max first |

---

## License

MIT — Use responsibly.