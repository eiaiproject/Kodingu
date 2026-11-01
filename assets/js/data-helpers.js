export const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();

export const textOf = (doc, selector) => normalize(doc.querySelector(selector)?.textContent);

export const textsOf = (doc, selector) =>
  Array.from(doc.querySelectorAll(selector)).map((node) => normalize(node.textContent));

const stripCssComments = (css) => String(css || '').replace(/\/\*[\s\S]*?\*\//g, '');

function parseDeclarations(body) {
  const declarations = {};
  body.split(';').forEach((part) => {
    const colon = part.indexOf(':');
    if (colon === -1) return;
    const property = part.slice(0, colon).trim().toLowerCase();
    let value = normalize(part.slice(colon + 1));
    if (value.toLowerCase().endsWith('!important')) {
      value = value.slice(0, -'!important'.length).trim();
    }
    if (property && value) declarations[property] = value;
  });
  return declarations;
}

function readBlock(text, open) {
  let depth = 1;
  let cursor = open + 1;
  while (cursor < text.length && depth > 0) {
    if (text[cursor] === '{') depth += 1;
    else if (text[cursor] === '}') depth -= 1;
    cursor += 1;
  }
  if (depth !== 0) return null;
  return { body: text.slice(open + 1, cursor - 1), end: cursor };
}

function pushRule(selector, body, media, rules) {
  if (!selector || selector.startsWith('@')) return;
  const declarations = parseDeclarations(body);
  if (Object.keys(declarations).length) {
    rules.push({ selector, declarations, media });
  }
}

function parseBlocks(text, media = null, rules = []) {
  let index = 0;
  while (index < text.length) {
    const open = text.indexOf('{', index);
    if (open === -1) break;
    const selector = normalize(text.slice(index, open));
    const block = readBlock(text, open);
    if (!block) break;
    if (selector.startsWith('@media')) {
      parseBlocks(block.body, selector, rules);
    } else {
      pushRule(selector, block.body, media, rules);
    }
    index = block.end;
  }
  return rules;
}

export function parseCss(css, media = null) {
  const rules = parseBlocks(stripCssComments(css));
  return rules.filter((rule) => {
    if (media === null) return rule.media === null;
    if (!rule.media) return false;
    return rule.media.replace(/\s+/g, ' ').includes(String(media).replace(/\s+/g, ' '));
  });
}

const selectorList = (selector) => selector.split(',').map((item) => item.trim());

export function cssRule(css, selector, media = null) {
  return parseCss(css, media).find((rule) => selectorList(rule.selector).includes(selector)) || null;
}

export function cssValue(css, selector, property, media = null) {
  const rule = cssRule(css, selector, media);
  return rule ? rule.declarations[property.toLowerCase()] || '' : '';
}

export function cssHas(css, selector, property, expected, media = null) {
  const value = cssValue(css, selector, property, media).toLowerCase().replace(/\s+/g, ' ');
  if (!value) return false;
  if (expected === undefined) return true;
  return value === expected.toLowerCase().replace(/\s+/g, ' ');
}

export function cssIncludes(css, selector, property, needle, media = null) {
  return cssValue(css, selector, property, media).toLowerCase().includes(needle.toLowerCase());
}

export function cssOrder(css, selectors, media = null) {
  const rules = parseCss(css, media);
  const positions = selectors.map((selector) =>
    rules.findIndex((rule) => selectorList(rule.selector).includes(selector))
  );
  return positions.every(
    (position, index) => position !== -1 && (index === 0 || position > positions[index - 1])
  );
}

export function parseColor(value) {
  const text = String(value || '').trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(text);
  if (hex) {
    const raw = hex[1];
    const full = raw.length === 3 ? raw.split('').map((part) => part + part).join('') : raw;
    return {
      r: Number.parseInt(full.slice(0, 2), 16),
      g: Number.parseInt(full.slice(2, 4), 16),
      b: Number.parseInt(full.slice(4, 6), 16)
    };
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(text);
  if (rgb) {
    const parts = rgb[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    if (parts.length >= 3 && parts.slice(0, 3).every((part) => Number.isFinite(part))) {
      return { r: parts[0], g: parts[1], b: parts[2] };
    }
  }
  return null;
}

function luminance({ r, g, b }) {
  const channel = (value) => {
    const part = value / 255;
    return part <= 0.03928 ? part / 12.92 : Math.pow((part + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function colorContrast(first, second) {
  if (!first || !second) return 0;
  const one = luminance(first);
  const two = luminance(second);
  return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);
}
