import { readFile, writeFile } from 'node:fs/promises';
import { ICONS } from '../assets/js/icons.js';

const path = ICONS.Code.O;
if (!path) {
  throw new Error('Code icon is missing');
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Kodingu">
  <rect width="32" height="32" rx="4" fill="#B23A2F"/>
  <g transform="translate(4 4)" color="#F3EFE6">${path}</g>
</svg>
`;

await writeFile(new URL('../favicon.svg', import.meta.url), svg);
console.log(`Wrote favicon.svg (${svg.length} bytes)`);
