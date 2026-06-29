// src/utils/output.ts
import { createObjectCsvWriter } from 'csv-writer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { Tweet } from '../scrapers/user.js';
import { logger } from './logger.js';
import { ScraperOptions } from '../index.js';

export async function saveResults(tweets: Tweet[], prefix: string, options: ScraperOptions): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${prefix}_${timestamp}`;
  
  if (!existsSync(options.outputDir)) {
    mkdirSync(options.outputDir, { recursive: true });
  }

  if (options.outputFormat === 'json') {
    const filepath = `${options.outputDir}/${filename}.json`;
    writeFileSync(filepath, JSON.stringify(tweets, null, 2));
    logger.info(`Saved ${tweets.length} tweets to ${filepath}`);
  } else {
    const filepath = `${options.outputDir}/${filename}.csv`;
    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'id', title: 'Tweet ID' },
        { id: 'url', title: 'URL' },
        { id: 'text', title: 'Text' },
        { id: 'author_username', title: 'Author Username' },
        { id: 'author_display_name', title: 'Author Display Name' },
        { id: 'author_verified', title: 'Verified' },
        { id: 'likes', title: 'Likes' },
        { id: 'retweets', title: 'Retweets' },
        { id: 'replies', title: 'Replies' },
        { id: 'quotes', title: 'Quotes' },
        { id: 'created_at', title: 'Created At' },
        { id: 'is_retweet', title: 'Is Retweet' },
        { id: 'is_reply', title: 'Is Reply' },
      ],
    });

    const records = tweets.map(tweet => ({
      id: tweet.id,
      url: tweet.url,
      text: tweet.text,
      author_username: tweet.author.username,
      author_display_name: tweet.author.displayName,
      author_verified: tweet.author.verified,
      likes: tweet.metrics.likes,
      retweets: tweet.metrics.retweets,
      replies: tweet.metrics.replies,
      quotes: tweet.metrics.quotes,
      created_at: tweet.createdAt,
      is_retweet: tweet.isRetweet,
      is_reply: tweet.isReply,
    }));

    await csvWriter.writeRecords(records);
    logger.info(`Saved ${tweets.length} tweets to ${filepath}`);
  }
}