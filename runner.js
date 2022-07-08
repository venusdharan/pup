const puppeteer = require('puppeteer');

async function start() {
  const browser = await puppeteer.launch({headless: false,defaultViewport: null});
  const page = await browser.newPage();
  //await inject_jquery(page);
  await page.goto('https://dev2a.lifesignals.com');
  await page.screenshot({path: 'example.png'});
  await page.type('input[id=username]', 'testcomment', {delay: 20})
  await page.type('input[id=password]', 'testcomment', {delay: 20})
  await page.click("#kc-login")



 // await browser.close();
}

start();