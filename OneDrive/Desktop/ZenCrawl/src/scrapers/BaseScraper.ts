import { Browser, Page, chromium } from 'playwright';
import { Logger } from '../utils/logger';
import TurndownService from 'turndown';
import crypto from 'crypto';

export interface ScrapingOptions {
  timeout?: number;
  waitForSelector?: string;
  extractMainContent?: boolean;
  excludeSelectors?: string[];
  includeSelectors?: string[];
  userAgent?: string;
  viewport?: { width: number; height: number };
  waitFor?: number; // ms to wait after navigation
  useStealth?: boolean;
  output?: {
    markdown?: boolean;
    links?: boolean;
    html?: 'cleaned' | 'raw';
    screenshot?: 'viewport' | 'full';
  };
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
}

export interface ScrapingResult {
  markdown?: string;
  links?: string[];
  html?: string;
  screenshot?: string;
  metadata: Record<string, any>;
  scrapeId: string;
}

export class BaseScraper {
  protected browser: Browser | null = null;
  protected logger: Logger;
  private turndown: TurndownService;
  private defaultUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  constructor() {
    this.logger = new Logger('BaseScraper');
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*'
    });
  }

  protected async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-site-isolation-trials'
        ]
      });
    }
  }

  public async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  protected async createPage(options: ScrapingOptions = {}): Promise<Page> {
    if (!this.browser) {
      await this.initialize();
    }
    const page = await this.browser!.newPage();
    
    // Set viewport
    await page.setViewportSize(options.viewport || { width: 1920, height: 1080 });
    
    // Set user agent
    await page.setExtraHTTPHeaders({
      'User-Agent': options.userAgent || this.defaultUserAgent
    });

    // Add stealth scripts
    await page.addInitScript(() => {
      // Overwrite the 'navigator.webdriver' property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });

      // Overwrite the 'plugins' property
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });

      // Overwrite the 'languages' property
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en']
      });
    });

    return page;
  }

  public async scrape(url: string, options: ScrapingOptions = {}): Promise<ScrapingResult> {
    const page = await this.createPage(options);
    try {
      // Retry logic for navigation
      const maxRetries = 3;
      let response = null;
      let lastError = null;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          response = await page.goto(url, {
            waitUntil: options.waitUntil || 'domcontentloaded',
            timeout: options.timeout || 60000
          });
          if (!response) throw new Error('Failed to load page');
          break;
        } catch (error) {
          lastError = error;
          if (attempt < maxRetries - 1) {
            this.logger.warn(`Retrying navigation to ${url} (attempt ${attempt + 2})...`);
            await page.waitForTimeout(2000);
          } else {
            throw error;
          }
        }
      }

      const status = response?.status();
      if (status && status >= 400) {
        throw new Error(`HTTP ${status}: ${response?.statusText()}`);
      }

      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector);
      }

      // Wait for any dynamic content to load
      if (options.waitFor) {
        await page.waitForTimeout(options.waitFor);
      } else {
        await page.waitForTimeout(2000);
      }

      let html = '';
      let content = '';
      let markdown = '';
      let links: string[] = [];
      let screenshot: string | undefined = undefined;

      // HTML output
      if (options.output?.html === 'raw') {
        html = await page.content();
      } else if (options.output?.html === 'cleaned' || options.extractMainContent) {
        content = await this.extractContent(page, options);
        html = content;
      }

      // Markdown output
      if (options.output?.markdown) {
        markdown = this.convertToMarkdown(content || html);
      }

      // Links output
      if (options.output?.links) {
        links = await this.extractLinks(page);
      }

      // Screenshot output
      if (options.output?.screenshot) {
        screenshot = await this.captureScreenshot(page, options.output.screenshot);
      }

      const scrapeId = crypto.randomUUID();

      return {
        markdown: options.output?.markdown ? markdown : undefined,
        links: options.output?.links ? links : undefined,
        html: options.output?.html ? html : undefined,
        screenshot: options.output?.screenshot ? screenshot : undefined,
        metadata: await this.extractMetadata(page),
        scrapeId
      };
    } catch (error) {
      this.logger.error(`Error scraping ${url}:`, error);
      throw error;
    } finally {
      await page.close();
    }
  }

  protected async extractContent(page: Page, options: ScrapingOptions): Promise<string> {
    if (options.extractMainContent) {
      // Try to find the main content using common selectors
      const mainContentSelectors = [
        'article',
        'main',
        '[role="main"]',
        '.main-content',
        '#main-content',
        '.post-content',
        '.article-content',
        '.entry-content',
        '.content',
        '#content',
        '.post',
        '.article'
      ];

      for (const selector of mainContentSelectors) {
        const element = await page.$(selector);
        if (element) {
          // Remove unwanted elements
          if (options.excludeSelectors) {
            for (const excludeSelector of options.excludeSelectors) {
              await page.evaluate((sel) => {
                document.querySelectorAll(sel).forEach((el: Element) => el.remove());
              }, excludeSelector);
            }
          }
          return await element.innerHTML();
        }
      }

      // If no main content found, try to extract the most relevant content
      return await page.evaluate(() => {
        // Remove unwanted elements
        const unwantedSelectors = [
          'header',
          'footer',
          'nav',
          'aside',
          'script',
          'style',
          'noscript',
          'iframe',
          'form',
          '.ad',
          '.advertisement',
          '.banner',
          '.sidebar',
          '.menu',
          '.navigation',
          '.cookie-banner',
          '.popup',
          '.modal',
          '.overlay'
        ];

        unwantedSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach((el: Element) => el.remove());
        });

        // Get the body content
        return document.body.innerHTML;
      });
    }
    return await page.content();
  }

  protected async extractMetadata(page: Page): Promise<Record<string, any>> {
    return await page.evaluate(() => {
      const metadata: Record<string, any> = {};
      
      // Extract meta tags
      document.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          // Handle array values for certain meta tags
          if (['og:title', 'og:description', 'og:image', 'og:url'].includes(name)) {
            if (!metadata[name]) {
              metadata[name] = [content];
            } else {
              metadata[name].push(content);
            }
          } else {
            metadata[name] = content;
          }
        }
      });

      // Add additional metadata fields
      metadata.language = document.documentElement.lang || 'en-US';
      metadata.favicon = document.querySelector('link[rel="icon"]')?.getAttribute('href') || '';
      metadata.sourceURL = window.location.href;
      metadata.url = window.location.href;
      metadata.statusCode = 200;
      metadata.title = document.title;

      // Add duplicate fields with different names
      if (metadata['og:title']) {
        metadata.ogTitle = Array.isArray(metadata['og:title']) ? metadata['og:title'][0] : metadata['og:title'];
      }
      if (metadata['og:description']) {
        metadata.ogDescription = Array.isArray(metadata['og:description']) ? metadata['og:description'][0] : metadata['og:description'];
      }
      if (metadata['og:image']) {
        metadata.ogImage = Array.isArray(metadata['og:image']) ? metadata['og:image'][0] : metadata['og:image'];
      }
      if (metadata['og:url']) {
        metadata.ogUrl = Array.isArray(metadata['og:url']) ? metadata['og:url'][0] : metadata['og:url'];
      }
      if (metadata['og:site_name']) {
        metadata.ogSiteName = metadata['og:site_name'];
      }

      // Add viewport if not present
      if (!metadata.viewport) {
        metadata.viewport = 'width=device-width, initial-scale=1';
      }

      // Add twitter card if not present
      if (!metadata['twitter:card']) {
        metadata['twitter:card'] = 'summary';
      }

      // Add og:type if not present
      if (!metadata['og:type']) {
        metadata['og:type'] = 'website';
      }

      // Remove scrapeId from metadata
      delete metadata.scrapeId;

      return metadata;
    });
  }

  private convertToMarkdown(html: string): string {
    try {
      let markdown = this.turndown.turndown(html);
      
      // Fix link format to include "Redirect to" text
      markdown = markdown.replace(/\[([^\]]*?)\]\(([^)]+)\)/g, (match, text, url) => {
        if (!text.trim()) {
          return `[Redirect to ${url}](${url})`;
        }
        return match;
      });

      // Fix image format to not include "Redirect to" text
      markdown = markdown.replace(/!\[Redirect to ([^\]]+)\]\(([^)]+)\)/g, '![$1]($2)');

      // Remove any CSS styling from the beginning
      markdown = markdown.replace(/^\.eapps-slider.*?\n\n/s, '');
      
      // Ensure proper line breaks
      markdown = markdown.replace(/\n{3,}/g, '\n\n');
      
      return markdown;
    } catch (error) {
      this.logger.error('Error converting HTML to Markdown:', error);
      return '';
    }
  }

  protected async extractLinks(page: Page): Promise<string[]> {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors
      .map(a => a.getAttribute('href'))
      .filter((href): href is string => href !== null);
  }

  protected async captureScreenshot(page: Page, type: 'viewport' | 'full'): Promise<string> {
    const screenshotOptions = {
      type: 'png' as const,
      fullPage: type === 'full'
    };
    
    const buffer = await page.screenshot(screenshotOptions);
    return buffer.toString('base64');
  }
} 