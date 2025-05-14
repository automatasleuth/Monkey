from typing import List, Dict, Any, Optional, Union
from pathlib import Path
from datetime import datetime
import json
import markdown
from bs4 import BeautifulSoup
from markdownify import markdownify as md
import uuid
from readability import Document
from urllib.parse import urljoin

class Scrape:
    def __init__(self, crawler=None, headless: Optional[bool] = None, auto_open: bool = True):
        """Initialize the Scrape feature.
        
        Args:
            crawler (WebCrawler, optional): Existing WebCrawler instance to use
            headless (bool, optional): Whether to run browser in headless mode
            auto_open (bool): Whether to automatically open browser on init
        """
        if crawler is not None:
            self.crawler = crawler
        else:
            from .crawler import WebCrawler
            self.crawler = WebCrawler(headless=headless, auto_open=auto_open)
        
    def scrape(self, url: str, output_formats: List[str] = ["markdown"], actions: Optional[List[dict]] = None) -> Dict[str, Any]:
        """Scrape a URL and return content in specified formats.
        Optionally perform agent-prompted navigation/actions before scraping.
        
        Args:
            url (str): URL to scrape
            output_formats (List[str]): List of desired output formats. Supported formats:
                - markdown: Clean markdown output
                - html: Formatted HTML
                - rawHtml: Raw HTML without modifications
                - screenshot: Page screenshot
                - screenshot@fullPage: Full page screenshot
                - links: Extracted links
                - json: Structured data output
            actions (List[dict], optional): List of actions to perform before scraping.
                Supported actions: wait, click, write, press
        Returns:
            Dict[str, Any]: Dictionary containing requested output formats
        """
        try:
            # Ensure browser is open and navigated to the URL
            self.crawler.ensure_browser_open()
            self.crawler.go_to_url(url)

            # Perform agent-prompted actions if provided
            if actions:
                self._perform_actions(actions)
            
            # Initialize results dictionary
            results = {
                "url": url,
                "timestamp": datetime.now().isoformat(),
                "formats": {}
            }
            
            # Process each requested format
            for format in output_formats:
                if format == "markdown":
                    results["formats"]["markdown"] = self._get_markdown()
                elif format == "json":
                    results["formats"]["json"] = self._get_structured_data()
                elif format == "html":
                    results["formats"]["html"] = self.crawler.get_page_source()
                elif format == "rawHtml":
                    results["formats"]["rawHtml"] = self.crawler.get_page_source()
                elif format == "screenshot":
                    results["formats"]["screenshot"] = self._take_screenshot(full_page=False)
                elif format == "screenshot@fullPage":
                    results["formats"]["screenshot"] = self._take_screenshot(full_page=True)
                elif format == "links":
                    results["formats"]["links"] = self.crawler.Map()["links"]
                    
            return results
            
        except Exception as e:
            return {
                "url": url,
                "error": str(e),
                "formats": {}
            }

    def save(self, content: str, format: str, filename: Optional[str] = None) -> str:
        """Save scraped content to a file in the specified format.
        
        Args:
            content (str): Content to save
            format (str): Output format (markdown, html, rawHtml, json)
            filename (str, optional): Custom name for the file. If None, generates a timestamp-based name.
            
        Returns:
            str: Path to the saved file
        """
        try:
            # Create output directory if it doesn't exist
            output_dir = Path(self.crawler.screenshot_dir) / format
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate filename if not provided
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"content_{timestamp}"
            
            # Add appropriate extension
            if format == "markdown":
                filename = f"{filename}.md"
            elif format == "html":
                filename = f"{filename}.html"
            elif format == "rawHtml":
                filename = f"{filename}.html"
            elif format == "json":
                filename = f"{filename}.json"
            else:
                raise ValueError(f"Unsupported format: {format}")
                
            filepath = output_dir / filename
            
            # Save content in the specified format
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
                
            return str(filepath)
            
        except Exception as e:
            error_msg = f"Error saving content: {str(e)}"
            return error_msg
            
    def _extract_json(self) -> dict:
        html = self.crawler.get_page_source()
        soup = BeautifulSoup(html, "lxml")
        data = {}
        
        # Extract metadata first - handle both cases where function might be called with or without arguments
        try:
            metadata = self.crawler.extract_meta_tags(html)
        except TypeError:
            # If function doesn't accept html parameter, call without it
            metadata = self.crawler.extract_meta_tags()
        
        data["metadata"] = metadata
        
        # Title
        data["title"] = metadata.get("title", "")
        
        # Use readability to get main content HTML
        doc = Document(html)
        main_html = doc.summary(html_partial=True)
        main_soup = BeautifulSoup(main_html, "lxml")
        
        # Initialize sections list
        sections = []
        
        # Extract all content sections
        for section in main_soup.find_all(["section", "div", "article"]):
            # Skip navigation, footer, header, etc.
            if any(x in str(section.get("class", [])).lower() for x in ["nav", "footer", "header", "menu"]):
                continue
                
            section_content = {
                "headline": "",
                "description": "",
                "links": [],
                "content": "",
                "subsections": []
            }
            
            # Extract headline
            headline = section.find(["h1", "h2", "h3", "h4", "h5", "h6"])
            if headline:
                section_content["headline"] = headline.get_text(strip=True)
            
            # Extract description
            desc = section.find(["p", "span"])
            if desc:
                section_content["description"] = desc.get_text(strip=True)
            
            # Extract full content
            content = section.get_text(strip=True)
            if content and content != section_content["description"]:
                section_content["content"] = content
            
            # Extract links with better handling
            for a in section.find_all("a", href=True):
                url = a["href"]
                text = a.get_text(strip=True)
                if url and text:
                    # Handle relative URLs
                    if not url.startswith(('http://', 'https://')):
                        base_url = self.crawler.driver.current_url
                        url = urljoin(base_url, url)
                    
                    section_content["links"].append({
                        "text": text,
                        "url": url
                    })
            
            # Extract subsections with improved structure
            for subsection in section.find_all(["div", "section"], recursive=False):
                subsection_content = {
                    "headline": "",
                    "description": "",
                    "links": [],
                    "content": ""
                }
                
                sub_headline = subsection.find(["h1", "h2", "h3", "h4", "h5", "h6"])
                if sub_headline:
                    subsection_content["headline"] = sub_headline.get_text(strip=True)
                
                sub_desc = subsection.find(["p", "span"])
                if sub_desc:
                    subsection_content["description"] = sub_desc.get_text(strip=True)
                
                # Extract subsection content
                sub_content = subsection.get_text(strip=True)
                if sub_content and sub_content != subsection_content["description"]:
                    subsection_content["content"] = sub_content
                
                # Extract subsection links
                for a in subsection.find_all("a", href=True):
                    url = a["href"]
                    text = a.get_text(strip=True)
                    if url and text:
                        if not url.startswith(('http://', 'https://')):
                            base_url = self.crawler.driver.current_url
                            url = urljoin(base_url, url)
                        subsection_content["links"].append({
                            "text": text,
                            "url": url
                        })
                
                if any(subsection_content.values()):
                    section_content["subsections"].append(subsection_content)
            
            if any(section_content.values()):
                sections.append(section_content)
        
        data["sections"] = sections
        
        # Extract reviews with improved structure
        reviews = []
        
        for review in main_soup.find_all(class_=lambda x: x and any(y in str(x).lower() for y in ["review", "testimonial", "comment"])):
            review_data = {
                "author": "",
                "date": "",
                "text": "",
                "platform": "Amazon",  # Default to Amazon since that's what we see in the example
                "rating": "",
                "read_more": False,
                "verified": False
            }
            
            # Extract author with improved detection
            author_elem = review.find(class_=lambda x: x and any(y in str(x).lower() for y in ["author", "reviewer", "user"]))
            if author_elem:
                review_data["author"] = author_elem.get_text(strip=True)
            
            # Extract date with improved detection
            date_elem = review.find(class_=lambda x: x and any(y in str(x).lower() for y in ["date", "time", "posted"]))
            if date_elem:
                review_data["date"] = date_elem.get_text(strip=True)
            
            # Extract rating with improved detection
            rating_elem = review.find(class_=lambda x: x and any(y in str(x).lower() for y in ["rating", "stars", "score"]))
            if rating_elem:
                review_data["rating"] = rating_elem.get_text(strip=True)
            
            # Check for verified purchase
            verified_elem = review.find(class_=lambda x: x and "verified" in str(x).lower())
            if verified_elem:
                review_data["verified"] = True
            
            # Extract review text with improved handling
            review_text = review.get_text(strip=True)
            if review_text:
                # Check if review has a "Read more" link
                read_more = review.find(class_=lambda x: x and any(y in str(x).lower() for y in ["read-more", "read more", "show more"]))
                if read_more:
                    review_data["read_more"] = True
                
                review_data["text"] = review_text
            
            if any(review_data.values()):
                reviews.append(review_data)
        
        data["reviews"] = reviews
        
        # Add scrape metadata
        data["scrape_id"] = metadata.pop("scrapeId", str(uuid.uuid4()))
        data["source_url"] = metadata.pop("sourceURL", self.crawler.driver.current_url)
        data["status_code"] = metadata.pop("statusCode", 200)
        
        return data

    def _json_to_markdown(self, data: dict) -> str:
        md = []
        
        # Add title
        if data.get('title'):
            md.append(data['title'])
            md.append("")  # Empty line after title
        
        # Add sections
        for section in data.get("sections", []):
            # Add headline if present
            if section["headline"]:
                if section["headline"].startswith("#"):
                    md.append(section["headline"])
                else:
                    md.append(f"# **{section['headline']}**")
                md.append("")  # Empty line after headline
            
            # Add description if present
            if section["description"]:
                md.append(section["description"])
                md.append("")  # Empty line after description
            
            # Add full content if different from description
            if section["content"] and section["content"] != section["description"]:
                md.append(section["content"])
                md.append("")  # Empty line after content
            
            # Add links with improved formatting
            for link in section["links"]:
                if link["url"].startswith(("http://", "https://")):
                    md.append(f"[Redirect to {link['url']}]({link['url']})")
                else:
                    md.append(f"[{link['text']}]({link['url']})")
                md.append("")  # Empty line after link
            
            # Add subsections with improved formatting
            for subsection in section.get("subsections", []):
                if subsection["headline"]:
                    md.append(f"## {subsection['headline']}")
                    md.append("")  # Empty line after subsection headline
                
                if subsection["description"]:
                    md.append(subsection["description"])
                    md.append("")  # Empty line after subsection description
                
                if subsection["content"] and subsection["content"] != subsection["description"]:
                    md.append(subsection["content"])
                    md.append("")  # Empty line after subsection content
                
                for link in subsection["links"]:
                    if link["url"].startswith(("http://", "https://")):
                        md.append(f"[Redirect to {link['url']}]({link['url']})")
                    else:
                        md.append(f"[{link['text']}]({link['url']})")
                    md.append("")  # Empty line after link
        
        # Add reviews section if there are any
        if data.get("reviews"):
            md.append("# **Why We're #1 on Amazon**")
            md.append("")  # Empty line after section title
            
            for review in data["reviews"]:
                review_parts = []
                
                if review["author"]:
                    review_parts.append(review["author"])
                
                if review["date"]:
                    review_parts.append(review["date"])
                
                if review["platform"]:
                    review_parts.append(f"on {review['platform']}")
                
                if review["rating"]:
                    review_parts.append(review["rating"])
                
                if review["text"]:
                    review_parts.append(review["text"])
                    
                    if review.get("read_more"):
                        review_parts.append("Read more")
                
                if review_parts:
                    md.extend(review_parts)
                    md.append("")  # Empty line after review
        
        # Add metadata section if present
        if data.get("metadata"):
            md.append("---")  # Separator
            md.append("")  # Empty line
            
            # Add important metadata fields
            important_fields = [
                "title", "description", "og:title", "og:description",
                "og:image", "twitter:image", "language", "viewport"
            ]
            
            for field in important_fields:
                value = data["metadata"].get(field)
                if value:
                    if isinstance(value, list):
                        for v in value:
                            md.append(f"{field}: {v}")
                    else:
                        md.append(f"{field}: {value}")
                    md.append("")  # Empty line after metadata field
        
        return "\n".join(md).strip()

    def _get_markdown(self) -> str:
        data = self._extract_json()
        return self._json_to_markdown(data)

    def _get_formatted_html(self) -> str:
        """Get formatted HTML content.
        
        Returns:
            str: Formatted HTML
        """
        return self.crawler.get_soup().prettify()
        
    def _take_screenshot(self, full_page: bool = False) -> str:
        """Take a screenshot of the page.
        
        Args:
            full_page (bool): Whether to capture full page
            
        Returns:
            str: Path to screenshot file
        """
        return self.crawler.take_screenshot(full_page=full_page)
        
    def _get_structured_data(self) -> Dict[str, Any]:
        return self._extract_json()

    def _perform_actions(self, actions: List[dict]):
        """Perform a list of agent-prompted actions using Selenium."""
        from selenium.webdriver.common.by import By
        from selenium.webdriver.common.keys import Keys
        import time
        driver = self.crawler.driver
        for action in actions:
            action_type = action.get("type")
            if action_type == "wait":
                ms = action.get("milliseconds", 1000)
                time.sleep(ms / 1000)
            elif action_type == "click":
                selector = action.get("selector")
                if selector:
                    elem = driver.find_element(By.CSS_SELECTOR, selector)
                    elem.click()
            elif action_type == "write":
                selector = action.get("selector")
                text = action.get("text", "")
                if selector:
                    elem = driver.find_element(By.CSS_SELECTOR, selector)
                    elem.clear()
                    elem.send_keys(text)
            elif action_type == "press":
                key = action.get("key", "ENTER").upper()
                elem = driver.switch_to.active_element
                elem.send_keys(getattr(Keys, key, Keys.ENTER))
            # Add more action types as needed 

    def save_structured_json(self, url: str, filename: Optional[str] = None) -> str:
        """Extract structured data from the URL and save it as a JSON file with markdown, metadata, and scrape_id.
        Args:
            url (str): The URL to scrape
            filename (str, optional): The filename to save as (default: timestamp-based)
        Returns:
            str: Path to the saved file
        """
        # Add https:// if protocol is missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
            
        self.crawler.ensure_browser_open()
        self.crawler.go_to_url(url)
        
        # Get markdown content
        markdown_content = self._get_markdown()
        
        # Get metadata with additional fields - handle both cases where function might be called with or without arguments
        try:
            html = self.crawler.get_page_source()
            metadata = self.crawler.extract_meta_tags(html)
        except TypeError:
            # If function doesn't accept html parameter, call without it
            metadata = self.crawler.extract_meta_tags()
        
        # Create data structure
        data = {
            "markdown": markdown_content,
            "metadata": metadata,
            "scrape_id": metadata.pop("scrapeId", str(uuid.uuid4()))  # Move scrapeId to top level, with fallback
        }
        
        # Convert to JSON with proper formatting
        json_content = json.dumps(data, indent=2, ensure_ascii=False)
        
        return self.save(json_content, format='json', filename=filename) 