import { writeFile } from 'node:fs/promises';
import { courses, getAllLessons } from '../assets/js/data/data.js';
const ORIGIN = 'https://kodingu.pages.dev';

// Interactive shells are noindex, so only reading and index pages belong here.
const paths = [
  '/',
  '/catalog',
  '/projects',
  '/practice'
];

for (const course of courses) {
  paths.push(`/course?course=${encodeURIComponent(course.id)}`);
  for (const lesson of getAllLessons(course)) {
    paths.push(`/lessons/${encodeURIComponent(lesson.id)}`);
  }
}

const body = paths
  .map((path) => {
    const escaped = path.replaceAll('&', '&amp;');
    return `  <url><loc>${ORIGIN}${escaped}</loc></url>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

await writeFile(new URL('../sitemap.xml', import.meta.url), xml);
console.log(`Wrote ${paths.length} URLs to sitemap.xml`);
