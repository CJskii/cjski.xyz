import Link from "next/link";
import { site } from "@/lib/site";
export function Footer() {
  return (
    <footer className="site-footer">
      <Link className="footer-name" href="/">
        {site.name}
      </Link>
      <nav aria-label="Footer">
        <a href={site.booking} target="_blank" rel="noopener noreferrer">
          Book a call
        </a>
        <a href={site.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href={site.x} target="_blank" rel="noopener noreferrer">
          X
        </a>
        <Link href="/lab">Lab</Link>
        <Link href="/blog">Cold Boot</Link>
        <Link href="/newsletter">Newsletter</Link>
        <Link href="/contracts">Deployments</Link>
      </nav>
      <span className="footer-domain">cjski.dev</span>
    </footer>
  );
}
