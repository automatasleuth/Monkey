from typing import List, Dict, Any, Optional
from google.adk.agents.llm_agent import Agent
from google.adk.tools.tool_context import ToolContext
from google.genai import types
from PIL import Image
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging
import time

from .crawler import WebCrawler
from .shared_libraries import constants
from .scrape import Scrape

logger = logging.getLogger(__name__)

class WebCrawlerAgent:
    def __init__(self, auto_open: bool = False):
        """Initialize the web crawler agent.
        
        Args:
            auto_open (bool): Whether to open the browser automatically on initialization
        """
        self.crawler = WebCrawler(auto_open=auto_open)
        self.scraper = Scrape(crawler=self.crawler)
        self.agent = Agent(
            model=constants.MODEL,
            name="web_crawler_agent",
            description="An agent that can crawl websites and extract information",
            instruction=self._get_agent_instructions(),
            tools=self._get_tools()
        )
        
    def _get_agent_instructions(self) -> str:
        return """
        You are a web crawler agent that can:
        1. Open and close the browser
        2. Navigate to websites
        3. Find and interact with elements
        4. Extract information from web pages
        5. Take and analyze screenshots
        6. Understand visual context of web pages
        7. Parse and extract structured data from HTML
        
        Browser Control:
        - Use 'open_browser' to start a new browser session
        - Use 'close_browser' to close the current session
        - Always check if browser is open before performing actions
        - Handle browser state appropriately in your responses
        
        When interacting with websites:
        - Always be polite and respect robots.txt
        - Handle errors gracefully
        - Take screenshots BEFORE attempting interactions
        - Take screenshots AFTER failed interactions
        - Use visual context to identify elements and their states
        
        For HTML parsing and data extraction:
        - Use 'extract_text' to get text content from elements using CSS selectors
        - Use 'extract_links' to get all links with their text and URLs
        - Use 'extract_meta_tags' to get page metadata
        - Use 'extract_structured_data' to get JSON-LD structured data
        - Use 'save_page_source' with pretty=True for formatted HTML
        
        For search interactions:
        1. If you need to perform a search:
           - First try to find the search input by ID or aria-label
           - If that fails, try finding by visible text or placeholder
           - After entering text, try these approaches in order:
             a) Press Enter key in the search field
             b) Look for and click a search button
             c) Use JavaScript to submit the form
        
        When an action fails:
        1. Take a screenshot to understand the current state
        2. Analyze what went wrong using the screenshot
        3. Try alternative approaches
        4. Provide clear explanations of what you're seeing and doing
        
        Remember:
        - Check browser state before performing actions
        - Take screenshots to understand page layout
        - Handle errors gracefully and provide clear feedback
        - Close the browser when done if requested
        - Use appropriate HTML parsing methods for data extraction
        """
        
    def _get_tools(self) -> List[Any]:
        return [
            self._open_browser,
            self._close_browser,
            self.crawler.go_to_url,
            self.crawler.find_element_with_text,
            self.crawler.click_element_with_text,
            self.crawler.enter_text_into_element,
            self.crawler.take_screenshot,
            self.crawler.get_page_source,
            self.crawler.save_page_source,
            self.crawler.save_links,
            self.crawler.wait_for_element,
            self.crawler.scroll_down,
            self.crawler.extract_text,
            self.crawler.Map,
            self.crawler.extract_meta_tags,
            self.crawler.extract_structured_data,
            self._get_current_state,
            self._perform_search,
            self.scrape_and_save_markdown,
            self.scraper.save_structured_json,
        ]
        
    def _open_browser(self) -> str:
        """Open a new browser instance."""
        return self.crawler.open_browser()
        
    def _close_browser(self) -> str:
        """Close the current browser instance."""
        return self.crawler.close()
        
    def _perform_search(self, search_text: str) -> str:
        """Perform a search using various strategies."""
        try:
            logger.info(f"Starting search for: {search_text}")
            initial_url = self.crawler.driver.current_url
            
            # Take screenshot before interaction
            self.crawler.take_screenshot("before_search.png")
            
            # Try finding by aria-label first (specifically for Google's search box)
            try:
                logger.info("Trying to find search input by aria-label")
                element = WebDriverWait(self.crawler.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'textarea[aria-label="Search"], input[aria-label="Search"]'))
                )
                element.clear()
                element.send_keys(search_text)
                element.send_keys(Keys.RETURN)
                logger.info("Successfully entered text and submitted search")
                
                # Wait briefly and check if the page has changed or search results are present
                time.sleep(2)
                if (self.crawler.driver.current_url != initial_url or 
                    len(self.crawler.driver.find_elements(By.CSS_SELECTOR, 'div[role="main"]')) > 0):
                    return f"Successfully searched for: {search_text}"
            except Exception as e:
                logger.debug(f"Failed to find/use input with aria-label: {str(e)}")
            
            # Try common search input IDs as fallback
            search_ids = ['search', 'q', 'searchbox', 'searchInput', 'search-input', 'search_query', 'searchInput']
            input_found = False
            
            for search_id in search_ids:
                try:
                    logger.info(f"Trying to find search input with ID: {search_id}")
                    element = WebDriverWait(self.crawler.driver, 5).until(
                        EC.presence_of_element_located((By.ID, search_id))
                    )
                    element.clear()
                    element.send_keys(search_text)
                    element.send_keys(Keys.RETURN)
                    input_found = True
                    logger.info(f"Successfully found and entered text into input with ID: {search_id}")
                    
                    # Wait briefly and check if the page has changed or search results are present
                    time.sleep(2)
                    if (self.crawler.driver.current_url != initial_url or 
                        len(self.crawler.driver.find_elements(By.CSS_SELECTOR, 'div[role="main"], .search-results, #search-results')) > 0):
                        return f"Successfully searched for: {search_text}"
                    break
                except Exception as e:
                    logger.debug(f"Failed to find/use input with ID {search_id}: {str(e)}")
                    continue
            
            if not input_found:
                # Try finding by placeholder text and common search selectors
                search_texts = ['Search', 'search', 'Search...', 'Enter your search']
                selectors = [
                    '//input[@placeholder="{}" or @aria-label="{}"]',
                    '//input[@type="search"]',
                    '//input[contains(@class, "search")]',
                    '//form//input[@type="text"]'
                ]
                
                for selector in selectors:
                    try:
                        if '{}' in selector:
                            for text in search_texts:
                                xpath = selector.format(text, text)
                                logger.info(f"Trying XPath: {xpath}")
                                element = WebDriverWait(self.crawler.driver, 5).until(
                                    EC.presence_of_element_located((By.XPATH, xpath))
                                )
                                element.clear()
                                element.send_keys(search_text)
                                element.send_keys(Keys.RETURN)
                                
                                # Wait briefly and check if the page has changed or search results are present
                                time.sleep(2)
                                if (self.crawler.driver.current_url != initial_url or 
                                    len(self.crawler.driver.find_elements(By.CSS_SELECTOR, 'div[role="main"], .search-results, #search-results')) > 0):
                                    return f"Successfully searched for: {search_text}"
                        else:
                            logger.info(f"Trying selector: {selector}")
                            element = WebDriverWait(self.crawler.driver, 5).until(
                                EC.presence_of_element_located((By.XPATH, selector))
                            )
                            element.clear()
                            element.send_keys(search_text)
                            element.send_keys(Keys.RETURN)
                            
                            # Wait briefly and check if the page has changed or search results are present
                            time.sleep(2)
                            if (self.crawler.driver.current_url != initial_url or 
                                len(self.crawler.driver.find_elements(By.CSS_SELECTOR, 'div[role="main"], .search-results, #search-results')) > 0):
                                return f"Successfully searched for: {search_text}"
                    except Exception as e:
                        logger.debug(f"Failed to find/use element with selector {selector}: {str(e)}")
                        continue
            
            # If we get here, we couldn't find or use any search input
            logger.warning("Could not find search input using any method")
            return "Could not find search input"
                
        except Exception as e:
            error_msg = f"Error performing search: {str(e)}"
            logger.error(error_msg)
            return error_msg
        
    def _get_current_state(self) -> dict:
        """Get current page state including screenshot."""
        try:
            # Take a viewport screenshot
            screenshot_path = self.crawler.screenshot_manager.capture_viewport(
                self.crawler.driver,
                "current_state"
            )
            
            # Get current URL and page source
            current_url = self.crawler.driver.current_url
            page_source = self.crawler.get_page_source()
            
            # Open the screenshot for Gemini
            screenshot = Image.open(screenshot_path)
            
            return {
                "url": current_url,
                "screenshot": screenshot,
                "page_source": page_source,
                "screenshot_path": screenshot_path
            }
        except Exception as e:
            return {"error": f"Failed to get current state: {str(e)}"}
        
    def scrape_and_save_markdown(self, url: str, filename: Optional[str] = None) -> str:
        """Scrape a URL and save the content as markdown.
        
        Args:
            url (str): The URL to scrape
            filename (str, optional): Custom filename for the output
            
        Returns:
            str: Path to the saved markdown file
        """
        try:
            # Add https:// if protocol is missing
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
                
            # Initialize scraper with headless mode
            scraper = Scrape(headless=True)
            
            # Navigate to URL and get content
            scraper.crawler.ensure_browser_open()
            scraper.crawler.go_to_url(url)
            
            # Get markdown content directly
            markdown_content = scraper._get_markdown()
            
            # Save the markdown content
            return scraper.save(markdown_content, "markdown", filename)
            
        except Exception as e:
            return f"Error scraping {url}: {str(e)}"
        
    async def run(self, input_text: str) -> Dict[str, Any]:
        """Run the agent with the given input text."""
        import re
        input_lower = input_text.lower()
        if "open browser" in input_lower or "start browser" in input_lower or "launch browser" in input_lower:
            return {"result": self._open_browser()}
        elif "close browser" in input_lower or "quit browser" in input_lower or "exit browser" in input_lower:
            return {"result": self._close_browser()}

        # Crawl command
        if "crawl" in input_lower:
            url_match = re.search(r'(https?://[^\s]+)', input_text)
            url = url_match.group(1) if url_match else None
            # Parse depth
            depth_match = re.search(r'depth\s*(\d+)', input_lower)
            max_depth = int(depth_match.group(1)) if depth_match else 2
            # Parse formats
            formats = ["markdown"]
            if "html" in input_lower:
                formats.append("html")
            if "links" in input_lower:
                formats.append("links")
            # Parse subdomains
            follow_subdomains = "subdomain" in input_lower
            if url:
                results = self.crawler.crawl(
                    start_url=url,
                    output_formats=formats,
                    max_depth=max_depth,
                    follow_subdomains=follow_subdomains,
                    rate_limit=1.0,
                    actions_per_url=None
                )
                return {"result": results}
            else:
                return {"error": "No URL found in crawl command."}

        # Scrape command
        if "scrape" in input_lower:
            url_match = re.search(r'(https?://[^\s]+|\S+\.\S+)', input_text)
            url = url_match.group(1) if url_match else None
            if url and not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            formats = ["markdown"]
            if "html" in input_lower:
                formats.append("html")
            if "links" in input_lower:
                formats.append("links")
            # Optionally parse actions (not implemented here)
            if url:
                scraper = Scrape(headless=True)
                result = scraper.scrape(url, output_formats=formats)
                return {"result": result}
            else:
                return {"error": "No URL found in scrape command."}

        # For markdown requests, use Scrape (legacy support)
        if "markdown" in input_lower:
            url_match = re.search(r'(https?://[^\s]+)', input_text)
            url = url_match.group(1) if url_match else None
            filename = None  # Optionally extract filename from input_text
            if url:
                return {"result": self.scrape_and_save_markdown(url, filename)}
            else:
                return {"error": "No URL found in input."}

        # Add parsing for 'Scrape <url> json save as <filename>'
        match = re.match(r"scrape\s+(\S+)\s+json\s+save\s+as\s+([\w\-.]+)", input_lower)
        if match:
            url = match.group(1)
            filename = match.group(2)
            result = self.scraper.save_structured_json(url, filename)
            return {"result": result}

        # For all other commands, ensure browser is open
        self.crawler.ensure_browser_open()
        # Get current state with screenshot
        current_state = self._get_current_state()
        if "error" in current_state:
            return {"error": current_state["error"]}
        # Create a prompt that includes the current state
        full_prompt = f"""
        Current page state:
        URL: {current_state['url']}
        
        [Screenshot of current page]
        
        User request: {input_text}
        
        Based on what you see in the screenshot and the user's request, what should we do next?
        Please analyze the visual context and provide a clear plan of action.
        
        If this is a search request:
        1. Use the _perform_search tool directly
        2. Analyze the results screenshot
        3. Report what you see in the search results
        """
        # Create the content parts for Gemini
        content_parts = [
            {"text": full_prompt},
            {"image": current_state["screenshot"]}
        ]
        # Run the agent with the enhanced prompt
        response = await self.agent.run(content_parts)
        return response
        
    def close(self):
        """Close the crawler and clean up resources."""
        self.crawler.close()

# Create the root agent
root_agent = Agent(
    model=constants.MODEL,
    name=constants.AGENT_NAME,
    description=constants.DESCRIPTION,
    instruction="""
    You are a web crawler agent that can navigate websites and extract information.
    Use the available tools to interact with web pages and gather data.
    Always take screenshots before interactions to understand the page layout.
    Remember to manage browser state appropriately (open/close when requested).
    """,
    tools=WebCrawlerAgent(auto_open=False)._get_tools()
) 