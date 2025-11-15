const ALLOWED_TAGS = new Set([
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'P',
  'BR',
  'UL',
  'OL',
  'LI',
  'SPAN',
  'DIV',
  'A',
]);

export const sanitizeBasicHtml = (html: string): string => {
  if (!html) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const nodes = doc.body.querySelectorAll('*');
  nodes.forEach((node) => {
    if (!ALLOWED_TAGS.has(node.tagName)) {
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }

    Array.from(node.attributes).forEach((attr) => {
      const attrName = attr.name.toLowerCase();
      if (node.tagName === 'A' && attrName === 'href') {
        try {
          const url = new URL(attr.value, window.location.origin);
          node.setAttribute('href', url.href);
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        } catch {
          node.removeAttribute(attr.name);
        }
      } else {
        node.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
};
