import os
import time
import logging
from typing import Optional, Union, List, Dict, Any
from pathlib import Path
from datetime import datetime
import uuid

import selenium
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from .screenshot_manager import ScreenshotManager

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebCrawler:
    def __init__(self, headless: Optional[bool] = None, auto_open: bool = True):
        """Initialize the web crawler.
        
        Args:
            headless (bool, optional): Run browser in headless mode. If None, uses value from .env
            auto_open (bool): Whether to open the browser automatically on initialization
        """
        load_dotenv()
        self.headless = headless if headless is not None else os.getenv("BROWSER_HEADLESS", "False").lower() == "true"
        self.screenshot_dir = os.getenv("SCREENSHOT_DIR", "./screenshots")
        self.screenshot_manager = ScreenshotManager(self.screenshot_dir)
        self.driver = None
        self.wait = None
        
        if auto_open:
            self.open_browser()
        
    def open_browser(self) -> str:
        """Open a new browser instance if one isn't already running.
        
        Returns:
            str: Status message
        """
        if self.driver is not None:
            return "Browser is already open"
            
        try:
            logger.info("Opening new browser instance")
            self._setup_driver()
            return "Browser opened successfully"
        except Exception as e:
            error_msg = f"Error opening browser: {str(e)}"
            logger.error(error_msg)
            return error_msg
        
    def _setup_driver(self):
        """Set up the Chrome WebDriver with configured options."""
        try:
            options = Options()
            if self.headless:
                options.add_argument("--headless=new")  # Use new headless mode
            
            # Basic window settings
            options.add_argument("--window-size=1920x1080")
            options.add_argument("--start-maximized")
            
            # Remove automation flags
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            
            # Add user agent to appear as a normal browser
            options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            
            # Add user data directory for persistent profile
            user_data_dir = os.path.join(os.path.expanduser("~"), ".monkey", "chrome_profile")
            os.makedirs(user_data_dir, exist_ok=True)
            options.add_argument(f"--user-data-dir={user_data_dir}")
            options.add_argument("--profile-directory=Default")
            
            # Additional settings to appear more like a normal browser
            options.add_argument("--disable-blink-features=AutomationControlled")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-notifications")
            
            # Add these options to help with stability
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-gpu")
            
            # Try to install and use ChromeDriver
            try:
                service = Service(ChromeDriverManager().install())
                self.driver = selenium.webdriver.Chrome(service=service, options=options)
            except Exception as e:
                logger.warning(f"Failed to use ChromeDriverManager: {str(e)}")
                # Fallback to direct ChromeDriver path
                chrome_driver_path = os.path.join(os.path.expanduser("~"), ".wdm", "drivers", "chromedriver", "win64", "136.0.7103.92", "chromedriver-win32", "chromedriver.exe")
                if os.path.exists(chrome_driver_path):
                    service = Service(chrome_driver_path)
                    self.driver = selenium.webdriver.Chrome(service=service, options=options)
                else:
                    raise Exception("Could not find ChromeDriver")
            
            self.wait = WebDriverWait(self.driver, 10)
            
            # Additional JavaScript to mask automation
            self.driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
                'source': '''
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined
                    })
                '''
            })
            
        except Exception as e:
            logger.error(f"Error setting up driver: {str(e)}")
            # Try one last time with minimal options
            try:
                options = Options()
                options.add_argument("--no-sandbox")
                options.add_argument("--disable-dev-shm-usage")
                service = Service(ChromeDriverManager().install())
                self.driver = selenium.webdriver.Chrome(service=service, options=options)
                self.wait = WebDriverWait(self.driver, 10)
            except Exception as e2:
                raise Exception(f"Failed to initialize browser after multiple attempts: {str(e2)}")
        
    def close(self) -> str:
        """Close the browser.
        
        Returns:
            str: Status message
        """
        try:
            if self.driver is not None:
                logger.info("Closing browser")
                self.driver.quit()
                self.driver = None
                self.wait = None
                return "Browser closed successfully"
            return "Browser is already closed"
        except Exception as e:
            error_msg = f"Error closing browser: {str(e)}"
            logger.error(error_msg)
            return error_msg
    
    def ensure_browser_open(self) -> None:
        """Ensure browser is open before performing operations."""
        if self.driver is None:
            self.open_browser()
        
    def go_to_url(self, url: str) -> str:
        """Navigate to the specified URL.
        
        Args:
            url (str): The URL to navigate to
            
        Returns:
            str: Status message
        """
        try:
            self.ensure_browser_open()
            logger.info(f"Navigating to URL: {url}")
            self.driver.get(url.strip())
            return f"Navigated to URL: {url}"
        except Exception as e:
            error_msg = f"Error navigating to URL: {str(e)}"
            logger.error(error_msg)
            return error_msg
            
    def find_element_with_text(self, text: str) -> str:
        """Find an element containing the specified text.
        
        Args:
            text (str): The text to search for
            
        Returns:
            str: Status message
        """
        try:
            logger.info(f"Looking for element with text: {text}")
            element = self.driver.find_element(By.XPATH, f"//*[contains(text(), '{text}')]")
            return "Element found."
        except selenium.common.exceptions.NoSuchElementException:
            error_msg = "Element not found."
            logger.warning(error_msg)
            return error_msg
            
    def click_element_with_text(self, text: str) -> str:
        """Click an element containing the specified text.
        
        Args:
            text (str): The text to search for
            
        Returns:
            str: Status message
        """
        try:
            logger.info(f"Attempting to click element with text: {text}")
            element = self.driver.find_element(By.XPATH, f"//*[contains(text(), '{text}')]")
            
            # Scroll element into view
            self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
            time.sleep(0.5)  # Wait for scroll
            
            # Try regular click first
            try:
                element.click()
            except:
                # If regular click fails, try JavaScript click
                self.driver.execute_script("arguments[0].click();", element)
                
            return f"Clicked element with text: {text}"
        except selenium.common.exceptions.NoSuchElementException:
            error_msg = "Element not found, cannot click."
            logger.warning(error_msg)
            return error_msg
        except selenium.common.exceptions.ElementNotInteractableException:
            error_msg = "Element not interactable, cannot click."
            logger.warning(error_msg)
            return error_msg
        except Exception as e:
            error_msg = f"Error clicking element: {str(e)}"
            logger.error(error_msg)
            return error_msg
            
    def enter_text_into_element(self, text: str, element_id: str) -> str:
        """Enter text into an element with the specified ID.
        
        Args:
            text (str): The text to enter
            element_id (str): The ID of the element
            
        Returns:
            str: Status message
        """
        try:
            logger.info(f"Entering text '{text}' into element with ID: {element_id}")
            element = self.driver.find_element(By.ID, element_id)
            element.clear()
            element.send_keys(text)
            return f"Entered text '{text}' into element with ID: {element_id}"
        except selenium.common.exceptions.NoSuchElementException:
            error_msg = "Element not found."
            logger.warning(error_msg)
            return error_msg
        except selenium.common.exceptions.ElementNotInteractableException:
            error_msg = "Element not interactable."
            logger.warning(error_msg)
            return error_msg
        except Exception as e:
            error_msg = f"Error entering text: {str(e)}"
            logger.error(error_msg)
            return error_msg
            
    def take_screenshot(self, filename: str, screenshot_type: str = "viewport", element_text: Optional[str] = None) -> str:
        """Take a screenshot of the page.
        
        Args:
            filename (str): The name of the file to save the screenshot as
            screenshot_type (str): Type of screenshot ('viewport', 'full_page', or 'element')
            element_text (str, optional): Text of the element to screenshot (for element screenshots)
            
        Returns:
            str: Status message
        """
        try:
            logger.info(f"Taking {screenshot_type} screenshot: {filename}")
            if screenshot_type == "full_page":
                filepath = self.screenshot_manager.capture_full_page(self.driver, filename)
                return f"Full page screenshot saved to: {filepath}"
                
            elif screenshot_type == "element" and element_text:
                try:
                    element = self.driver.find_element(By.XPATH, f"//*[contains(text(), '{element_text}')]")
                    filepath = self.screenshot_manager.capture_element(self.driver, element, filename)
                    return f"Element screenshot saved to: {filepath}"
                except selenium.common.exceptions.NoSuchElementException:
                    error_msg = "Element not found for screenshot."
                    logger.warning(error_msg)
                    return error_msg
                    
            else:  # viewport (default)
                filepath = self.screenshot_manager.capture_viewport(self.driver, filename)
                return f"Viewport screenshot saved to: {filepath}"
                
        except Exception as e:
            error_msg = f"Error taking screenshot: {str(e)}"
            logger.error(error_msg)
            return error_msg
            
    def get_screenshot_info(self, filepath: str) -> str:
        """Get information about a screenshot.
        
        Args:
            filepath (str): Path to the screenshot
            
        Returns:
            str: Screenshot information
        """
        info = self.screenshot_manager.get_screenshot_info(filepath)
        if "error" in info:
            logger.warning(f"Error getting screenshot info: {info['error']}")
            return info["error"]
            
        return f"""Screenshot Info:
- Filename: {info['filename']}
- Dimensions: {info['dimensions'][0]}x{info['dimensions'][1]}
- Format: {info['format']}
- Created: {info['created']}"""
            
    def get_page_source(self) -> str:
        """Get the HTML source of the current page.
        
        Returns:
            str: The page source
        """
        return self.driver.page_source
        
    def get_soup(self) -> BeautifulSoup:
        """Get a BeautifulSoup object for the current page.
        
        Returns:
            BeautifulSoup: Parsed HTML document
        """
        return BeautifulSoup(self.get_page_source(), 'lxml')
        
    def extract_text(self, selector: str, attribute: Optional[str] = None) -> List[str]:
        """Extract text or attribute values from elements matching the selector.
        
        Args:
            selector (str): CSS selector to find elements
            attribute (str, optional): If provided, extract this attribute instead of text
            
        Returns:
            List[str]: List of extracted values
        """
        soup = self.get_soup()
        elements = soup.select(selector)
        
        if attribute:
            return [elem.get(attribute, '') for elem in elements]
        return [elem.get_text(strip=True) for elem in elements]
        
    def Map(self, base_url: Optional[str] = None, include_assets: bool = False, 
            filter_pattern: Optional[str] = None, follow_redirects: bool = True) -> Dict[str, Any]:
        """Extract all links from the page as a flat list of URLs.
        
        Args:
            base_url (str, optional): If provided, convert relative URLs to absolute
            include_assets (bool): Whether to include asset links (images, stylesheets, scripts)
            filter_pattern (str, optional): Regex pattern to filter URLs
            follow_redirects (bool): Whether to follow redirects and include final URLs
        Returns:
            Dict[str, Any]: {"status": ..., "links": [url, ...]}
        """
        import re
        from urllib.parse import urljoin, urlparse
        import requests
        from requests.exceptions import RequestException, Timeout, TooManyRedirects
        try:
            # Validate base_url if provided
            if base_url:
                try:
                    parsed = urlparse(base_url)
                    if not all([parsed.scheme, parsed.netloc]):
                        return {
                            "status": "error",
                            "links": [],
                            "error": "Invalid base_url provided"
                        }
                except Exception as e:
                    return {
                        "status": "error",
                        "links": [],
                        "error": f"Error parsing base_url: {str(e)}"
                    }
            # Validate filter_pattern if provided
            if filter_pattern:
                try:
                    re.compile(filter_pattern)
                except re.error as e:
                    return {
                        "status": "error",
                        "links": [],
                        "error": f"Invalid filter pattern: {str(e)}"
                    }
            soup = self.get_soup()
            links = set()  # Use set for deduplication
            current_url = self.driver.current_url
            def normalize_url(url: str) -> Optional[str]:
                if not url or url.startswith(('javascript:', 'mailto:', 'tel:', '#', 'data:')):
                    return None
                # Convert relative URL to absolute
                if base_url and not url.startswith(('http://', 'https://')):
                    url = urljoin(base_url, url)
                elif not url.startswith(('http://', 'https://')):
                    url = urljoin(current_url, url)
                # Remove fragments and normalize
                try:
                    parsed = urlparse(url)
                    normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
                    if parsed.query:
                        normalized += f"?{parsed.query}"
                    return normalized
                except Exception:
                    return None
            # Regular links
            for a in soup.find_all('a', href=True):
                url = normalize_url(a['href'])
                if url:
                    if filter_pattern and not re.search(filter_pattern, url):
                        continue
                    links.add(url)
            # Asset links if requested
            if include_assets:
                # Images
                for img in soup.find_all('img', src=True):
                    url = normalize_url(img['src'])
                    if url:
                        if filter_pattern and not re.search(filter_pattern, url):
                            continue
                        links.add(url)
                # Stylesheets
                for link in soup.find_all('link', rel='stylesheet', href=True):
                    url = normalize_url(link['href'])
                    if url:
                        if filter_pattern and not re.search(filter_pattern, url):
                            continue
                        links.add(url)
                # Scripts
                for script in soup.find_all('script', src=True):
                    url = normalize_url(script['src'])
                    if url:
                        if filter_pattern and not re.search(filter_pattern, url):
                            continue
                        links.add(url)
            return {
                "status": "success",
                "links": sorted(list(links))
            }
        except Exception as e:
            logger.error(f"Error extracting links: {str(e)}")
            return {
                "status": "error",
                "links": [],
                "error": str(e)
            }
        
    def extract_meta_tags(self) -> Dict[str, Any]:
        """Extract all meta tags from the page.
        
        Returns:
            Dict[str, Any]: Dictionary of meta tag names and their content
        """
        soup = self.get_soup()
        meta_tags = {}
        
        # Add required fields
        meta_tags["scrapeId"] = str(uuid.uuid4())
        meta_tags["sourceURL"] = self.driver.current_url
        meta_tags["statusCode"] = 200  # You might want to get this from the actual response
        meta_tags["url"] = self.driver.current_url
        meta_tags["language"] = soup.find("html").get("lang", "en-US")
        
        # Extract meta tags
        for meta in soup.find_all('meta'):
            name = meta.get('name', meta.get('property', ''))
            content = meta.get('content', '')
            if name and content:
                # Handle array values for specific fields
                if name in ['og:title', 'og:url', 'og:description', 'og:image']:
                    if name not in meta_tags:
                        meta_tags[name] = []
                    meta_tags[name].append(content)
                else:
                    meta_tags[name] = content
        
        # Add favicon
        favicon = soup.find("link", rel="icon") or soup.find("link", rel="shortcut icon")
        if favicon and favicon.get("href"):
            meta_tags["favicon"] = favicon["href"]
        
        # Add title
        title = soup.find("title")
        if title:
            meta_tags["title"] = title.get_text(strip=True)
        
        # Add og:site_name if not present
        if "og:site_name" not in meta_tags and "title" in meta_tags:
            meta_tags["og:site_name"] = meta_tags["title"]
        
        # Add og:type if not present
        if "og:type" not in meta_tags:
            meta_tags["og:type"] = "website"
        
        # Add viewport if not present
        if "viewport" not in meta_tags:
            meta_tags["viewport"] = "width=device-width, initial-scale=1"
        
        return meta_tags
        
    def extract_structured_data(self) -> List[Dict[str, Any]]:
        """Extract structured data (JSON-LD) from the page.
        
        Returns:
            List[Dict[str, Any]]: List of structured data objects
        """
        soup = self.get_soup()
        structured_data = []
        
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                import json
                data = json.loads(script.string)
                structured_data.append(data)
            except (json.JSONDecodeError, TypeError):
                continue
                
        return structured_data
        
    def save_page_source(self, filename: Optional[str] = None, pretty: bool = False) -> str:
        """Save the HTML source of the current page to a file.
        
        Args:
            filename (str, optional): Custom name for the file. If None, generates a timestamp-based name.
            pretty (bool): Whether to format the HTML nicely before saving
            
        Returns:
            str: Path to the saved file
        """
        try:
            # Create html directory if it doesn't exist
            html_dir = Path(self.screenshot_dir) / "html"
            html_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate filename if not provided
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"page_source_{timestamp}.html"
            elif not filename.endswith('.html'):
                filename += '.html'
                
            # Get page source and save to file
            if pretty:
                soup = self.get_soup()
                page_source = soup.prettify()
            else:
                page_source = self.get_page_source()
                
            filepath = html_dir / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(page_source)
                
            logger.info(f"Saved page source to: {filepath}")
            return str(filepath)
            
        except Exception as e:
            error_msg = f"Error saving page source: {str(e)}"
            logger.error(error_msg)
            return error_msg

    def save_links(self, links: List[str], filename: Optional[str] = None, format: str = "txt") -> str:
        """Save extracted links to a file.
        
        Args:
            links (List[str]): List of URLs to save
            filename (str, optional): Custom name for the file. If None, generates a timestamp-based name.
            format (str): Output format - 'txt' for plain text, 'json' for JSON format
            
        Returns:
            str: Path to the saved file
        """
        try:
            # Create links directory if it doesn't exist
            links_dir = Path(self.screenshot_dir) / "links"
            links_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate filename if not provided
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"links_{timestamp}"
            
            # Add appropriate extension
            if format == "json":
                filename = f"{filename}.json"
            else:
                filename = f"{filename}.txt"
                
            filepath = links_dir / filename
            
            # Save links in the specified format
            with open(filepath, 'w', encoding='utf-8') as f:
                if format == "json":
                    import json
                    json.dump({"links": links}, f, indent=2)
                else:
                    f.write("\n".join(links))
                    
            logger.info(f"Saved {len(links)} links to: {filepath}")
            return str(filepath)
            
        except Exception as e:
            error_msg = f"Error saving links: {str(e)}"
            logger.error(error_msg)
            return error_msg
        
    def wait_for_element(self, by_method: str, value: str, timeout: int = 10) -> bool:
        """Wait for an element to be present on the page.
        
        Args:
            by_method (str): The method to locate element ('id', 'name', 'xpath', 'css_selector', etc.)
            value (str): The value to locate the element
            timeout (int): Maximum time to wait in seconds
            
        Returns:
            bool: True if element is found, False otherwise
        """
        try:
            logger.info(f"Waiting for element using {by_method}: {value}")
            by_method = by_method.lower()
            if by_method == 'id':
                by = By.ID
            elif by_method == 'name':
                by = By.NAME
            elif by_method == 'xpath':
                by = By.XPATH
            elif by_method == 'css_selector':
                by = By.CSS_SELECTOR
            elif by_method == 'class_name':
                by = By.CLASS_NAME
            elif by_method == 'tag_name':
                by = By.TAG_NAME
            else:
                by = By.ID  # default
                
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return True
        except Exception as e:
            logger.warning(f"Element not found: {str(e)}")
            return False
            
    def scroll_down(self, pixels: int = 500) -> str:
        """Scroll down the page by the specified number of pixels.
        
        Args:
            pixels (int): Number of pixels to scroll
            
        Returns:
            str: Status message
        """
        try:
            logger.info(f"Scrolling down by {pixels} pixels")
            self.driver.execute_script(f"window.scrollBy(0, {pixels})")
            return f"Scrolled down by {pixels} pixels"
        except Exception as e:
            error_msg = f"Error scrolling: {str(e)}"
            logger.error(error_msg)
            return error_msg

    def crawl(self, start_url: str, output_formats: List[str] = ["markdown"], max_depth: int = 2, follow_subdomains: bool = False, rate_limit: float = 1.0, actions_per_url: Optional[Dict[str, List[dict]]] = None) -> Dict[str, Any]:
        """Recursively crawl a website, extract content, and aggregate results.
        Args:
            start_url (str): The starting URL for the crawl
            output_formats (List[str]): Output formats for each page (markdown, html, etc.)
            max_depth (int): Maximum crawl depth
            follow_subdomains (bool): Whether to follow subdomains
            rate_limit (float): Minimum seconds between requests
            actions_per_url (dict, optional): Dict mapping URLs to actions for agent-prompted navigation
        Returns:
            Dict[str, Any]: Dictionary keyed by URL with scrape results
        """
        from urllib.parse import urlparse
        import time
        from .scrape import Scrape
        queue = [(start_url, 0)]
        seen = set()
        results = {}
        base_domain = urlparse(start_url).netloc
        scraper = Scrape(headless=self.headless, auto_open=False)
        self.ensure_browser_open()
        while queue:
            url, depth = queue.pop(0)
            if url in seen or depth > max_depth:
                continue
            seen.add(url)
            logger.info(f"Crawling: {url} (depth {depth})")
            actions = actions_per_url[url] if actions_per_url and url in actions_per_url else None
            try:
                result = scraper.scrape(url, output_formats=output_formats, actions=actions)
                results[url] = result
            except Exception as e:
                logger.error(f"Error scraping {url}: {e}")
                results[url] = {"error": str(e)}
            # Rate limiting
            time.sleep(rate_limit)
            # Only traverse further if not at max depth
            if depth < max_depth:
                # Get links from the current page
                try:
                    links = result["formats"].get("links")
                    if not links:
                        # Fallback: use Map directly
                        links = self.Map(base_url=url)["links"]
                except Exception as e:
                    logger.warning(f"Could not extract links from {url}: {e}")
                    links = []
                for link in links:
                    parsed = urlparse(link)
                    if not parsed.scheme.startswith("http"):
                        continue
                    # Only follow subdomains if allowed
                    if not follow_subdomains and parsed.netloc != base_domain:
                        continue
                    if link not in seen:
                        queue.append((link, depth + 1))
        return results 