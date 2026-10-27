const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

export const appPath = (path) => {
  const value = path || '/';
  if (base && value === base) return '/';
  if (base && value.startsWith(base + '/')) return value.slice(base.length) || '/';
  return value;
};

export const publicUrl = (path) => {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return path;
  return (base || '') + path;
};

export const routeHref = publicUrl;
