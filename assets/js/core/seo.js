export function setPageTitle(title) {
  document.title = title ? `${title} · Kodingu` : 'Kodingu';
}

export function setMetaDescription(description) {
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', description);
}

const FALLBACK_ORIGIN = 'https://kodingu.pages.dev';

function siteOrigin() {
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    try {
      return new URL(canonical.href).origin;
    } catch (error) {
      // A malformed canonical falls back to the production origin.
    }
  }
  return FALLBACK_ORIGIN;
}

function setMetaContent(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.setAttribute('content', value);
}

export function setSocialMeta({ title = '', description = '', path = '' } = {}) {
  if (title) {
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[name="twitter:title"]', title);
  }
  if (description) {
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[name="twitter:description"]', description);
    setMetaContent('meta[name="description"]', description);
  }
  if (path) {
    const url = `${siteOrigin()}${path}`;
    setMetaContent('meta[property="og:url"]', url);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);
  }
}
