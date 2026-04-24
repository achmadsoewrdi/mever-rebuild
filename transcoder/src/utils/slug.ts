// generate slugu
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^_|_$/g, "");
};

// generate Unique Slug
export const generateUniqueSlug = (text: string): string => {
  const baseSlug = generateSlug(text);

  const uniqueId = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${uniqueId}`;
};
