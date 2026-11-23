import { writeFile } from 'node:fs/promises';

const VERSION = '1.78.0';
const names = [
  ['ArrowRight', 'arrow-right'],
  ['Award', 'award'],
  ['BookOpen', 'book-open'],
  ['Check', 'check'],
  ['ChevronDown', 'chevron-down'],
  ['CircleCheck', 'circle-check'],
  ['CircleX', 'circle-x'],
  ['Clock', 'clock'],
  ['Code', 'code'],
  ['Copy', 'copy'],
  ['Flame', 'flame'],
  ['Gauge', 'gauge'],
  ['GraduationCap', 'graduation-cap'],
  ['Layers', 'layers'],
  ['Menu', 'menu'],
  ['Moon', 'moon'],
  ['Play', 'play'],
  ['Save', 'save'],
  ['Sun', 'sun'],
  ['Target', 'target']
];

const base = `https://cdn.jsdelivr.net/npm/lucide-static@${VERSION}/icons`;
const icons = Object.fromEntries(
  await Promise.all(
    names.map(async ([name, slug]) => {
      const response = await fetch(`${base}/${slug}.svg`);
      if (!response.ok) {
        throw new Error(`Missing Lucide icon: ${name} (${response.status})`);
      }
      const source = await response.text();
      const match = /<svg[^>]*>([\s\S]*?)<\/svg>/.exec(source);
      if (!match) {
        throw new Error(`Could not parse Lucide icon: ${name}`);
      }
      const body = match[1].replace(/\s+/g, ' ').trim();
      return [name, body];
    })
  )
);

const output = [
  `// Generated from lucide-static@${VERSION} (ISC). https://lucide.dev`,
  'export const ICONS = {',
  ...Object.entries(icons).map(([name, body]) => {
    return `  ${JSON.stringify(name)}: ${JSON.stringify(body)},`;
  }),
  '};',
  ''
].join('\n');

await writeFile(new URL('../assets/js/core/icons.js', import.meta.url), output);
console.log(`Wrote ${names.length} icons to assets/js/core/icons.js`);
