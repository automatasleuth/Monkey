# Monkey - Intelligent Web Crawler Agent 🤖

A powerful web automation and data extraction platform that combines advanced web crawling capabilities with intelligent data processing. Monkey provides four core features to help you extract, process, and analyze web data efficiently.

## 🌟 Core Features

### 1. 🔍 Scrape
Transform any URL into clean, structured data with ease.

- **Smart Content Extraction**
  - Converts web pages into clean markdown
  - Handles dynamic content and JavaScript-rendered sites
  - Processes PDFs and images
  - Extracts structured data

- **Advanced Features**
  - Proxy management and rotation
  - Intelligent caching system
  - Rate limit handling
  - JavaScript-blocked content bypass
  - Multiple output formats (markdown, HTML, screenshots)

### 2. 🕷️ Crawl
Recursively explore and extract data from entire websites.

- **Intelligent Crawling**
  - Sitemap analysis and processing
  - Recursive link following
  - Subdomain discovery
  - Depth control and prioritization

- **Smart Processing**
  - Handles JavaScript-rendered content
  - Manages rate limits automatically
  - Bypasses common blockers
  - Converts data to clean markdown
  - Structured data extraction

### 3. 🗺️ Map
Generate comprehensive URL maps of websites at lightning speed.

- **Fast URL Discovery**
  - Rapid website structure analysis
  - Complete URL inventory
  - Subdomain mapping
  - Link relationship visualization

### 4. 🔎 Search
Perform web searches and extract content from results in one operation.

- **Advanced Search Capabilities**
  - Customizable search parameters
  - Language and country targeting
  - Result count control
  - Timeout management

- **Content Extraction**
  - Multiple output formats:
    - Clean markdown
    - HTML
    - Screenshots
    - Raw links
  - Batch processing of search results
  - Intelligent content filtering

## 📋 Prerequisites

- Python 3.11 or higher
- Google Cloud account (for ADK features)
- Chrome browser installed
- Git (for installation)

## 🚀 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/automatasleuth/autocrawl.git
   cd autocrawl
   ```

2. Create and activate a virtual environment:
   ```bash
   # Create virtual environment
   python -m venv venv

   # Activate on Windows
   .\venv\Scripts\activate

   # Activate on Unix or MacOS
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -e .
   ```

4. Set up Google Cloud credentials:
   ```bash
   gcloud auth application-default login
   ```

## ⚙️ Configuration

Create a `.env` file in the project root with the following variables:

```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=your-location
MODEL=gemini-2.0-flash-001
BROWSER_HEADLESS=False
SCREENSHOT_DIR=./screenshots
```

## 💻 Usage Examples

### Scraping
```python
# Basic scraping
"scrape https://example.com"

# Scrape with specific output format
"scrape https://example.com --format markdown"

# Scrape with proxy
"scrape https://example.com --proxy http://proxy.example.com:8080"
```

### Crawling
```python
# Basic crawling
"crawl https://example.com"

# Crawl with depth limit
"crawl https://example.com --depth 3"

# Crawl specific subdomains
"crawl https://example.com --subdomains blog,shop"
```

### Mapping
```python
# Generate URL map
"map https://example.com"

# Map with output file
"map https://example.com --output sitemap.json"
```

### Searching
```python
# Basic search
"search 'python web scraping'"

# Search with content extraction
"search 'python web scraping' --extract"

# Search with specific parameters
"search 'python web scraping' --lang en --country US --limit 10"
```

## 🔧 Troubleshooting

### Common Issues

1. **Rate Limiting**
   - Use proxy rotation
   - Implement request delays
   - Check rate limit headers

2. **JavaScript Rendering**
   - Enable JavaScript rendering
   - Increase wait times
   - Use headless browser mode

3. **Content Blocking**
   - Rotate user agents
   - Use proxy servers
   - Implement request delays

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please:
- Open an issue in the GitHub repository
- Check the [documentation](docs/)
- Join our [Discord community](https://discord.gg/monkey-crawler)

## 🙏 Acknowledgments

- Selenium WebDriver team
- Google ADK team
- All contributors and users of this project 