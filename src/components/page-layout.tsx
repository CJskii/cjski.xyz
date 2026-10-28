import type { ReactNode } from "react";
import { HeadComponent } from "./head-component";
import { site } from "@/lib/site";
interface Props {
  children: ReactNode;
  metaType?: "website" | "article" | "profile";
  title?: string;
  description?: string;
  noindex?: boolean;
  canonicalPath?: string;
  flexDirection?: "row" | "col";
  justify?: string;
  align?: string;
  gap?: number;
}
export function PageLayout({
  children,
  title = site.role,
  description = "Web applications, AI systems and integrations by CJSKI.",
  noindex,
  canonicalPath,
  metaType,
}: Props) {
  return (
    <>
      <HeadComponent
        title={title}
        type={metaType}
        description={description}
        noindex={noindex}
        canonicalPath={canonicalPath}
      />
      <main id="main-content" className="page-shell" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
