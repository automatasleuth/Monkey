# Monkey - Intelligent Web Crawler Agent

A smart web crawler built with Selenium and Google's ADK (Agent Development Kit) that combines web automation with natural language understanding. This agent can navigate websites, interact with elements, and perform tasks based on natural language commands.

## Features

### Core Functionality
- Automated web browsing with Selenium WebDriver
- Natural language command processing via Google ADK
- Interactive web interface for agent control
- Screenshot capture and saving
- Page source extraction
- Element finding and interaction
- Error handling and logging

### Web Interaction Capabilities
- Navigate to URLs
- Find elements using multiple strategies:
  - ID
  - Name
  - XPath
  - CSS Selector
  - Class Name
  - Tag Name
- Click elements
- Enter text into form fields
- Wait for elements to load
- Scroll pages
- Take screenshots

## Prerequisites

- Python 3.11 or higher
- Google Cloud account (for ADK features)
- Chrome browser installed

## Installation

1. Clone this repository:
   ```bash
   git clone [your-repo-url]
   cd stacc
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Unix or MacOS:
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

## Configuration

Create a `.env` file in the project root with the following variables:

```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=your-location
MODEL=gemini-2.0-flash-001
BROWSER_HEADLESS=False
SCREENSHOT_DIR=./screenshots
```

## Usage

### Using the Web Interface

1. Start the ADK web interface:
   ```bash
   adk web
   ```

2. Open your browser and navigate to `http://localhost:8000/dev-ui`

3. Select "stacc" from the dropdown menu

4. Start interacting with natural language commands like:
   - "Go to example.com and take a screenshot"
   - "Visit google.com and search for 'python selenium'"
   - "Find all links on the current page"

### Using the Python API

```python
from stacc.crawler import WebCrawler

# Initialize the crawler
crawler = WebCrawler(headless=False)

try:
    # Navigate to a URL
    crawler.go_to_url("https://example.com")
    
    # Find and click an element
    crawler.click_element_with_text("Click Me")
    
    # Wait for an element
    crawler.wait_for_element("id", "my-element", timeout=10)
    
    # Take a screenshot
    crawler.take_screenshot("example.png")
    
finally:
    crawler.close()
```

## Current Limitations

- Basic element interaction capabilities
- Limited error recovery
- No built-in rate limiting
- No advanced authentication handling
- Single tab/window operation
- Basic screenshot functionality

## Planned Features

- Multi-tab/window support
- Advanced authentication handling
- Smart rate limiting and retry logic
- Data extraction and parsing
- Proxy support
- Pattern recognition
- CAPTCHA handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Built with [Selenium WebDriver](https://www.selenium.dev/)
- Powered by [Google ADK](https://github.com/google/adk)
- Uses [Chrome WebDriver](https://chromedriver.chromium.org/) 