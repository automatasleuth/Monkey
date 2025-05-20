import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import pLimit from 'p-limit';

export interface MapResult {
  rootUrl: string;
  internalLinks: string[];
  externalLinks: string[];
  subdomains?: string[];
  searchMatches?: string[];
}

export interface MapOptions {
  search?: string;
  subdomains?: boolean;
  ignoreSitemap?: boolean;
  maxPages?: number;
  maxDepth?: number;
  concurrency?: number;
}

export class MapScraper {
  async mapSite(rootUrl: string, options: MapOptions = {}): Promise<MapResult> {
    const queue: { url: string; depth: number }[] = [{ url: rootUrl, depth: 0 }];
    const visited = new Set<string>();
    const urlObj = new URL(rootUrl);
    const domain = urlObj.hostname.replace(/^www\./, '');
    const internalLinks = new Set<string>();
    const externalLinks = new Set<string>();
    const subdomains = new Set<string>();
    const searchMatches = new Set<string>();
    const maxPages = options.maxPages || 1000;
    const maxDepth = options.maxDepth || 5;
    const concurrency = options.concurrency || 10;
    const limit = pLimit(concurrency);

    const processPage = async (url: string, depth: number) => {
      if (visited.has(url) || depth > maxDepth || visited.size >= maxPages) return;
      visited.add(url);
      try {
        const { data } = await axios.get(url, { timeout: 15000 });
        const $ = cheerio.load(data);
        const links = $('a[href]')
          .map((_, a) => $(a).attr('href') || '')
          .get();

        for (let link of links) {
          if (!link || link.startsWith('javascript:') || link.startsWith('mailto:') || link.startsWith('tel:')) continue;
          try {
            const absUrl = new URL(link, url);
            const linkDomain = absUrl.hostname.replace(/^www\./, '');
            const isInternal = linkDomain === domain || (options.subdomains && linkDomain.endsWith('.' + domain));
            if (isInternal) {
              if (!visited.has(absUrl.href)) {
                queue.push({ url: absUrl.href, depth: depth + 1 });
              }
              internalLinks.add(absUrl.href);
              if (linkDomain !== domain) {
                subdomains.add(absUrl.origin);
              }
            } else {
              externalLinks.add(absUrl.href);
            }
            if (options.search && absUrl.href.toLowerCase().includes(options.search.toLowerCase())) {
              searchMatches.add(absUrl.href);
            }
          } catch {
            // Ignore invalid URLs
          }
        }
      } catch {
        // Ignore fetch errors
      }
    };

    while (queue.length > 0 && visited.size < maxPages) {
      // Process up to `concurrency` pages in parallel
      const batch = queue.splice(0, concurrency);
      await Promise.all(batch.map(({ url, depth }) => limit(() => processPage(url, depth))));
    }

    return {
      rootUrl,
      internalLinks: Array.from(internalLinks),
      externalLinks: Array.from(externalLinks),
      subdomains: options.subdomains ? Array.from(subdomains) : undefined,
      searchMatches: options.search ? Array.from(searchMatches) : undefined,
    };
  }
} 