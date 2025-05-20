# ZenCrawl: System Architecture & User Flow

## 🧭 End-to-End Workflow (Frontend → Backend)

### 1. 🧑‍💻 User Interaction (Frontend UI)
Users interact with the ZenCrawl dashboard to access the 4 core tools:

- **Scrape Tab**: Input URL → click “Scrape”
- **Map Tab**: Input domain → click “Map Site”
- **Crawl Tab**: Input root URL + settings → click “Crawl Site”
- **Search Tab**: Input query → click “Search and Extract”

Each form sends a request to the backend API.

> **Tech**: `Next.js`, `TailwindCSS` or `ShadCN`, deployed on Vercel

---

### 2. 🛰️ Frontend → Backend API

Each user action hits a specific REST endpoint:

| Tool     | Endpoint         | Method | Payload Example                  |
|----------|------------------|--------|----------------------------------|
| Scrape   | `/api/scrape`    | POST   | `{ "url": "...", "options": {} }` |
| Map      | `/api/map`       | POST   | `{ "rootUrl": "...", "subdomains": true }` |
| Crawl    | `/api/crawl`     | POST   | `{ "rootUrl": "...", "depth": 3, "filters": {} }` |
| Search   | `/api/search`    | POST   | `{ "query": "AI tools", "country": "us" }` |

> **Tech**: Node.js / Express or FastAPI

---

### 3. 🔧 Backend Logic (Scraping Engine)

Jobs are delegated to specialized workers:

#### ✅ ScrapeWorker
- Scrapes a single page using Playwright or Firecrawl SDK
- Extracts clean Markdown, HTML, JSON

#### ✅ MapWorker
- Visits homepage
- Extracts and deduplicates all internal links

#### ✅ CrawlWorker
- Recursively crawls all subpages up to max depth
- Applies rate limits, path filters

#### ✅ SearchWorker
- Queries search engine (via API or SERP proxy)
- Optionally scrapes content from resulting pages

> **Tech**: Firecrawl, Playwright, Puppeteer  
> **Queue**: BullMQ (Node.js) or Celery (Python)

---

### 4. 🧠 (Optional) AI Middleware

Inject AI post-processing where needed:

- Summarize or chunk scraped content
- Classify type of page (blog, product, legal, etc.)
- Extract entities, metadata, keywords
- Format for vector DBs (e.g., embeddings)

> **Tech**: OpenAI, Claude, Mistral, LangChain

---

### 5. 📦 Return Processed Data to Frontend

- Store in Supabase or S3-compatible storage
- Return link or preview to user
- Display Markdown, JSON, screenshots inline

---

## 📊 Architecture Diagram (Text Representation)

```
[ User ]
   │
   ▼
[ Web UI - Next.js ]
   │
   ├── POST /api/scrape   ──▶ [ ScrapeWorker ]
   ├── POST /api/map      ──▶ [ MapWorker ]
   ├── POST /api/crawl    ──▶ [ CrawlWorker ]
   ├── POST /api/search   ─
