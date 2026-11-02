import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './dev-server.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = join(root, 'artifacts', 'audit');

const WIDTHS = [1280, 1024, 768, 390, 320];
const THEMES = ['light', 'dark'];

const PAGES = [
  { id: 'home', url: '/index.html' },
  { id: 'catalog', url: '/catalog.html' },
  { id: 'course-html', url: '/course.html?course=html' },
  { id: 'lesson-html', url: '/lesson.html?course=html&lesson=html-01' },
  { id: 'lesson-css', url: '/lesson.html?course=css&lesson=css-01' },
  { id: 'lesson-js', url: '/lesson.html?course=js&lesson=js-01' },
  { id: 'practice', url: '/practice.html' },
  { id: 'challenge', url: '/challenge.html?challenge=extra-html-01' },
  { id: 'projects', url: '/projects.html' },
  { id: 'project', url: '/project.html?project=project-recipe' },
  { id: 'progress', url: '/progress.html' },
  { id: 'certificate', url: '/certificate.html?course=html' },
  { id: 'notfound', url: '/404.html' }
];

const SHOTS = new Set([
  'light:1280:home',
  'light:1280:catalog',
  'light:1280:course-html',
  'light:1280:lesson-html',
  'light:1280:practice',
  'light:1280:progress',
  'light:390:home',
  'light:390:catalog',
  'light:390:course-html',
  'light:390:lesson-html',
  'light:390:lesson-js',
  'light:390:practice',
  'light:390:progress',
  'light:320:home',
  'dark:1280:home',
  'dark:390:lesson-html',
  'dark:390:progress'
]);

