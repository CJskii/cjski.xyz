import Link from "next/link";
import { ToolMark } from "./tool-mark";
import { serviceGroups } from "@/lib/lab";
import homeAutomations from "../../../content/home-automation.json";
export { EquipmentIllustration } from "./equipment-illustration";
export function EquipmentDetails({
  workstationOnly = false,
}: {
  workstationOnly?: boolean;
}) {
  return (
    <dl
      className={
        workstationOnly
          ? "equipment-register single-equipment"
          : "equipment-register"
      }
    >
      <div>
        <dt>AI workstation</dt>
        <dd>
          <strong>Local AI & generation</strong>
          <span>llama.cpp, Ollama, ComfyUI</span>
        </dd>
      </div>
      {!workstationOnly && (
        <div>
          <dt>Application server</dt>
          <dd>
            <strong>AMD Ryzen 9 8945HS</strong>
            <span>64 GB DDR5 RAM, 4 TB NVMe</span>
            <span>8 cores, 16 threads</span>
          </dd>
        </div>
      )}
    </dl>
  );
}
export function SelectedServices({
  serverOnly = false,
}: {
  serverOnly?: boolean;
}) {
  return (
    <section
      className="selected-lab-services"
      aria-labelledby="selected-services-heading"
    >
      <h2 id="selected-services-heading">Selected stack</h2>
      <dl>
        {(serverOnly ? serviceGroups : serviceGroups.slice(0, 5)).map(
          (group) => (
            <div key={group.id}>
              <dt>{group.title}</dt>
              <dd>
                {group.services
                  .filter(
                    (service) => !serverOnly || service !== "Home Assistant",
                  )
                  .join(", ")}
                <span className="service-purpose">{group.purpose}</span>
              </dd>
            </div>
          ),
        )}
      </dl>
      {!serverOnly && (
        <details className="more-lab-services">
          <summary>Files, media & everyday tools</summary>
          <dl>
            {serviceGroups.slice(5).map((group) => (
              <div key={group.id}>
                <dt>{group.title}</dt>
                <dd>
                  {group.services.join(", ")}
                  <span className="service-purpose">{group.purpose}</span>
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </section>
  );
}
export function PracticalNotes() {
  return (
    <section
      className="lab-practical-notes"
      aria-labelledby="lab-notes-heading"
    >
      <h2 id="lab-notes-heading">A few implementation details</h2>
      <ul>
        <li>
          <strong>Shared storage.</strong> Jellyfin and Plex read the same
          underlying media folders.
        </li>
        <li>
          <strong>Persistent data.</strong> Application and database data live
          outside the containers that run them.
        </li>
        <li>
          <strong>Routes from labels.</strong> Docker labels configure Traefik
          routing and automatic TLS. New services use the existing proxy setup.
        </li>
      </ul>
      <Link
        className="text-link"
        href="https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection"
        target="_blank"
        rel="noopener noreferrer"
      >
        Browse the Compose collection
      </Link>
    </section>
  );
}
export function LabReadingLinks() {
  return (
    <nav className="lab-profile-links" aria-label="Lab notes">
      <Link href="/lab/home-lab">Server setup</Link>
      <Link href="/lab/local-inference">Local AI & generation</Link>
      <Link href="/lab/home-assistant">Home Assistant</Link>
      <Link href="/lab/agent-organisation">Agent organisation</Link>
    </nav>
  );
}

export function HomeAutomation({ detail = false }: { detail?: boolean }) {
  if (detail)
    return (
      <section className="home-outcomes" aria-label="Home Assistant in use">
        <article>
          <h2>Everyday automation</h2>
          <p>Lighting, heating schedules and bin reminders.</p>
        </article>
        <article>
          <h2>Energy</h2>
          <p>Solar generation and energy monitoring in one view.</p>
        </article>
        <article>
          <h2>Visibility</h2>
          <p>
            My custom-built security dashboard, camera alerts and hosted-service
            health.
          </p>
        </article>
      </section>
    );
  return (
    <section
      className="home-automation-feature"
      aria-labelledby="automation-heading"
    >
      <div>
        <h2 id="automation-heading">
          <ToolMark name="home-assistant" size={28} />
          Home Assistant
        </h2>
        <p>
          My view of the house: devices, energy and hosted services, with
          everyday automations in one place.
        </p>
        {!detail && (
          <Link className="lab-secondary-link" href="/lab/home-assistant">
            MQTT, Node-RED & integrations
          </Link>
        )}
      </div>
      <dl>
        {homeAutomations.map((item) => (
          <div key={item.title}>
            <dt>{item.title}</dt>
            <dd>{item.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
