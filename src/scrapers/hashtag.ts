// src/scrapers/hashtag.ts
import { Page } from 'playwright';
import { Tweet } from './user.js';
import { logger } from '../utils/logger.js';

export async function scrapeHashtag(page: Page, hashtag: string, maxTweets: number): Promise<Tweet[]> {
  const tag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
  const url = `https://twitter.com/hashtag/${tag}?src=hashtag_click&f=live`;
  
  logger.info(`Scraping hashtag: #${tag}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 30000 });
    
    // Actual scraping implementation would go here
    return [];
  } catch (error) {
    logger.error(`Failed to scrape hashtag ${hashtag}:`, error);
    throw error;
  }
}

export async function scrapeHashtagTop(page: Page, hashtag: string, maxTweets: number): Promise<Tweet[]> {
  const tag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
  const url = `https://twitter.com/hashtag/${tag}?src=hashtag_click&f=top`;
  
  return scrapeHashtag(page, hashtag, maxTweets);
}