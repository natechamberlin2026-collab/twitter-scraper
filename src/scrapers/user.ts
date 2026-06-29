// src/scrapers/user.ts
import { Page } from 'playwright';
import { logger } from '../utils/logger.js';

export interface Tweet {
  id: string;
  url: string;
  text: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    verified: boolean;
  };
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
    quotes: number;
  };
  createdAt: string;
  media?: Array<{
    type: 'photo' | 'video' | 'gif';
    url: string;
  }>;
  isRetweet: boolean;
  isReply: boolean;
}

async function scrollAndCollect(page: Page, maxTweets: number, selector: string): Promise<Tweet[]> {
  const tweets: Tweet[] = [];
  let lastHeight = 0;
  let sameHeightCount = 0;
  const maxSameHeight = 3;

  while (tweets.length < maxTweets) {
    const newTweets = await page.evaluate((sel) => {
      const tweetElements = document.querySelectorAll(sel);
      return Array.from(tweetElements).map(el => {
        // This would be expanded with actual DOM parsing
        return el.outerHTML;
      });
    }, selector);

    // Parse tweets from HTML
    for (const html of newTweets) {
      if (tweets.length >= maxTweets) break;
      const tweet = parseTweetFromHTML(html);
      if (tweet && !tweets.some(t => t.id === tweet.id)) {
        tweets.push(tweet);
      }
    }

    const currentHeight = await page.evaluate('document.body.scrollHeight');
    if (currentHeight === lastHeight) {
      sameHeightCount++;
      if (sameHeightCount >= maxSameHeight) break;
    } else {
      sameHeightCount = 0;
      lastHeight = currentHeight;
    }

    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForTimeout(2000);
  }

  return tweets;
}

function parseTweetFromHTML(html: string): Tweet | null {
  // Simplified - would use proper DOM parsing in production
  try {
    // In production, use a proper parser like cheerio or parse with page.evaluate
    return null;
  } catch {
    return null;
  }
}

export async function scrapeUserTimeline(page: Page, username: string, maxTweets: number): Promise<Tweet[]> {
  logger.info(`Scraping timeline for @${username}`);
  
  try {
    await page.goto(`https://twitter.com/${username}`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 30000 });
    
    // Would implement actual scraping logic here
    // For now returning empty array as template
    return [];
  } catch (error) {
    logger.error(`Failed to scrape user ${username}:`, error);
    throw error;
  }
}

export async function scrapeUserLikes(page: Page, username: string, maxTweets: number): Promise<Tweet[]> {
  logger.info(`Scraping likes for @${username}`);
  
  try {
    await page.goto(`https://twitter.com/${username}/likes`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 30000 });
    return [];
  } catch (error) {
    logger.error(`Failed to scrape likes for ${username}:`, error);
    throw error;
  }
}