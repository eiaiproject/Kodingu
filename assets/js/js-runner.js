const formatValue = (value) => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return String(value);
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

export function runJavaScriptLesson(raw, preview = '') {
  const source = String(raw || '');
  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head><body>${preview}</body></html>`,
    'text/html'
  );
  const logs = [];
  const record = (kind) => (...args) => {
    logs.push(`${kind}: ${args.map(formatValue).join(' ')}`);
  };
  const consoleStub = {
    log: record('log'),
    info: record('info'),
    warn: record('warn'),
    error: record('error')
  };
  const windowStub = {
    document: doc,
    console: consoleStub,
    alert: (message) => logs.push(`alert: ${String(message)}`)
  };
  let error = null;
  let value;
  if (source.trim()) {
    try {
      const factory = new Function('document', 'window', 'console', `"use strict";\n${source}`);
      value = factory(doc, windowStub, consoleStub);
    } catch (caught) {
      error = caught instanceof Error ? caught : new Error(String(caught));
    }
  }
  return { doc, raw: source, css: '', error, logs, value };
}
