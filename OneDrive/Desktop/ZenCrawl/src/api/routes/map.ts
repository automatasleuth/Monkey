import { Router } from 'express';
import { z } from 'zod';
import { MapScraper } from '../../scrapers/MapScraper';

const router = Router();
const mapScraper = new MapScraper();

const mapSchema = z.object({
  rootUrl: z.string().url(),
  search: z.string().optional(),
  subdomains: z.boolean().optional(),
  ignoreSitemap: z.boolean().optional(),
});

router.post('/', async (req, res) => {
  const parseResult = mapSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, error: parseResult.error.errors });
  }
  const { rootUrl, search, subdomains, ignoreSitemap } = parseResult.data;
  try {
    const result = await mapScraper.mapSite(rootUrl, { search, subdomains, ignoreSitemap });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

export default router; 