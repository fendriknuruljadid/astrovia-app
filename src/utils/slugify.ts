import slugify from "slugify";

export const toSlug = (text?: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/&/g, ' dan ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const unSlug = (slug: string): string => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