const MEASURE = () => {
  const vw = window.innerWidth;
  const visible = (el) => {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };
  const label = (el) =>
    (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48);
  const selectorOf = (el) => {
    const cls = String(el.className || '').trim().split(/\s+/).filter(Boolean)[0];
    return el.tagName.toLowerCase() + (cls ? '.' + cls : '');
  };

  const idCounts = new Map();
  document.querySelectorAll('[id]').forEach((el) => {
    idCounts.set(el.id, (idCounts.get(el.id) || 0) + 1);
  });
  const duplicateIds = [...idCounts.entries()].filter(([, count]) => count > 1).map(([id]) => id);

  const outside = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    if (getComputedStyle(el).position === 'fixed') continue;
    const rect = el.getBoundingClientRect();
    if (rect.right <= vw + 1 && rect.left >= -1) continue;
    let parent = el.parentElement;
    let clipped = false;
    while (parent && parent !== document.documentElement) {
      const style = getComputedStyle(parent);
      if (style.overflowX !== 'visible' && parent.getBoundingClientRect().right <= vw + 1) {
        clipped = true;
        break;
      }
      parent = parent.parentElement;
    }
    if (!clipped) {
      outside.push({ sel: selectorOf(el), left: Math.round(rect.left), right: Math.round(rect.right) });
    }
  }

  const controlSelector =
    'button, input, select, textarea, .button, .icon-button, .catalog-title, .course-row-link, .challenge-row, .lesson-row a, .project-title, .sidebar-toggle, .nav-toggle';
  const smallControls = [];
  for (const el of document.querySelectorAll(controlSelector)) {
    if (!visible(el)) continue;
    if (getComputedStyle(el).display === 'inline' && el.tagName === 'A') continue;
    if (el.tagName === 'INPUT' && (el.type === 'radio' || el.type === 'checkbox')) {
      const labelRect = el.closest('label')?.getBoundingClientRect();
      if (labelRect && labelRect.width >= 44 && labelRect.height >= 44) continue;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      smallControls.push({
        sel: selectorOf(el),
        label: label(el),
        w: Math.round(rect.width),
        h: Math.round(rect.height)
      });
    }
  }

  const emptyLinks = [...document.querySelectorAll('a')].filter(
    (el) => !el.textContent.trim() && !el.getAttribute('aria-label') && !el.querySelector('svg')
  ).length;

  const parseColor = (value) => {
    const match = /rgba?\(([^)]+)\)/.exec(value);
    if (!match) return null;
    const parts = match[1].split(/[,/]+/).map(Number);
    if (parts.length < 3 || parts.some((part) => !Number.isFinite(part))) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };
  const channel = (value) => {
    const part = value / 255;
    return part <= 0.03928 ? part / 12.92 : Math.pow((part + 0.055) / 1.055, 2.4);
  };
  const luminance = (color) =>
    0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
  const contrast = (first, second) => {
    const one = luminance(first);
    const two = luminance(second);
    return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);
  };
  const backgroundOf = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node);
      if (style.backgroundImage && style.backgroundImage !== 'none') return null;
      const color = parseColor(style.backgroundColor);
      if (color && color.a > 0.5) return color;
      node = node.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  const contrastFailures = [];
  const contrastUnknown = [];
  for (const el of document.querySelectorAll('h1, h2, h3, p, li, a, button, span, dd, dt, label, output')) {
    if (!visible(el)) continue;
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    if (!text || el.children.length > 0) continue;
    const style = getComputedStyle(el);
    const size = Number.parseFloat(style.fontSize);
    if (!Number.isFinite(size) || size < 10) continue;
    const foreground = parseColor(style.color);
    const background = backgroundOf(el);
    if (!foreground || !background) {
      contrastUnknown.push(selectorOf(el));
      continue;
    }
    const ratio = contrast(foreground, background);
    const bold = Number.parseInt(style.fontWeight, 10) >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    const required = large ? 3 : 4.5;
    if (ratio + 0.01 < required) {
      contrastFailures.push({
        sel: selectorOf(el),
        ratio: Number(ratio.toFixed(2)),
        required,
        text: text.slice(0, 40)
      });
    }
  }

  const shells = [...document.querySelectorAll('.shell')].map((el) => {
    const rect = el.getBoundingClientRect();
    return {
      left: Math.round(rect.left),
      right: Math.round(vw - rect.right),
      width: Math.round(rect.width)
    };
  });
  const shellMismatches = shells.filter((item) => Math.abs(item.left - item.right) > 1);

  const spreads = {};
  for (const selector of ['.stat', '.reward-card', '.mission-item', '.course-row', '.history-card', '.catalog-item']) {
    const widths = [...document.querySelectorAll(selector)]
      .filter(visible)
      .map((el) => Math.round(el.getBoundingClientRect().width));
    if (widths.length > 1) {
      spreads[selector] = {
        count: widths.length,
        min: Math.min(...widths),
        max: Math.max(...widths),
        spread: Math.max(...widths) - Math.min(...widths)
      };
    }
  }

  const wideText = [];
  for (const el of document.querySelectorAll('.theory p, .lede, .course-description, .challenge-prompt, .mission-desc')) {
    if (!visible(el)) continue;
    const rect = el.getBoundingClientRect();
    const size = Number.parseFloat(getComputedStyle(el).fontSize);
    const chars = rect.width / (size * 0.5);
    if (chars > 80) {
      wideText.push({ sel: selectorOf(el), chars: Math.round(chars), width: Math.round(rect.width) });
    }
  }

  const gridGaps = [];
  for (const grid of document.querySelectorAll('.hero-grid, .method-grid, .split-grid, .course-hero-grid, .lesson-layout')) {
    const outer = grid.getBoundingClientRect();
    const children = [...grid.children].filter(visible).map((el) => el.getBoundingClientRect());
    if (children.length < 2) continue;
    // A stacked layout shares one left edge and may cap its measure; that is a column, not a lopsided grid.
    const lefts = children.map((rect) => Math.round(rect.left));
    if (lefts.every((left) => Math.abs(left - lefts[0]) <= 1)) continue;
    const leftGap = Math.round(Math.min(...children.map((rect) => rect.left)) - outer.left);
    const rightGap = Math.round(outer.right - Math.max(...children.map((rect) => rect.right)));
    if (leftGap > 1 || rightGap > 1) {
      gridGaps.push({ cls: String(grid.className), leftGap, rightGap });
    }
  }

  const h1 = document.querySelector('h1');
  const h2 = document.querySelector('h2');

  return {
    viewport: { w: vw, h: window.innerHeight },
    overflow: {
      doc: document.documentElement.scrollWidth - vw,
      body: document.body.scrollWidth - vw
    },
    outside,
    smallControls,
    duplicateIds,
    h1Count: document.querySelectorAll('h1').length,
    emptyLinks,
    contrast: { failures: contrastFailures, unknown: contrastUnknown.length },
    symmetry: { shellCount: shells.length, shellMismatches, spreads },
    gridGaps,
    wideText,
    type: {
      h1: h1 ? getComputedStyle(h1).fontSize : null,
      h2: h2 ? getComputedStyle(h2).fontSize : null,
      body: getComputedStyle(document.body).fontSize
    }
  };
};

const report = [];
const server = await startServer({ port: 0 });
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      serviceWorkers: 'block',
      reducedMotion: 'reduce'
    });
    await context.addInitScript((value) => {
      localStorage.setItem('kodingu.theme', value);
    }, theme);
    const page = await context.newPage();

    for (const target of PAGES) {
      await page.goto(`${server.url}${target.url}`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(120);
      const metrics = await page.evaluate(MEASURE);
      report.push({ theme, width, page: target.id, ...metrics });

      if (SHOTS.has(`${theme}:${width}:${target.id}`)) {
        const dir = join(outDir, theme, String(width));
        await mkdir(dir, { recursive: true });
        await page.screenshot({ path: join(dir, `${target.id}.png`), fullPage: true });
      }
    }
    await context.close();
  }
}

