import styles from "./home-security-flow.module.css";
import {
  ArrowRight,
  BrainCircuit,
  Camera,
  Database,
  House,
  Lightbulb,
  Server,
  Smartphone,
  Video,
  Volume2,
  Workflow,
} from "lucide-react";

const stages = [
  { title: "Cameras", icon: Camera, text: "Video feeds go to the recorder." },
  { title: "Uniview NVR", icon: Server, text: "Records video, detects objects and pushes Alarm / Structure reports." },
  { title: "Home Security API", icon: Database, text: "Receiver → event index → zone checks → rules and cooldowns → delivery worker." },
  { title: "Node-RED", icon: Workflow, text: "Checks the signed webhook, prevents replay and routes the alert." },
  { title: "Home Assistant", icon: House, text: "Calls the mobile app notification service and runs configured automations." },
];
const endpoints = [
  { name: "Alarm / Structure pushes", route: "System/Event/Notification/*", data: "Channel, source object IDs, category, time and object coordinates.", use: "Create the event, identify the object and check its location." },
  { name: "Detection zones", route: "Channels/{id}/Smart/AccessZone", data: "Enabled rules and polygon vertices.", use: "Sync zone geometry and apply local AI and notification settings." },
  { name: "Camera configuration", route: "Media/OSDs · Streams/DetailInfos", data: "Camera names, codec, resolution, frame rate and stream enablement.", use: "Keep camera labels and available stream profiles up to date." },
  { name: "Original event images", route: "Smart/ObjectSearch · System/Picture", data: "Original scene and native object-crop references.", use: "Load event details and render annotated phone images on demand." },
];

export function HomeSecurityFlow() {
  return (
    <>
      <section className={`project-scope ${styles["security-flow-section"]}`} aria-labelledby="security-flow-title">
        <h2 id="security-flow-title">From the cameras to Home Assistant</h2>
        <figure className={styles["security-flow"]}>
          <ol className={styles["security-flow-stages"]} aria-label="Initial notification data flow">
            {stages.map(({ title, icon: Icon, text }, index) => (
              <li key={title}>
                <span className={styles["security-flow-number"]}>{index + 1}</span>
                <Icon size={26} strokeWidth={1.6} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
                {index < stages.length - 1 && <ArrowRight className={styles["security-flow-arrow"]} size={20} aria-hidden="true" />}
              </li>
            ))}
          </ol>
          <div className={styles["security-automation-paths"]} aria-label="Home Assistant actions">
            <span><Smartphone size={18} aria-hidden="true" /> Phone push <small>In use</small></span>
            <span><Volume2 size={18} aria-hidden="true" /> Voice announcement <small>Customizable</small></span>
            <span><Lightbulb size={18} aria-hidden="true" /> House lights <small>Customizable</small></span>
          </div>
          <figcaption>The Node-RED flow is where I can change what happens after a matching event: a phone alert now, or a voice announcement or light action if configured later.</figcaption>
        </figure>
        <div className={styles["security-side-paths"]}>
          <div>
            <BrainCircuit size={23} aria-hidden="true" />
            <h3>AI runs alongside the alert</h3>
            <p>Selected event → original scene + crop → Ollama / Qwen → accepted description → silent update to the same phone notification.</p>
          </div>
          <div>
            <Video size={23} aria-hidden="true" />
            <h3>Live video has its own path</h3>
            <p>NVR H.264 substream → private go2rtc gateway → authenticated dashboard stream, with the saved zone polygons overlaid.</p>
          </div>
        </div>
      </section>
      <section className={`project-scope ${styles["security-flow-section"]}`} aria-labelledby="security-api-title">
        <h2 id="security-api-title">What I get from the Uniview API</h2>
        <p className={styles["security-api-intro"]}>The integration uses Uniview&apos;s LAPI endpoints. These are the reports and settings the application reads from my recorder.</p>
        <div className={styles["security-api-grid"]}>
          {endpoints.map(({ name, route, data, use }) => (
            <div key={name}>
              <h3>{name}</h3>
              <code>{route}</code>
              <p>{data}</p>
              <p className={styles["security-api-use"]}>{use}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
