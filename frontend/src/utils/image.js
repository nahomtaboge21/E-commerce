export const getImageUrl = (source) => {
  if (Array.isArray(source)) return source[0] || '';
  if (typeof source === 'string') return source;
  return '';
};
