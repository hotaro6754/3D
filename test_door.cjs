const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to localhost:5173...');
  // No networkidle wait because of Vite's websocket
  await page.goto('http://localhost:5173').catch(e => console.log('Nav err (ignored):', e.message));
  
  console.log('Waiting for load...');
  await new Promise(r => setTimeout(r, 4000));
  
  console.log('Clicking BEGIN TOUR...');
  await page.click('button').catch(e => console.log('Click err:', e.message));
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Taking spawn screenshot...');
  await page.screenshot({ path: 'spawn.png' });
  
  console.log('Walking forward to trigger interaction...');
  // 1.5 seconds walking forward
  await page.keyboard.down('w');
  await new Promise(r => setTimeout(r, 1500));
  await page.keyboard.up('w');
  
  console.log('Taking door approach screenshot...');
  await page.screenshot({ path: 'door_approach.png' });
  
  console.log('Pressing E...');
  await page.keyboard.press('e');
  await page.keyboard.press('E');
  
  await new Promise(r => setTimeout(r, 1500));
  console.log('Taking door open screenshot...');
  await page.screenshot({ path: 'door_open.png' });

  console.log('Walking inside...');
  await page.keyboard.down('w');
  await new Promise(r => setTimeout(r, 1500));
  await page.keyboard.up('w');

  console.log('Taking inside screenshot...');
  await page.screenshot({ path: 'inside.png' });
  
  console.log('Done.');
  await browser.close();
})();
