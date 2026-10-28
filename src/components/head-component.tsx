import Head from "next/head";
import { useRouter } from "next/router";
import { site } from "@/lib/site";
interface Props {
  title: string;
  type?: "website" | "article" | "profile";
  description: string;
  image?: string;
  twitterHandle?: string;
  noindex?: boolean;
  canonicalPath?: string;
}
export function HeadComponent({
  title,
  description,
  image = "/static/share.png",
  type = "website",
  twitterHandle = site.handle,
  noindex,
  canonicalPath,
}: Props) {
  const router = useRouter();
  const path = canonicalPath || router.asPath.split(/[?#]/)[0];
  const canonical = new URL(path, site.origin).href;
  const preview =
    noindex || path.startsWith("/review") || router.pathname === "/404";
  const fullTitle = `${title} · ${site.name}`;
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={preview ? "noindex,nofollow,noarchive" : "index,follow"}
      />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:image" content={new URL(image, site.origin).href} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:image" content={new URL(image, site.origin).href} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="theme-color" content="#f3f5f3" />
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Cold Boot"
        href="/rss.xml"
      />
    </Head>
  );
}
