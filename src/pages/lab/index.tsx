import Link from "next/link";
import { PageLayout } from "@/components/page-layout";
import {
  EquipmentIllustration,
  EquipmentDetails,
  SelectedServices,
  PracticalNotes,
  LabReadingLinks,
  HomeAutomation,
} from "@/components/lab/lab-presentation";
import { ServiceFlows } from "@/components/lab/service-flows";
export default function Lab() {
  return (
    <PageLayout
      title="Homelab"
      description="Local AI, self-hosted services, Home Assistant automation and a server-hosted agent organisation."
    >
      <header className="homelab-hero">
        <div>
          <h1>
            At home.
            <br />
            Self-hosted.
          </h1>
          <p className="homelab-lead">
            Local AI, everyday services and home automation.
          </p>
          <p>
            A local workstation for language models and generative work. A home
            server for applications and data. Home Assistant for automations
            around the house.
          </p>
        </div>
        <EquipmentIllustration />
      </header>
      <HomeAutomation />
      <EquipmentDetails />
      <section className="lab-use-cases" aria-label="What I use the setup for">
        <article>
          <h2>AI & generation</h2>
          <p>
            llama.cpp and Ollama handle local LLM work. ComfyUI is where I build
            custom image, video and audio workflows.
          </p>
          <Link className="text-link" href="/lab/local-inference">
            Workstation notes
          </Link>
        </article>
        <article>
          <h2>Self-hosted services</h2>
          <p>
            Applications, databases, files and media run on the server, with
            container deployment, routing and monitoring around them.
          </p>
          <Link className="text-link" href="/lab/home-lab">
            Server notes
          </Link>
        </article>
      </section>
      <section
        className="lab-agent-intro"
        aria-labelledby="agent-organisation-heading"
      >
        <div>
          <h2 id="agent-organisation-heading">
            An agent organisation, self-hosted.
          </h2>
          <p>
            I run Hermes on the server as an agent organisation. A CEO
            coordinates engineering, growth, research and QA, with specialist
            roles handling the work.
          </p>
        </div>
        <Link className="text-link" href="/lab/agent-organisation">
          Explore the agent setup
        </Link>
      </section>
      <ServiceFlows />
      <div className="lab-reference-grid">
        <SelectedServices />
        <PracticalNotes />
      </div>
      <LabReadingLinks />
    </PageLayout>
  );
}
