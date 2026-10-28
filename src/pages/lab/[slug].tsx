import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import { labProjects, type LabProject } from "@/lib/lab";
import { projects } from "@/lib/projects";
import {
  SelectedServices,
  PracticalNotes,
  HomeAutomation,
} from "@/components/lab/lab-presentation";
import {
  AgentOrganisationChart,
  ServiceAccessFlow,
  HomeAssistantFlow,
} from "@/components/lab/service-flows";
import { HomeIntegrations } from "@/components/lab/home-integrations";
import { EquipmentIllustration } from "@/components/lab/equipment-illustration";
import { ToolMark } from "@/components/lab/tool-mark";
import { WorkstationProfile } from "@/components/lab/workstation-profile";
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: labProjects.map((project) => ({ params: { slug: project.id } })),
  fallback: false,
});
export const getStaticProps: GetStaticProps<{ project: LabProject }> = async ({
  params,
}) => {
  const project = labProjects.find((item) => item.id === params?.slug);
  return project ? { props: { project } } : { notFound: true };
};
export default function LabDetail({
  project,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const related = projects.filter((item) =>
    project.relatedProjectIds.some((id) => id === item.id),
  );
  return (
    <PageLayout title={project.title} description={project.summary}>
      <header className="page-heading lab-note-intro">
        <Link className="back-link" href="/lab">
          Lab
        </Link>
        <h1
          className={
            project.id === "home-assistant" ? "branded-page-title" : undefined
          }
        >
          {project.id === "home-assistant" && (
            <ToolMark name="home-assistant" size={48} />
          )}
          <span>{project.title}</span>
        </h1>
        <p className="lead">{project.summary}</p>
      </header>
      {project.id === "home-lab" && (
        <>
          <div className="server-equipment">
            <dl className="equipment-register single-equipment">
              <div>
                <dt>Application server</dt>
                <dd>
                  <strong>AMD Ryzen 9 8945HS</strong>
                  <span>64 GB DDR5 RAM, 4 TB NVMe</span>
                  <span>8 cores, 16 threads</span>
                </dd>
              </div>
            </dl>
            <EquipmentIllustration scene="server" />
          </div>
          <p className="lab-note-copy">
            Applications, data and local AI share the server. Its 64 GB of DDR5
            RAM provides room for small local models handling simple tasks;
            heavier generation runs on my separate workstation.
          </p>
          <ServiceAccessFlow />
          <div className="lab-reference-grid">
            <SelectedServices serverOnly />
            <PracticalNotes />
          </div>
        </>
      )}
      {project.id === "local-inference" && <WorkstationProfile />}
      {project.id === "home-assistant" && (
        <>
          <HomeAutomation detail />
          <HomeAssistantFlow />
          <HomeIntegrations />
        </>
      )}
      {project.id === "agent-organisation" && (
        <>
          <p className="lab-note-copy">
            I run a self-hosted agent organisation using Hermes. The server
            hosts coordination and shared workspaces; configured model routes
            combine local inference with cloud services.
          </p>
          <AgentOrganisationChart />
          <div className="lab-note-sections">
            <section>
              <h2>Coordinated work, shared context</h2>
              <p>
                The CEO assigns scoped tasks to specialist roles. Shared
                workspaces hold the deliverables, while task dependencies
                control when the next stage can begin. QA audits the work
                independently before final review.
              </p>
            </section>
            <section>
              <h2>Autonomy with boundaries</h2>
              <p>
                Agents progress through agreed work and review steps. I retain
                approval over deployment and gated external actions. The
                organisation runs from my server, with local and cloud inference
                configured for different roles.
              </p>
            </section>
          </div>
          <Link className="text-link" href="/lab/local-inference">
            Local inference setup
          </Link>
        </>
      )}
      {related.length > 0 && (
        <section className="lab-related-work">
          <h2>Related work</h2>
          {related.map((item) => (
            <Link
              className="text-link"
              key={item.id}
              href={`/projects/${item.id}`}
            >
              {item.title}
            </Link>
          ))}
        </section>
      )}
    </PageLayout>
  );
}
