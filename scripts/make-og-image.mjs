import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const target = join(root, 'assets', 'og-image.png');

const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    background: #F3EFE6;
    color: #1F1D1A;
    font-family: Georgia, "DejaVu Serif", serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 76px 80px;
  }
  .top { display: flex; align-items: center; gap: 18px; }
  .seal {
    width: 58px; height: 58px;
    background: #B23A2F;
    display: flex; align-items: center; justify-content: center;
  }
  .seal span { color: #FFFFFF; font-family: "DejaVu Sans Mono", monospace; font-size: 24px; }
  .word { font-size: 32px; letter-spacing: 0.01em; }
  .rule { width: 128px; height: 3px; background: #B23A2F; margin-bottom: 34px; }
  h1 { font-size: 86px; line-height: 1.03; font-weight: 500; max-width: 940px; }
  .lede {
    margin-top: 26px;
    max-width: 820px;
    font-family: "DejaVu Sans", Arial, sans-serif;
    font-size: 27px;
    line-height: 1.42;
    color: #4A463F;
  }
  .foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: "DejaVu Sans", Arial, sans-serif;
    font-size: 21px;
    color: #6B655B;
  }
</style>
</head>
<body>
  <div class="top">
    <div class="seal"><span>&lt;/&gt;</span></div>
    <div class="word">Kodingu</div>
  </div>
  <div>
    <div class="rule"></div>
    <h1>Learn the web by writing it.</h1>
    <p class="lede">Short lessons in HTML, CSS, and JavaScript. Write real code, run it, and pass the checks in the browser.</p>
  </div>
  <div class="foot">
    <span>HTML · CSS · JavaScript</span>
    <span>No account. Progress stays in your browser.</span>
  </div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(template, { waitUntil: 'load' });
await mkdir(dirname(target), { recursive: true });
await page.screenshot({ path: target, type: 'png' });
await browser.close();
console.log(`Wrote ${target}`);
