const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error));

  await page.goto('http://localhost:8000');
  await page.waitForTimeout(2000);
  await browser.close();
})();
