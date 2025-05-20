import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper, ScrapingOptions } from '../../scrapers/BaseScraper';

const router = Router();

const searchSchema = z.object({
  query: z.string().min(1),
  country: z.string().optional(),
  language: z.string().optional(),
  num: z.number().min(1).max(50).optional(),
  scrapeContent: z.boolean().optional(),
  // timeBased: z.string().optional(), // Not supported by DuckDuckGo HTML
});

router.post('/', async (req, res) => {
  const parseResult = searchSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, error: parseResult.error.errors });
  }

  const { query, country, language, num = 10, scrapeContent = false } = parseResult.data;
  try {
    // Build DuckDuckGo search URL
    let klParam = '';
    if (country && language) {
      klParam = `${country}-${language}`;
    } else if (country) {
      klParam = country;
    } else if (language) {
      klParam = language;
    }
    let ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    if (klParam) {
      ddgUrl += `&kl=${encodeURIComponent(klParam)}`;
    }
    const { data } = await axios.get(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });
    const $ = cheerio.load(data);
    const results: { title: string; url: string; snippet: string; content?: any }[] = [];
    $(".result").each((_, el) => {
      if (results.length >= num) return false;
      const title = $(el).find('.result__title').text().trim();
      const url = $(el).find('.result__url').attr('href') || '';
      const snippet = $(el).find('.result__snippet').text().trim();
      if (title && url) {
        results.push({ title, url, snippet });
      }
    });

    if (scrapeContent && results.length > 0) {
      const scraper = new BaseScraper();
      for (const result of results) {
        try {
          // Use minimal scraping options for speed
          const scrapeOptions: ScrapingOptions = {
            output: { markdown: true, html: 'cleaned' },
            extractMainContent: true,
            timeout: 15000,
          };
          const pageResult = await scraper.scrape(result.url, scrapeOptions);
          result.content = {
            markdown: pageResult.markdown,
            html: pageResult.html,
            metadata: pageResult.metadata,
          };
        } catch (err) {
          result.content = { error: (err as Error).message };
        }
      }
      await scraper.cleanup();
    }

    return res.json({ query, count: results.length, results });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch search results' });
  }
});

export default router; 