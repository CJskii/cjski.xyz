import integrations from "../../../content/home-integrations.json";

export function HomeIntegrations() {
  return (
    <details className="home-integrations">
      <summary>Selected integrations</summary>

      <dl>
        {integrations.map((group) => (
          <div key={group.title}>
            <dt>{group.title}</dt>
            <dd>{group.services}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
