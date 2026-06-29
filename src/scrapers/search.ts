// src/scrapers/search.ts
import { Page } from 'playwright';
import { Tweet } from './user.js';
import { logger } from '../utils/logger.js';

export async function scrapeSearch(page: Page, query: string, maxTweets: number): Promise<Tweet[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://twitter.com/search?q=${encodedQuery}&src=typed_query&f=live`;
  
  logger.info(`Scraping search: ${query}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 30000 });
    
    // Actual scraping implementation would go here
    // Using page.evaluate to extract tweet data
    return [];
  } catch (error) {
    logger.error(`Failed to scrape search ${query}:`, error);
    throw error;
  }
}

export async function scrapeLatest(page: Page, query: string, maxTweets: number): Promise<Tweet[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://twitter.com/search?q=${encodedQuery}&src=typed_query&f=live`;
  
  return scrapeSearch(page, query, maxTweets);
}

export async function scrapeTop(page: Page, query: string, maxTweets: number): Promise<Tweet[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://twitter.com/search?q=${encodedQuery}&src=typed_query&f=top`;
  
  logger.info(`Scraping top tweets for: ${query}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 30000 });
    return [];
  } catch (error) {
    logger.error(`Failed to scrape top tweets for ${query}:`, error);
    throw error;
  }
}