import { ToolMark } from "./tool-mark";
import agentRoles from "../../../content/agent-roles.json";

export function ServiceAccessFlow() {
  return (
    <figure className="service-flow access-map">
      <ul
        className="access-origins"
        aria-label="Two access paths into Traefik"
        role="list"
      >
        <li>
          <strong>
            <ToolMark name="duckdns" />
            DuckDNS
          </strong>
          <span>Home-network domain names</span>
        </li>
        <li>
          <strong>
            <ToolMark name="cloudflare" />
            Cloudflare Tunnel
          </strong>
          <span>Selected public services</span>
        </li>
      </ul>
      <div className="access-proxy">
        <strong>
          <ToolMark name="traefik" />
          Traefik
        </strong>
        <span>Container labels, routing & automatic TLS</span>
      </div>
      <div className="access-destination">
        <strong>Selected applications</strong>
        <span>Services hosted on the server</span>
      </div>
      <figcaption>
        Home-network requests reach the proxy directly; selected public services
        are reached through Cloudflare.
      </figcaption>
    </figure>
  );
}

export function HomeAssistantFlow() {
  return (
    <figure className="service-flow ha-hub-map">
      <div className="ha-central">
        <strong>
          <ToolMark name="home-assistant" />
          Home Assistant
        </strong>
        <span>One view of the house</span>
      </div>
      <ul
        className="ha-branches"
        aria-label="Connections around Home Assistant"
        role="list"
      >
        <li className="ha-devices">
          <strong>Devices</strong>
          <span>MQTT & direct integrations</span>
        </li>
        <li className="ha-logic">
          <strong>Node-RED</strong>
          <span>Custom workflows</span>
        </li>
        <li className="ha-energy">
          <strong>Energy</strong>
          <span>Solar & energy integrations</span>
        </li>
        <li className="ha-services">
          <strong>Services</strong>
          <span>Health & availability</span>
        </li>
      </ul>
      <figcaption>
        Home Assistant brings the state together. MQTT carries device messages;
        Node-RED adds custom logic.
      </figcaption>
    </figure>
  );
}

export function AgentOrganisationChart() {
  return (
    <figure className="org-chart">
      <div className="org-node org-principal">
        <strong>Me</strong>
        <span>Human principal</span>
      </div>
      <svg className="org-conversation" viewBox="0 0 24 44" aria-hidden="true">
        <path d="M12 3v38M6 9l6-6 6 6M6 35l6 6 6-6" />
      </svg>
      <ul
        className="org-tree"
        aria-label="Agent organisation led by the CEO"
        role="list"
      >
        <li>
          <div className="org-node org-chief">
            <strong>CEO</strong>
            <span>Orchestration, delegation & review</span>
          </div>
          <ul
            className="org-reports"
            aria-label="Specialists coordinated by the CEO"
            role="list"
          >
            {agentRoles.map((group) => (
              <li key={group.title}>
                <div className="org-function">
                  <h3>{group.title}</h3>
                  <ul
                    aria-label={`${group.title} specialist roles`}
                    role="list"
                  >
                    {group.roles.map((role) => (
                      <li key={role.title}>
                        <strong>{role.title}</strong>
                        <span>{role.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </li>
      </ul>
      <figcaption>
        The CEO is my point of contact and coordinates all specialist agents,
        grouped here by function.
      </figcaption>
    </figure>
  );
}

export function ServiceFlows() {
  return (
    <section
      className="service-connections"
      aria-labelledby="service-connections-heading"
    >
      <h2 id="service-connections-heading">How it connects</h2>
      <details>
        <summary>Reaching hosted services</summary>
        <ServiceAccessFlow />
      </details>
      <details>
        <summary>Home Assistant in action</summary>
        <HomeAssistantFlow />
      </details>
      <details>
        <summary>The agent organisation</summary>
        <AgentOrganisationChart />
      </details>
    </section>
  );
}
