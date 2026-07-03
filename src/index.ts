// src/index.ts
import { program } from 'commander';
import { scrapeUserTweets } from './scrapers/user.js';
import { scrapeSearch } from './scrapers/search.js';
import { scrapeHashtag } from './scrapers/hashtag.js';
import { setupBrowser, closeBrowser } from './browser.js';
import { logger } from './utils/logger.js';
import { saveResults } from './utils/output.js';
import dotenv from 'dotenv';

dotenv.config();

interface ScraperOptions {
  headless: boolean;
  maxTweets: number;
  scrollDelay: number;
  outputDir: string;
  outputFormat: 'json' | 'csv';
}

const defaultOptions: ScraperOptions = {
  headless: process.env.HEADLESS === 'true',
  maxTweets: parseInt(process.env.MAX_TWEETS || '100'),
  scrollDelay: parseInt(process.env.SCROLL_DELAY_MS || '2000'),
  outputDir: process.env.OUTPUT_DIR || './output',
  outputFormat: (process.env.OUTPUT_FORMAT as 'json' | 'csv') || 'json',
};

program
  .name('twitter-scraper')
  .description('Twitter/X scraper using Playwright')
  .version('1.0.0');

program
  .command('user <username>')
  .description('Scrape tweets from a user profile')
  .option('-m, --max <number>', 'Maximum tweets to scrape', String, defaultOptions.maxTweets.toString())
  .option('--headless', 'Run in headless mode', defaultOptions.headless)
  .option('-o, --output <dir>', 'Output directory', defaultOptions.outputDir)
  .option('-f, --format <type>', 'Output format (json|csv)', defaultOptions.outputFormat)
  .action(async (username, options) => {
    const opts = { ...defaultOptions, ...options, maxTweets: parseInt(options.max) };
    logger.info(`Starting user scrape for @${username}`);
    const browser = await setupBrowser(opts.headless);
    try {
      const tweets = await scrapeUserTweets(browser, username, opts);
      await saveResults(tweets, username, opts);
      logger.info(`Scraped ${tweets.length} tweets from @${username}`);
    } catch (error) {
      logger.error('Scraping failed:', error);
      process.exit(1);
    } finally {
      await closeBrowser(browser);
    }
  });

program
  .command('search <query>')
  .description('Scrape tweets from search results')
  .option('-m, --max <number>', 'Maximum tweets to scrape', String, defaultOptions.maxTweets.toString())
  .option('--headless', 'Run in headless mode', defaultOptions.headless)
  .option('-o, --output <dir>', 'Output directory', defaultOptions.outputDir, defaultOptions.outputDir)
  .option('-f, --format <type>', 'Output format (json|csv)', defaultOptions.outputFormat)
  .action(async (query, options) => {
    const opts = { ...defaultOptions, ...options, maxTweets: parseInt(options.max) };
    logger.info(`Starting search scrape for: ${query}`);
    const browser = await setupBrowser(opts.headless);
    try {
      const tweets = await scrapeSearch(browser, query, opts);
      await saveResults(tweets, `search_${query.replace(/\s+/g, '_')}`, opts);
      logger.info(`Scraped ${tweets.length} tweets for search: ${query}`);
    } catch (error) {
      logger.error('Scraping failed:', error);
      process.exit(1);
    } finally {
      await closeBrowser(browser);
    }
  });

program
  .command('hashtag <hashtag>')
  .description('Scrape tweets from a hashtag')
  .option('-m, --max <number>', 'Maximum tweets to scrape', String, defaultOptions.maxTweets.toString())
  .option('--headless', 'Run in headless mode', defaultOptions.headless)
  .option('-o, --output <dir>', 'Output directory', defaultOptions.outputDir)
  .option('-f, --format <type>', 'Output format (json|csv)', defaultOptions.outputFormat)
  .action(async (hashtag, options) => {
    const opts = { ...defaultOptions, ...options, maxTweets: parseInt(options.max) };
    const tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    logger.info(`Starting hashtag scrape for ${tag}`);
    const browser = await setupBrowser(opts.headless);
    try {
      const tweets = await scrapeHashtag(browser, tag, opts);
      await saveResults(tweets, `hashtag_${tag.replace('#', '')}`, opts);
      logger.info(`Scraped ${tweets.length} tweets for ${tag}`);
    } catch (error) {
      logger.error('Scraping failed:', error);
      process.exit(1);
    } finally {
      await closeBrowser(browser);
    }
  });

program.parse(process.argv);