// Populated header is the densest state; check it separately.
for (const width of [390, 320]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
  await context.addInitScript(() => {
    localStorage.setItem('kodingu.theme', 'light');
    localStorage.setItem(
      'kodingu.progress.v1',
      JSON.stringify({
        version: 1,
        xp: 1960,
        tokens: 660,
        streak: 5,
        streakFreezes: 2,
        lastLessonDay: new Date().toISOString().slice(0, 10),
        completed: { 'html-01': { at: new Date().toISOString(), xp: 25, tokens: 10 } },
        history: []
      })
    );
  });
  const page = await context.newPage();
  await page.goto(`${server.url}/index.html`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(120);
  const metrics = await page.evaluate(MEASURE);
  report.push({ theme: 'light', width, page: 'home-populated', ...metrics });
  await mkdir(join(outDir, 'light', String(width)), { recursive: true });
  await page.screenshot({ path: join(outDir, 'light', String(width), 'home-populated.png'), fullPage: true });
  await context.close();
}

const focusIssues = [];
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  for (const [name, url] of [
    ['home', '/index.html'],
    ['lesson', '/lesson.html?course=html&lesson=html-01']
  ]) {
    await page.goto(`${server.url}${url}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    for (let index = 0; index < 22; index += 1) {
      await page.keyboard.press('Tab');
      const missing = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body || el === document.documentElement) return null;
        if (el.tagName === 'IFRAME') return null;
        const style = getComputedStyle(el);
        const ring =
          (style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0) ||
          style.boxShadow !== 'none';
        if (ring) return null;
        return {
          tag: el.tagName.toLowerCase(),
          cls: String(el.className || '').slice(0, 32),
          label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 28)
        };
      });
      if (missing) focusIssues.push({ page: name, ...missing });
    }
  }
  await context.close();
}

const reducedContext = await browser.newContext({
  viewport: { width: 390, height: 900 },
  reducedMotion: 'reduce',
  serviceWorkers: 'block'
});
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(`${server.url}/index.html`, { waitUntil: 'load' });
const reducedMotion = await reducedPage.evaluate(
  () => getComputedStyle(document.querySelector('.button')).transitionDuration
);
await reducedContext.close();

{
  const context = await browser.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block' });
  await context.addInitScript(() => localStorage.setItem('kodingu.theme', 'light'));
  const page = await context.newPage();
  await page.goto(`${server.url}/index.html`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.hero-demo').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(outDir, 'light', '390', 'home-demo-viewport.png') });
  await page.goto(`${server.url}/lesson.html?course=html&lesson=html-01`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.editor').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(outDir, 'light', '390', 'lesson-editor-viewport.png') });
  await context.close();
}

await browser.close();
await server.close();

await writeFile(join(outDir, 'report.json'), JSON.stringify(report, null, 2));

const totals = {
  renders: report.length,
  overflow: report.filter((entry) => entry.overflow.doc > 0 || entry.overflow.body > 0).length,
  outside: report.filter((entry) => entry.outside.length > 0).length,
  smallControls: report.filter((entry) => entry.smallControls.length > 0).length,
  contrastFailures: report.reduce((sum, entry) => sum + entry.contrast.failures.length, 0),
  duplicateIds: report.filter((entry) => entry.duplicateIds.length > 0).length,
  h1NotOne: report.filter((entry) => entry.h1Count !== 1).length,
  asymmetricShells: report.reduce((sum, entry) => sum + entry.symmetry.shellMismatches.length, 0),
  gridGaps: report.reduce((sum, entry) => sum + entry.gridGaps.length, 0),
  wideText: report.filter((entry) => entry.wideText.length > 0).length,
  focusIssues: focusIssues.length,
  reducedMotionTransition: reducedMotion
};

console.log(JSON.stringify(totals, null, 2));

for (const entry of report) {
  const issues = [
    entry.overflow.doc > 0 ? `doc+${entry.overflow.doc}` : '',
    entry.outside.length ? `outside:${entry.outside.length}` : '',
    entry.smallControls.length ? `small:${entry.smallControls.length}` : '',
    entry.contrast.failures.length ? `contrast:${entry.contrast.failures.length}` : '',
    entry.symmetry.shellMismatches.length ? `asym:${entry.symmetry.shellMismatches.length}` : '',
    entry.gridGaps.length ? `grid:${entry.gridGaps.map((gap) => `${gap.cls}:${gap.leftGap}/${gap.rightGap}`).join(',')}` : '',
    entry.wideText.length ? `wide:${entry.wideText.length}` : ''
  ].filter(Boolean);
  if (issues.length) {
    console.log(`${entry.theme} ${entry.width} ${entry.page}: ${issues.join(' ')}`);
  }
}
