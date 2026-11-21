export async function shareProduct(name: string, id: string) {
  const url = new URL('/product/' + encodeURIComponent(id), window.location.origin).href;
  try {
    if (navigator.share) {
      await navigator.share({ title: name, url });
      return '';
    }
    await navigator.clipboard.writeText(url);
    return 'تم نسخ رابط الصنف';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return '';
    return 'تعذرت المشاركة. افتح صفحة الصنف لنسخ رابطها.';
  }
}
