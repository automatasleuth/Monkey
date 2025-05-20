import { Router } from 'express';
import { z } from 'zod';
import { BaseScraper, ScrapingOptions } from '../../scrapers/BaseScraper';
import pLimit from 'p-limit';
import { URL } from 'url';

const router = Router();

const outputSchema = z.object({
  markdown: z.boolean().optional(),
  links: z.boolean().optional(),
  html: z.enum(['cleaned', 'raw']).optional(),
  screenshot: z.enum(['viewport', 'full']).optional(),
});

const pageOptionsSchema = z.object({
  excludeTags: z.string().optional(),
  includeOnlyTags: z.string().optional(),
  waitFor: z.number().optional(),
  timeout: z.number().optional(),
  extractMainContent: z.boolean().optional(),
  useStealth: z.boolean().optional(),
});

const crawlSchema = z.object({
  rootUrl: z.string().url(),
  limit: z.number().optional(),
  maxDepth: z.number().optional(),
  excludePaths: z.array(z.string()).optional(),
  includeOnlyPaths: z.array(z.string()).optional(),
  ignoreSitemap: z.boolean().optional(),
  allowBackwardsLinks: z.boolean().optional(),
  pageOptions: pageOptionsSchema.optional(),
  output: outputSchema.optional(),
});

function pathMatches(url: string, patterns?: string[]): boolean {
  if (!patterns || patterns.length === 0) return true;
  return patterns.some(pattern => {
    try {
      return new RegExp(pattern).test(url);
    } catch {
      return false;
    }
  });
}

router.post('/', async (req, res) => {
  const parseResult = crawlSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, error: parseResult.error.errors });
  }

  const {
    rootUrl,
    limit = 10,
    maxDepth = 3,
    excludePaths = [],
    includeOnlyPaths = [],
    pageOptions = {},
    output = {},
  } = parseResult.data;

  const concurrency = 3;
  const limitConcurrency = pLimit(concurrency);
  const queue: { url: string; depth: number }[] = [{ url: rootUrl, depth: 0 }];
  const visited = new Set<string>();
  const results: Record<string, any> = {};
  const scraper = new BaseScraper();
  const rootDomain = new URL(rootUrl).hostname.replace(/^www\./, '');

  while (queue.length > 0 && visited.size < limit) {
    const batch = queue.splice(0, concurrency);
    await Promise.all(batch.map(({ url, depth }) => limitConcurrency(async () => {
      if (visited.has(url) || depth > maxDepth || visited.size >= limit) return;
      if (excludePaths.length && pathMatches(url, excludePaths)) return;
      if (includeOnlyPaths.length && !pathMatches(url, includeOnlyPaths)) return;
      visited.add(url);
      try {
        // Scrape the page
        const scrapeOptions: ScrapingOptions = {
          ...pageOptions,
          output,
        };
        const result = await scraper.scrape(url, scrapeOptions);
        results[url] = result;
        // Extract links for further crawling
        if (result.links) {
          for (const link of result.links) {
            try {
              const absUrl = new URL(link, url);
              const linkDomain = absUrl.hostname.replace(/^www\./, '');
              // Only crawl internal links
              if (linkDomain === rootDomain && !visited.has(absUrl.href)) {
                queue.push({ url: absUrl.href, depth: depth + 1 });
              }
            } catch {
              // Ignore invalid URLs
            }
          }
        }
      } catch (err) {
        results[url] = { error: (err as Error).message };
      }
    })));
  }

  await scraper.cleanup();
  return res.json({
    rootUrl,
    crawled: Object.keys(results).length,
    results,
  });
});

export default router; 