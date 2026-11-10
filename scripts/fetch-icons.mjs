import { writeFile } from 'node:fs/promises';

const VERSION = '1.2.5';
const names = [
  'ArrowRight',
  'Award',
  'BookOpen',
  'Check',
  'CheckCircle',
  'ChevronDown',
  'Clock',
  'CloseCircle',
  'Code',
  'Copy',
  'Fire',
  'Gauge',
  'GraduationCap',
  'Layers',
  'Menu',
  'Moon',
  'Play',
  'Save',
  'Sun',
  'Target'
];

const base = `https://cdn.jsdelivr.net/npm/reicon@${VERSION}/icons`;
const icons = Object.fromEntries(
  await Promise.all(
    names.map(async (name) => {
      const response = await fetch(`${base}/${name}.js`);
      if (!response.ok) {
        throw new Error(`Missing Reicon icon: ${name} (${response.status})`);
      }
      const source = await response.text();
      const match = /createIcon\('([^']+)',\s*\{([\s\S]*?)\}\);/.exec(source);
      if (!match) {
        throw new Error(`Could not parse Reicon icon: ${name}`);
      }
      const body = match[2];
      const outline = /O:\s*`([\s\S]*?)`/.exec(body);
      const filled = /F:\s*`([\s\S]*?)`/.exec(body);
      return [
        name,
        {
          O: outline ? outline[1] : '',
          F: filled ? filled[1] : ''
        }
      ];
    })
  )
);

const output = [
  `// Generated from reicon@${VERSION} (MIT). https://reicon.dev`,
  'export const ICONS = {',
  ...Object.entries(icons).map(([name, data]) => {
    return `  ${JSON.stringify(name)}: { O: ${JSON.stringify(data.O)}, F: ${JSON.stringify(data.F)} },`;
  }),
  '};',
  ''
].join('\n');

await writeFile(new URL('../assets/js/core/icons.js', import.meta.url), output);
console.log(`Wrote ${names.length} icons to assets/js/core/icons.js`);
