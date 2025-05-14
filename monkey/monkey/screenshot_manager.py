import os
import time
from datetime import datetime
from pathlib import Path
from typing import Optional, Union, Tuple

from PIL import Image
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement

class ScreenshotManager:
    def __init__(self, base_dir: str = "./screenshots"):
        """Initialize the screenshot manager.
        
        Args:
            base_dir (str): Base directory for saving screenshots
        """
        self.base_dir = Path(base_dir)
        self._setup_directories()
        
    def _setup_directories(self):
        """Create necessary directories for organizing screenshots."""
        # Create main screenshots directory
        self.base_dir.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories for different types of screenshots
        (self.base_dir / "full_page").mkdir(exist_ok=True)
        (self.base_dir / "elements").mkdir(exist_ok=True)
        (self.base_dir / "viewport").mkdir(exist_ok=True)
        
    def _generate_filename(self, prefix: str, suffix: str = "") -> str:
        """Generate a filename with timestamp.
        
        Args:
            prefix (str): Prefix for the filename
            suffix (str): Optional suffix for the filename
            
        Returns:
            str: Generated filename
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        if suffix:
            return f"{prefix}_{timestamp}_{suffix}.png"
        return f"{prefix}_{timestamp}.png"
        
    def capture_full_page(self, driver: WebDriver, name: Optional[str] = None) -> str:
        """Capture a full page screenshot by scrolling and stitching.
        
        Args:
            driver (WebDriver): Selenium WebDriver instance
            name (str, optional): Custom name for the screenshot
            
        Returns:
            str: Path to the saved screenshot
        """
        # Get the page dimensions
        total_height = driver.execute_script("return document.body.scrollHeight")
        total_width = driver.execute_script("return document.body.scrollWidth")
        viewport_height = driver.execute_script("return window.innerHeight")
        
        # Create a new image with the full page dimensions
        full_screenshot = Image.new('RGB', (total_width, total_height))
        
        # Scroll and capture
        for y in range(0, total_height, viewport_height):
            # Scroll to position
            driver.execute_script(f"window.scrollTo(0, {y})")
            time.sleep(0.5)  # Wait for any dynamic content
            
            # Take screenshot of current viewport
            screenshot = driver.get_screenshot_as_png()
            viewport = Image.open(screenshot)
            
            # Paste into the full screenshot
            full_screenshot.paste(viewport, (0, y))
        
        # Save the full screenshot
        filename = self._generate_filename("full_page", name)
        filepath = self.base_dir / "full_page" / filename
        full_screenshot.save(str(filepath))
        
        return str(filepath)
        
    def capture_element(self, driver: WebDriver, element: WebElement, name: Optional[str] = None) -> str:
        """Capture a screenshot of a specific element.
        
        Args:
            driver (WebDriver): Selenium WebDriver instance
            element (WebElement): Element to capture
            name (str, optional): Custom name for the screenshot
            
        Returns:
            str: Path to the saved screenshot
        """
        # Scroll element into view
        driver.execute_script("arguments[0].scrollIntoView(true);", element)
        time.sleep(0.5)  # Wait for scrolling to complete
        
        # Get element location and size
        location = element.location
        size = element.size
        
        # Take full screenshot
        screenshot = driver.get_screenshot_as_png()
        image = Image.open(screenshot)
        
        # Crop to element
        left = location['x']
        top = location['y']
        right = location['x'] + size['width']
        bottom = location['y'] + size['height']
        
        element_image = image.crop((left, top, right, bottom))
        
        # Save the element screenshot
        filename = self._generate_filename("element", name)
        filepath = self.base_dir / "elements" / filename
        element_image.save(str(filepath))
        
        return str(filepath)
        
    def capture_viewport(self, driver: WebDriver, name: Optional[str] = None) -> str:
        """Capture the current viewport.
        
        Args:
            driver (WebDriver): Selenium WebDriver instance
            name (str, optional): Custom name for the screenshot
            
        Returns:
            str: Path to the saved screenshot
        """
        filename = self._generate_filename("viewport", name)
        filepath = self.base_dir / "viewport" / filename
        
        driver.save_screenshot(str(filepath))
        return str(filepath)
        
    def get_screenshot_info(self, filepath: str) -> dict:
        """Get information about a screenshot.
        
        Args:
            filepath (str): Path to the screenshot
            
        Returns:
            dict: Screenshot information including dimensions and creation time
        """
        path = Path(filepath)
        if not path.exists():
            return {"error": "Screenshot not found"}
            
        with Image.open(path) as img:
            return {
                "filename": path.name,
                "path": str(path),
                "dimensions": img.size,
                "format": img.format,
                "created": datetime.fromtimestamp(path.stat().st_ctime).strftime("%Y-%m-%d %H:%M:%S")
            } 