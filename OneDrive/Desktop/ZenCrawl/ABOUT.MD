# ZenCrawl: Project Specification Document

## Overview
**ZenCrawl** is a SaaS platform designed to transform any website into structured, LLM-ready data. By offering a suite of advanced crawling and scraping capabilities, ZenCrawl enables developers, researchers, and AI startups to extract, clean, and format web content at scale.

---

## Core Value Proposition
> "Turn websites into LLM-ready data. Power your AI apps with clean, structured content from across the web."

ZenCrawl simplifies data acquisition for AI applications by providing four distinct tools—Scrape, Map, Crawl, and Search—that output clean markdown, JSON, and HTML.

---

## Feature Set

### 1. **Scrape**
- **Function**: Extract content from a single page
- **Purpose**: Cleanly capture one-off content with minimal overhead
- **Input**: Single URL
- **Output**: Markdown / JSON / Clean HTML
- **Options**:
  - Exclude/Include Tags
  - Extract only main content
  - Timeout/Wait time customization

### 2. **Map**
- **Function**: Discover and list all internal URLs
- **Purpose**: Fast sitemap generation for downstream tasks
- **Input**: Root URL
- **Output**: Flat list of links (CSV / JSON / Plain text)
- **Options**:
  - Include Subdomains
  - Ignore Sitemap
  - Regex filters for inclusion/exclusion

### 3. **Crawl**
- **Function**: Recursively scrape an entire website
- **Purpose**: Full-site ingestion for training datasets, site backups, competitive analysis
- **Input**: Root URL + rules
- **Output**: Markdown / JSON / Structured Directory
- **Options**:
  - Max Depth
  - Path Filters
  - Sitemap Control
  - Concurrency & Throttling settings

### 4. **Search**
- **Function**: Query the open web and extract full content from result pages
- **Purpose**: Content harvesting based on search intent
- **Input**: Search string
- **Output**: Search result list + extracted page content
- **Options**:
  - Language, Country, Time Range
  - Limit # of results
  - Enable content scraping from search results

---

## Output Format Support
- Markdown (ideal for LLM ingestion)
- JSON (structured key-value format)
- Clean HTML
- Raw HTML
- Screenshots (viewport or full-page)

---

## Target Users
- AI developers / startups
- Market research firms
- SEO professionals
- Data scientists / academic researchers
- News aggregators / analysts

---

## Tech Stack
- **Frontend**: Next.js + Tailwind (Admin dashboard, visual playground)
- **Backend**: Node.js or Python (FastAPI)
- **Scraper Engine**: Playwright / Puppeteer / Firecrawl SDK
- **Database**: Supabase (PostgreSQL) for job logs, user data
- **Storage**: S3-compatible bucket (for markdown, screenshots)
- **Auth**: Clerk/Auth0
- **Billing**: Stripe (usage-based)

---

## Architecture Flow
1. User inputs URL or query in dashboard
2. ZenCrawl processes the task using Firecrawl SDK + custom filters
3. Scraped/Crawled data is formatted and stored
4. Output delivered via UI or downloadable API

---

## Pricing Tiers (Draft)
| Plan        | Monthly Price | Features |
|-------------|----------------|----------|
| Free        | $0             | 10 pages/day, markdown only |
| Pro         | $29            | 500 pages/month, crawl & map |
| Growth      | $99            | 5K pages/month, JSON/API access |
| Enterprise  | Custom         | Dedicated proxy pools, priority compute, API integrations |

---

## Roadmap
### Phase 1: MVP
- Scrape + Map functionalities
- Basic dashboard UI
- Stripe billing

### Phase 2: Crawl + Search
- Recursive crawling
- Google Search integration

### Phase 3: AI Agent Integrations
- Export to LangChain / RAG systems
- Zapier and Make integrations

---

## Competitive Advantage
| Tool         | Scrape | Map | Crawl | Search | Output | Focus |
|--------------|--------|-----|-------|--------|--------|--------|
| ZenCrawl     | ✅     | ✅  | ✅    | ✅     | Markdown, JSON, HTML | LLM data prep |
| Firecrawl    | ✅     | ✅  | ✅    | ✅     | Markdown, HTML        | Devs / Internal Use |
| Browse.ai    | ✅     | ❌  | ✅    | ❌     | CSV, HTML             | Data pipelines |
| Diffbot      | ✅     | ❌  | ✅    | ✅     | JSON (schema)         | Enterprise NLP |

---

## Branding Concepts
- **Name**: ZenCrawl
- **Tagline**: "Structured web data. Instantly."
- **Colors**: Monochrome + Electric Blue or Deep Purple
- **Font**: Modern tech (e.g., Inter, Satoshi, IBM Plex)

---

## Next Steps
- Finalize MVP UI (Playground + Results Viewer)
- Deploy scraping engine with rate-limit & retry logic
- Setup authentication and usage tracking
- Write documentation + onboarding wizard
