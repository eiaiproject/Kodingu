export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[character];
  });
}

class SafeHtml {
  constructor(value) {
    this.value = String(value);
  }

  toString() {
    return this.value;
  }
}

export function raw(value) {
  return new SafeHtml(value);
}

function renderValue(value) {
  if (value == null || value === false) return '';
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(renderValue).join('');
  return escapeHtml(value);
}

export function html(strings, ...values) {
  let output = strings[0];
  values.forEach((value, index) => {
    output += renderValue(value) + strings[index + 1];
  });
  return new SafeHtml(output);
}
