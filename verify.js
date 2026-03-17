const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the local app
  await page.goto('http://localhost:8000');

  // Wait for initial render
  await page.waitForTimeout(3000);
  console.log('Initial render complete');

  // Click Electron
  await page.click('#btn-electron');
  await page.waitForTimeout(3000);
  console.log('Electron rendered');

  // Click Proton
  await page.click('#btn-proton');
  await page.waitForTimeout(3000);
  console.log('Proton rendered');

  // Click Photon
  await page.click('#btn-photon');
  await page.waitForTimeout(3000);
  console.log('Photon rendered');

  // Check for any console errors
  page.on('console', msg => {
      if (msg.type() === 'error') {
          console.error(`Page Error: ${msg.text()}`);
      }
  });

  await browser.close();
})();
