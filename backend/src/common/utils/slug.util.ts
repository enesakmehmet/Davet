export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/[^\w\-]+/g, '') // Geçersiz karakterleri kaldır
    .replace(/\-\-+/g, '-') // Birden fazla tireyi tek tire yap
    .replace(/^-+/, '') // Başındaki tireleri kaldır
    .replace(/-+$/, ''); // Sonundaki tireleri kaldır
}

export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
