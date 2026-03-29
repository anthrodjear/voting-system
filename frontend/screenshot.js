const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    channel: 'msedge'
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Take screenshot
  await page.screenshot({ 
    path: 'C:/Users/user/Desktop/PROJECTS/voting-system/frontend/screenshot.png',
    fullPage: true 
  });
  
  console.log('Screenshot saved!');
  
  await browser.close();
})();
