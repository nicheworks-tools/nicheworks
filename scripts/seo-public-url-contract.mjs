export const SITE_ORIGIN = 'https://nicheworks.app';

export function assertToolSlug(slug) {
  if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Invalid tool slug: ${JSON.stringify(slug)}`);
  }
  return slug;
}

export function toolPublicPath(slug) {
  return `/tools/${assertToolSlug(slug)}/`;
}

export function toolPublicUrl(slug) {
  return `${SITE_ORIGIN}${toolPublicPath(slug)}`;
}

export function htmlFilePublicUrl(relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || relativePath.startsWith('/') || relativePath.includes('\\')) {
    throw new Error(`Invalid repository HTML path: ${JSON.stringify(relativePath)}`);
  }
  const parts = relativePath.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) {
    throw new Error(`Invalid repository HTML path: ${JSON.stringify(relativePath)}`);
  }
  if (!relativePath.endsWith('.html')) {
    throw new Error(`Expected an HTML file path: ${JSON.stringify(relativePath)}`);
  }

  if (relativePath === 'index.html') return `${SITE_ORIGIN}/`;
  if (relativePath.endsWith('/index.html')) {
    return `${SITE_ORIGIN}/${relativePath.slice(0, -'index.html'.length)}`;
  }
  return `${SITE_ORIGIN}/${relativePath}`;
}
