import { BookOpen, Mail } from "lucide-react";
import { publicationLinks } from "@/lib/site";
export function PublicationDestination({
  kind,
}: {
  kind: "blog" | "newsletter";
}) {
  const url = publicationLinks[kind];
  const Icon = kind === "blog" ? BookOpen : Mail;
  return (
    <section className={`publication-destination destination-${kind}`}>
      <div className="destination-icon">
        <Icon size={32} aria-hidden="true" />
      </div>
      <div>
        <h2>{kind === "blog" ? "Read Cold Boot" : "Get the newsletter"}</h2>
        <p>
          {kind === "blog"
            ? "Articles and technical write-ups in one place."
            : "Selected writing, useful links and updates by email."}
        </p>
        {url ? (
          <a
            className="button-primary"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {kind === "blog" ? "Open the blog" : "Subscribe"}
          </a>
        ) : (
          <p className="destination-placeholder" role="status">
            {kind === "blog"
              ? "Blog link coming soon."
              : "Subscription link coming soon."}
          </p>
        )}
      </div>
    </section>
  );
}
