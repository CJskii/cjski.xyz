import { FileCode2, FileText, Braces, MessagesSquare } from "lucide-react";
import type { Project } from "@/lib/projects";
const icons = {
  playground: Braces,
  finance: FileText,
  api: FileCode2,
  telegram: MessagesSquare,
};
export function ProjectCover({
  project,
  expanded = false,
}: {
  project: Project;
  expanded?: boolean;
}) {
  const Icon = icons[project.cover as keyof typeof icons] || FileCode2;
  return (
    <div
      className={`source-cover cover-${project.cover}${expanded ? " cover-expanded" : ""}`}
    >
      <div className="cover-file">
        <Icon size={18} aria-hidden="true" />
        <span>{project.sourceFile}</span>
        <span className="cover-kind">
          {project.cover === "telegram" ? "Source structure" : "Source excerpt"}
        </span>
      </div>
      <pre>
        <code>{project.sourceExcerpt}</code>
      </pre>
    </div>
  );
}
