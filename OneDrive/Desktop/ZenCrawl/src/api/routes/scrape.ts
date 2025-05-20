import { Router } from 'express';
import { z } from 'zod';
import { BaseScraper, ScrapingOptions } from '../../scrapers/BaseScraper';
import { Logger } from '../../utils/logger';

const router = Router();
const logger = new Logger('ScrapeAPI');
const scraper = new BaseScraper();

const outputSchema = z.object({
  markdown: z.boolean().optional(),
  links: z.boolean().optional(),
  html: z.enum(['cleaned', 'raw']).optional(),
  screenshot: z.enum(['viewport', 'full']).optional(),
});

const scrapeSchema = z.object({
  url: z.string().url(),
  options: z.object({
    timeout: z.number().optional(),
    waitForSelector: z.string().optional(),
    extractMainContent: z.boolean().optional(),
    excludeSelectors: z.array(z.string()).optional(),
    includeSelectors: z.array(z.string()).optional(),
    userAgent: z.string().optional(),
    viewport: z.object({ width: z.number(), height: z.number() }).optional(),
    waitFor: z.number().optional(),
    useStealth: z.boolean().optional(),
    output: outputSchema.optional(),
  }).partial().optional(),
});

router.post('/', async (req, res) => {
  const parseResult = scrapeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, error: parseResult.error.errors });
  }

  const { url, options } = parseResult.data;

  try {
    const result = await scraper.scrape(url, options as ScrapingOptions);
    
    // Return all possible output fields
    return res.json({
      markdown: result.markdown,
      links: result.links,
      html: result.html,
      screenshot: result.screenshot,
      metadata: result.metadata,
      scrapeId: result.scrapeId
    });
  } catch (error: any) {
    logger.error('Error processing scrape request:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

export default router; 