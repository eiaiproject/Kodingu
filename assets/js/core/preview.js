import { runJavaScriptLesson } from '../editor/js-runner.js';
import { escapeHtml } from './html.js';

export async function buildProjectPreview(raw) {
  const source = String(raw || '');
  const parsed = new DOMParser().parseFromString(source, 'text/html');
  const styles = Array.from(parsed.querySelectorAll('style'))
    .map((node) => node.outerHTML)
    .join('\n');
  const scripts = Array.from(parsed.querySelectorAll('script'))
    .filter((node) => !node.getAttribute('src'))
    .map((node) => node.textContent)
    .join('\n');
  const bodyAttributes = Array.from(parsed.body?.attributes || [])
    .map((attribute) => ` ${attribute.name}="${escapeHtml(attribute.value)}"`)
    .join('');
  parsed.querySelectorAll('script, style').forEach((node) => node.remove());
  let body = parsed.body ? parsed.body.innerHTML : '';
  let error = null;

  if (scripts.trim()) {
    const result = await runJavaScriptLesson(scripts, body);
    error = result.error;
    body = result.doc.body.innerHTML;
  }

  return {
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Project preview</title>${styles}</head><body${bodyAttributes}>${body}</body></html>`,
    error
  };
}

export async function buildPreviewDocument(raw, options = {}) {
  const style = `<style>
    html { color-scheme: light; }
    body { margin: 0; padding: 1.25rem; background: #ffffff; color: #1f1d1a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 15px; line-height: 1.6; }
    h1, h2, h3 { margin: 0 0 0.6rem; line-height: 1.2; font-weight: 600; }
    h1 { font-size: 1.6rem; }
    h2 { font-size: 1.25rem; }
    p { margin: 0 0 0.75rem; }
    ul, ol { margin: 0 0 0.75rem; padding-left: 1.25rem; }
    a { color: #b23a2f; }
    strong { font-weight: 600; }
    em { font-style: italic; }
    .preview-error { margin: 0.75rem 0 0; padding: 0.75rem; border: 1px solid #b23a2f; color: #b23a2f; font-size: 0.85rem; }
  </style>`;
  const source = String(raw || '');
  if (options.language === 'js') {
    const preview = options.preview || '<h1>Preview</h1><p>Write a script and run it.</p>';
    const result = await runJavaScriptLesson(source, preview);
    const error = result.error
      ? `<p class="preview-error">Script error: ${escapeHtml(result.error.message)}</p>`
      : '';
    const page = result.doc.documentElement.outerHTML;
    return page.replace('</head>', `${style}</head>`).replace('</body>', `${error}</body>`);
  }
  if (options.language === 'css') {
    const preview = options.preview || '<h1>Preview</h1><p>Write a rule and run it.</p>';
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">${style}<style>${source}</style></head><body>${preview}</body></html>`;
  }
  if (/<\/head>/i.test(source)) {
    return source.replace(/<\/head>/i, `${style}</head>`);
  }
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">${style}</head><body>${source}</body></html>`;
}
