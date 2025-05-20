const { chromium } = require('playwright');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await chromium.launch();
    console.log('Browser launched successfully!');
    await browser.close();
    console.log('Browser closed successfully!');
    console.log('Playwright is properly installed!');
  } catch (error) {
    console.error('Error:', error);
  }
})(); 