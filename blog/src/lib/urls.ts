export function normalizePathname(pathname: string): string {
  let path = pathname.split("?")[0].split("#")[0];
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  path = path.replace(/\/+$/, "") || "/";
  return path;
}

export function getCanonicalUrl(pathname: string, origin?: string): string {
  const normalized = normalizePathname(pathname);
  if (!origin) return normalized;
  return `${origin.replace(/\/+$/, "")}${normalized}`;
}

export function getPostUrl(slug: string, origin?: string): string {
  return getCanonicalUrl(`/blog/${slug}/`, origin);
}

export function getTagUrl(tag: string, origin?: string): string {
  return getCanonicalUrl(`/tags/${tag}/`, origin);
}

export function getAuthorUrl(id: string, origin?: string): string {
  return getCanonicalUrl("/authors/cjskii", origin);
}

export function getAssetUrl(path: string, origin?: string): string {
  if (!origin) return path;
  return `${origin.replace(/\/+$/, "")}${path.startsWith("/") ? path : "/" + path}`;
}
