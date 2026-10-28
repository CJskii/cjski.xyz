import Link from "next/link";
import { PanelsTopLeft } from "lucide-react";
import { ToolMark } from "./tool-mark";
import { EquipmentIllustration } from "./equipment-illustration";

export function WorkstationProfile() {
  return (
    <>
      <div className="workstation-equipment">
        <dl className="workstation-platforms">
          <div>
            <dt>Workstation</dt>
            <dd>
              Ubuntu <span>Local inference & creative workflows</span>
            </dd>
          </div>
          <div>
            <dt>Server</dt>
            <dd>
              Ubuntu <span>Hosted services & lighter model tasks</span>
            </dd>
          </div>
        </dl>
        <EquipmentIllustration scene="workstation" />
      </div>

      <section
        className="workstation-workflow"
        aria-labelledby="local-workflow-heading"
      >
        <h2 id="local-workflow-heading">Conversation or hands-on work.</h2>
        <figure>
          <div className="inference-map">
            <div className="inference-stage">
              <h3>Choose an interface</h3>
              <strong>
                <ToolMark name="opencode" />
                OpenCode
              </strong>
              <span>Coding & task execution</span>
              <strong>
                <PanelsTopLeft
                  className="tool-mark"
                  size={24}
                  aria-hidden="true"
                />
                WebUI
              </strong>
              <span>Conversation & exploration</span>
            </div>
            <div className="inference-stage inference-serving">
              <h3>Run locally</h3>
              <strong>
                <ToolMark name="llama-cpp" />
                llama.cpp
              </strong>
              <span>Model router & MTP</span>
              <strong>
                <ToolMark name="ollama" />
                Ollama
              </strong>
              <span>Local model serving</span>
            </div>
            <div className="inference-stage">
              <h3>Put it to work</h3>
              <strong>Conversations</strong>
              <span>Explore ideas & ask questions</span>
              <strong>Code & tasks</strong>
              <span>Work through OpenCode on my devices</span>
            </div>
          </div>
          <figcaption>
            I control the model settings, including temperature, top-p and
            context length. OpenCode puts model responses to work; WebUI
            provides a conversational interface.
          </figcaption>
        </figure>
      </section>

      <div className="workstation-notes">
        <section>
          <h2>Routing & decoding</h2>
          <p>
            I use llama.cpp’s router to select and serve models, with
            multi-token prediction (MTP) for faster decoding where supported.
            Ollama provides an alternative local runtime.
          </p>
        </section>
        <section>
          <h2>Creative workflows</h2>
          <p>
            I build ComfyUI workflows with open models and community-developed
            nodes. I can change the model, connect different steps and tune
            generation settings for image, video or audio.
          </p>
        </section>
      </div>

      <figure className="workstation-creative">
        <ol
          className="service-flow-path home-control-path"
          aria-label="Custom generation workflow"
        >
          <li>
            <strong>Inputs</strong>
            <span>Prompts & source media</span>
          </li>
          <li>
            <strong>
              <ToolMark name="comfyui" />
              ComfyUI
            </strong>
            <span>Open models & community nodes</span>
            <span>Seed, sampling steps & guidance</span>
          </li>
          <li>
            <strong>Outputs</strong>
            <span>Image, video & audio</span>
          </li>
        </ol>
        <figcaption>
          Choose the model, connect the nodes and tune the generation settings.
        </figcaption>
      </figure>
      <p className="workstation-server-link">
        For browser-based access to the server’s Ollama instance, I also run
        Open WebUI.{" "}
        <Link className="text-link" href="/lab/home-lab">
          Explore the server setup
        </Link>
      </p>
    </>
  );
}
