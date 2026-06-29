// src/browser.ts
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { logger } from './utils/logger.js';

export interface BrowserOptions {
  headless: boolean;
}

export async function setupBrowser(headless: boolean = true): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
  logger.info(`Launching browser (headless: ${headless})`);
  
  const browser = await chromium.launch({
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
  });

  // Add cookies if provided
  const authToken = process.env.TWITTER_AUTH_TOKEN;
  const ct0 = process.env.TWITTER_CT0;
  
  if (authToken && ct0) {
    await context.addCookies([
      {
        name: 'auth_token',
        value: authToken,
        domain: '.twitter.com',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      },
      {
        name: 'ct0',
        value: ct0,
        domain: '.twitter.com',
        path: '/',
        httpOnly: false,
        secure: true,
        sameSite: 'None',
      },
    ]);
    logger.info('Added Twitter authentication cookies');
  } else {
    logger.warn('No Twitter auth cookies provided - scraping may be limited');
  }

  const page = await context.newPage();
  
  // Block unnecessary resources to speed up
  await page.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    if (['image', 'font', 'media', 'stylesheet'].includes(resourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  return { browser, context, page };
}

export async function closeBrowser(browser: Browser): Promise<void> {
  await browser.close();
  logger.info('Browser closed');
}