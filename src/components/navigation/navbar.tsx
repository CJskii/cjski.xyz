import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X } from "lucide-react";
import { navigation, site } from "@/lib/site";
export function Navbar() {
  const { asPath } = useRouter();
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  useEffect(() => {
    setOpen(false);
  }, [asPath]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        document.getElementById("menu-toggle")?.focus();
      }
    };
    if (open) document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="wordmark">
          {site.name}
          <span className="wordmark-dot" aria-hidden="true" />
        </Link>
        <nav
          id="primary-nav"
          className={open ? "primary-nav is-open" : "primary-nav"}
          aria-label="Main navigation"
        >
          {navigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                asPath.split(/[?#]/)[0].replace(/\/$/, "") === link.href
                  ? "page"
                  : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <a
            className="booking-nav"
            href={site.booking}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a call
          </a>
          <button
            className="theme-button"
            aria-label="Switch colour theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <Sun className="theme-sun" size={18} aria-hidden="true" />
            <Moon className="theme-moon" size={18} aria-hidden="true" />
          </button>
          <button
            id="menu-toggle"
            className="menu-toggle"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <X size={21} aria-hidden="true" />
            ) : (
              <Menu size={21} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
