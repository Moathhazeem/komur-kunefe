const localWidths: Record<string, number> = { '/amalieh.jpg': 1284, '/coca-cola.jpg': 1280 };

export function productImageSources(src?: string) {
  if (!src || !Object.prototype.hasOwnProperty.call(localWidths, src)) return undefined;
  const stem = src.slice(0, -4);
  return [400, 800].map(width => stem + '-' + width + '.webp ' + width + 'w')
    .concat(src + ' ' + localWidths[src] + 'w').join(', ');
}
