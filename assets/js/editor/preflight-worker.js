// This preamble runs in a worker created inside a sandboxed frame. The worker's
// opaque origin blocks site storage; the no-op DOM lets ordinary lessons finish
// without touching the real page. The real runner reports errors.
const fakeNode = (() => {
  let proxy;
  let list;
  const node = function () {};
  proxy = new Proxy(node, {
    get(target, key) {
      if (key === Symbol.iterator) return function* () {};
      if (key === Symbol.toPrimitive) return () => '';
      if (key === 'length') return 0;
      if (key === 'textContent' || key === 'innerHTML' || key === 'value' || key === 'href' || key === 'src') return '';
      if (key === 'querySelectorAll') return () => list;
      if (key === 'children' || key === 'childNodes') return [];
      if (key === 'querySelector' || key === 'getElementById' || key === 'createElement' || key === 'closest' || key === 'appendChild' || key === 'append' || key === 'prepend' || key === 'remove' || key === 'setAttribute' || key === 'focus' || key === 'click' || key === 'add' || key === 'toggle') return () => proxy;
      if (key === 'classList' || key === 'style' || key === 'dataset') return proxy;
      if (key === 'addEventListener' || key === 'removeEventListener') return () => {};
      if (key === 'getAttribute') return () => '';
      if (key === 'hasAttribute' || key === 'contains') return () => false;
      return proxy;
    },
    set() { return true; },
    apply() { return proxy; }
  });
  list = new Proxy([], {
    get(target, key) {
      if (key === Symbol.iterator) return function* () {};
      if (key === 'item') return () => proxy;
      if (typeof key === 'string' && /^\d+$/.test(key)) return proxy;
      return Reflect.get(target, key);
    }
  });
  return proxy;
})();

const networkDisabled = () => {
  throw new Error('Network is disabled during the preflight.');
};

self.addEventListener('error', (event) => event.preventDefault());
self.addEventListener('unhandledrejection', (event) => event.preventDefault());

try {
  self.document = fakeNode;
  self.window = self;
  self.localStorage = fakeNode;
  self.alert = () => {};
  self.confirm = () => true;
  self.prompt = () => '';
  self.fetch = () => Promise.reject(new Error('Network is disabled during the preflight.'));
  self.XMLHttpRequest = networkDisabled;
  self.WebSocket = networkDisabled;
  self.EventSource = networkDisabled;
  self.importScripts = () => {};
  self.close = () => {};
  self.indexedDB = undefined;
  self.caches = undefined;
} catch (error) {
  // The preflight still runs when a global cannot be replaced.
}
