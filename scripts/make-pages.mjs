import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { courses } from '../assets/js/data/data.js';
import { ICONS } from '../assets/js/core/icons.js';

export const ORIGIN = 'https://kodingu.pages.dev';
const LESSONS_DIR = new URL('../lessons/', import.meta.url);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[character];
  });
}

function clip(text, max = 158) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : max - 1).trimEnd()}…`;
}

function icon(name, size = 16) {
  let body = ICONS[name]?.O || '';
  if (body.includes('clip0_')) {
    icon.sequence += 1;
    body = body.replaceAll(/clip0_\d+_\d+/g, `kodingu-static-clip-${icon.sequence}`);
  }
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">${body}</svg>`;
}
icon.sequence = 0;

function codeBlock(block) {
  return `
        <div class="code-block">
          <div class="code-head"><span class="code-lang">${escapeHtml(block.lang || 'html')}</span></div>
          <pre><code>${escapeHtml(block.code)}</code></pre>
        </div>`;
}

function listMarkup(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function renderBlock(block) {
  if (block.type === 'p') return `<p>${escapeHtml(block.text)}</p>`;
  if (block.type === 'h3') return `<h3>${escapeHtml(block.text)}</h3>`;
  if (block.type === 'note') {
    return `<aside class="note"><span class="note-label">Note</span><p>${escapeHtml(block.text)}</p></aside>`;
  }
  if (block.type === 'list') {
    return `<ul>${listMarkup(block.items)}</ul>`;
  }
  if (block.type === 'code') return codeBlock(block);
  return '';
}

function headerMarkup() {
  return `
    <header class="site-header static-header">
      <div class="shell header-inner">
        <a class="brand" href="../index.html" aria-label="Kodingu home">
          <span class="brand-mark" aria-hidden="true">${icon('Code')}</span>
          <span class="brand-word">Kodingu</span>
        </a>
        <nav class="site-nav static-nav" aria-label="Main">
          <a href="../catalog.html">Catalog</a>
          <a href="../projects.html">Projects</a>
          <a href="../practice.html">Practice</a>
          <a href="../progress.html">Progress</a>
        </nav>
      </div>
    </header>`;
}

function footerMarkup() {
  return `
    <footer class="site-footer">
      <div class="shell footer-inner">
        <div class="footer-brand">
          <a class="brand" href="../index.html" aria-label="Kodingu home">
            <span class="brand-mark" aria-hidden="true">${icon('Code')}</span>
            <span class="brand-word">Kodingu</span>
          </a>
          <p>A quiet place to learn HTML, CSS, and JavaScript.</p>
        </div>
        <nav class="footer-nav" aria-label="Footer">
          <a href="../catalog.html">Catalog</a>
          <a href="../projects.html">Projects</a>
          <a href="../practice.html">Practice</a>
          <a href="../progress.html">Progress</a>
          <a href="../index.html#method">Method</a>
        </nav>
        <p class="footer-note">Icons from <a href="https://reicon.dev" rel="noopener">Reicon</a>. Progress stays in this browser.</p>
      </div>
    </footer>`;
}

function practiceMarkup(course, lesson, label, copy) {
  const href = `../lesson.html?course=${encodeURIComponent(course.id)}&amp;lesson=${encodeURIComponent(lesson.id)}`;
  return `
        <div class="static-practice">
          <div>
            <p class="section-label">${label}</p>
            <p>${copy}</p>
          </div>
          <a class="button button-primary" href="${href}">Open the lesson</a>
        </div>`;
}

function renderLessonPage({ course, module, lesson, index, lessons }) {
  const previous = lessons[index - 1] || null;
  const next = lessons[index + 1] || null;
  const lessonPath = `/lessons/${lesson.id}`;
  const lessonUrl = `${ORIGIN}${lessonPath}`;
  const description = clip(
    `${lesson.objective} ${lesson.minutes} min · ${course.title} lesson from Kodingu.`
  );
  const title = `${lesson.title} · ${course.title} · Kodingu`;
  const courseHref = `../course.html?course=${encodeURIComponent(course.id)}`;

  const previousMarkup = previous
    ? `<a href="./${encodeURIComponent(previous.id)}.html"><span class="lesson-nav-label">Previous</span><span>${escapeHtml(previous.title)}</span></a>`
    : `<a href="${courseHref}"><span class="lesson-nav-label">Course</span><span>Back to ${escapeHtml(course.title)}</span></a>`;
  const nextMarkup = next
    ? `<a class="lesson-nav-next" href="./${encodeURIComponent(next.id)}.html"><span class="lesson-nav-label">Next</span><span>${escapeHtml(next.title)}</span></a>`
    : `<a class="lesson-nav-next" href="${courseHref}"><span class="lesson-nav-label">Course</span><span>Back to ${escapeHtml(course.title)}</span></a>`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: lesson.title,
    description,
    url: lessonUrl,
    learningResourceType: 'Lesson',
    educationalLevel: course.level,
    teaches: lesson.objective,
    timeRequired: `PT${lesson.minutes}M`,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'Course',
      name: course.title,
      url: `${ORIGIN}/course?course=${encodeURIComponent(course.id)}`
    },
    provider: {
      '@type': 'Organization',
      name: 'Kodingu',
      url: `${ORIGIN}/`
    }
  };
  const structuredJson = JSON.stringify(structuredData).replaceAll('<', String.raw`\u003c`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${lessonUrl}">
  <meta property="og:site_name" content="Kodingu">
  <meta property="og:locale" content="en">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${lessonUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${ORIGIN}/assets/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Kodingu, a quiet place to learn HTML, CSS, and JavaScript.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ORIGIN}/assets/og-image.png">
  <meta name="theme-color" content="#F3EFE6" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#191817" media="(prefers-color-scheme: dark)">
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <script src="../assets/js/core/theme-init.js"></script>
  <link rel="stylesheet" href="../assets/css/fonts.css">
  <link rel="stylesheet" href="../assets/css/base.css">
  <link rel="stylesheet" href="../assets/css/app.css">
  <link rel="stylesheet" href="../assets/css/static.css">
  <script type="application/ld+json">${structuredJson}</script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>${headerMarkup()}

  <main id="main" tabindex="-1">
    <div class="shell static-page">
      <article class="static-article">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="../catalog.html">Catalog</a>
          <span class="sep" aria-hidden="true">/</span>
          <a href="${courseHref}">${escapeHtml(course.title)}</a>
          <span class="sep" aria-hidden="true">/</span>
          <span>Lesson ${String(index + 1).padStart(2, '0')}</span>
        </nav>

        <header class="lesson-head">
          <p class="section-label">${escapeHtml(module.title)}</p>
          <h1>${escapeHtml(lesson.title)}</h1>
          <div class="lesson-meta-row">
            <span>${icon('BookOpen')} ${escapeHtml(course.title)}</span>
            <span>${icon('Clock')} ${lesson.minutes} min</span>
            <span>${icon('Gauge')} ${lesson.xp} XP</span>
            <span>${icon('Layers')} Lesson ${index + 1} of ${lessons.length}</span>
          </div>
          <div class="goal">
            <span class="goal-label">Goal</span>
            <p>${escapeHtml(lesson.objective)}</p>
          </div>
        </header>

        <section class="theory" aria-label="Lesson notes">
          ${lesson.theory.map(renderBlock).join('\n          ')}
        </section>

        <section class="static-challenge" aria-labelledby="practice-heading">
          <div class="exercise-head">
            <h2 id="practice-heading">Your turn</h2>
            <span class="exercise-kicker">Challenge</span>
          </div>
          <p class="challenge-prompt">${escapeHtml(lesson.challenge.prompt)}</p>
          <ul class="requirements">
            ${lesson.challenge.requirements.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n            ')}
          </ul>${practiceMarkup(
            course,
            lesson,
            'Practice',
            'The editor starts with the same prompt, a preview, and checks that tell you what still needs work.'
          )}
        </section>

        <nav class="lesson-nav" aria-label="Lesson navigation">
          ${previousMarkup}
          ${nextMarkup}
        </nav>
      </article>
    </div>
  </main>${footerMarkup()}
</body>
</html>
`;
}

export function buildLessonPages() {
  const pages = new Map();
  icon.sequence = 0;
  for (const course of courses) {
    const lessons = course.modules.flatMap((module) => module.lessons);
    lessons.forEach((lesson, index) => {
      const module = course.modules.find((item) => item.lessons.includes(lesson));
      pages.set(
        `${lesson.id}.html`,
        renderLessonPage({ course, module, lesson, index, lessons })
      );
    });
  }
  return pages;
}

async function checkLessonPages(pages) {
  const existing = new Set(await readdir(LESSONS_DIR));
  const missingOrStale = await Promise.all(
    [...pages].map(async ([name, html]) => {
      if (!existing.has(name)) return `missing ${name}`;
      const current = await readFile(new URL(name, LESSONS_DIR), 'utf8');
      return current === html ? null : `stale ${name}`;
    })
  );
  const problems = missingOrStale.filter(Boolean);
  for (const name of existing) {
    if (name.endsWith('.html') && !pages.has(name)) problems.push(`orphaned ${name}`);
  }
  if (problems.length) {
    console.error(`Lesson pages are out of date (${problems.length}):`);
    for (const problem of problems.slice(0, 20)) console.error(`  ${problem}`);
    if (problems.length > 20) console.error(`  and ${problems.length - 20} more`);
    process.exitCode = 1;
    return;
  }
  console.log(`Lesson pages are up to date (${pages.size}).`);
}

async function writeLessonPages(pages) {
  await Promise.all(
    [...pages].map(([name, html]) => writeFile(new URL(name, LESSONS_DIR), html))
  );

  const existing = await readdir(LESSONS_DIR);
  const removed = await Promise.all(
    existing
      .filter((name) => name.endsWith('.html') && !pages.has(name))
      .map(async (name) => {
        await unlink(new URL(name, LESSONS_DIR));
        return name;
      })
  );

  console.log(`Wrote ${pages.size} lesson pages to lessons/`);
  if (removed.length) console.log(`Removed ${removed.length} orphaned page(s).`);
}

async function run() {
  const check = process.argv.includes('--check');
  const pages = buildLessonPages();
  await mkdir(LESSONS_DIR, { recursive: true });

  if (check) {
    await checkLessonPages(pages);
    return;
  }

  await writeLessonPages(pages);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  await run();
}
