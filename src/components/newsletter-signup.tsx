import { useEffect, useRef } from "react";
import { newsletterSignup, publicationLinks } from "@/lib/site";

type Embed = { script: HTMLScriptElement; destroy: () => void };

/** Mount the exact inline snippet again on client-side route navigation. */
export function NewsletterSignup() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const mount = document.createElement("div");
    const script = document.createElement("script");
    script.async = true;
    script.src = newsletterSignup.scriptUrl;
    script.dataset.beehiivForm = newsletterSignup.formId;
    const registry = () =>
      (window as Window & { __bhv_embeds?: Record<string, Embed> })
        .__bhv_embeds;
    let disposed = false;
    const destroyOwnedEmbed = () => {
      const embed = registry()?.[newsletterSignup.formId];
      if (embed?.script === script) {
        embed.destroy();
        return true;
      }
      return false;
    };
    const observer = new MutationObserver(() => {
      if (disposed) {
        destroyOwnedEmbed();
        observer.disconnect();
      } else {
        mount.querySelectorAll("iframe").forEach((frame) => {
          frame.title = "Subscribe to Cold Boot";
        });
      }
    });
    observer.observe(mount, { childList: true, subtree: true });
    host.appendChild(mount);
    mount.appendChild(script);
    return () => {
      disposed = true;
      script.removeAttribute("data-beehiiv-form");
      if (destroyOwnedEmbed()) observer.disconnect();
      // Keep the script's parent intact for any in-flight vendor config fetch.
      // A late render lands off-page and the observer destroys that instance.
      mount.remove();
    };
  }, []);
  return (
    <div className="newsletter-signup" id="newsletter-signup">
      <div className="newsletter-signup-embed" ref={container} />
      <p className="newsletter-signup-note">
        Unsubscribe whenever you like.{" "}
        <a href={publicationLinks.newsletter!}>
          Form not loading? Subscribe on Beehiiv.
        </a>
      </p>
    </div>
  );
}
