import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const prefersReducedMotion = () => window.matchMedia(motionQuery).matches;
const serverMotionPreference = () => true;

function GraphicsCard({ metal }: { metal: string }) {
  const octagon = (r: number) => {
    const diagonal = r * 0.7071;
    return `0,${-r} ${diagonal},${-diagonal} ${r},0 ${diagonal},${diagonal} 0,${r} ${-diagonal},${diagonal} ${-r},0 ${-diagonal},${-diagonal}`;
  };
  return (
    <g stroke="var(--hardware-edge)" strokeWidth="1.2" strokeLinejoin="round">
      <path
        d="m10 23 20-20h445l24 20 13 14v126l-24 22H26L0 163V36z"
        fill="var(--hardware-gpu-depth)"
      />
      <path
        d="M0 26 23 7h446l21 19v132l-21 21H23L0 158z"
        fill="var(--hardware-gpu-face)"
      />
      <path d="M23 7h446l-30 22H48z" fill={`url(#${metal})`} />
      <path
        d="m0 26 48 3-28 42L0 58zm490 0-51 3 31 42 20-13zM0 137l30 15 18 27H23L0 158zm490 0-30 15-21 27h30l21-21z"
        fill={`url(#${metal})`}
      />
      <path
        d="m127 7 62 0-28 45zm174 0 66 0-37 45z"
        fill="var(--hardware-metal-light)"
      />
      <path
        d="m136 179 57-1-29-38zm168 0 52-1-26-38z"
        fill={`url(#${metal})`}
      />
      <path d="M490 26l12 13v117l-12 2z" fill="var(--hardware-gpu-depth)" />
      {Array.from({ length: 32 }, (_, i) => (
        <path
          key={i}
          d={`M${34 + i * 13.5} 164v10`}
          stroke="var(--hardware-metal)"
          strokeWidth=".75"
          opacity=".45"
        />
      ))}
      {[86, 245, 404].map((cx) => (
        <g key={cx} transform={`translate(${cx} 92)`}>
          <polygon
            points={octagon(72)}
            fill={`url(#${metal})`}
            stroke="var(--hardware-gpu-rim)"
          />
          <polygon points={octagon(67)} fill="var(--hardware-gpu-depth)" />
          <circle
            r="62"
            fill="var(--hardware-gpu-well)"
            stroke="var(--hardware-gpu-rim)"
          />
          <g className="hardware-fan">
            {Array.from({ length: 7 }, (_, i) => (
              <g key={i} transform={`rotate(${(i * 360) / 7})`}>
                <path
                  d="M-9-13C-44-19-55-45-30-56-12-61-12-39 1-23L12-9z"
                  fill={`url(#${metal}-fan)`}
                  stroke="var(--hardware-gpu-blade-edge)"
                  strokeWidth=".7"
                />
                <path
                  d="M-32-49q-11 12 1 25m5-28q-8 10 1 22m6-23q-5 9 3 20"
                  fill="none"
                  stroke="var(--hardware-gpu-blade-edge)"
                  strokeWidth=".6"
                  opacity=".65"
                />
              </g>
            ))}
          </g>
          <circle
            r="16"
            fill={`url(#${metal})`}
            stroke="var(--hardware-gpu-rim)"
          />
          <circle
            r="12"
            fill="none"
            stroke="var(--hardware-metal-light)"
            strokeWidth=".8"
          />
          <path
            d="m-5 0 5-7 5 7-5 7z"
            fill="none"
            stroke="var(--hardware-edge)"
            strokeWidth=".9"
          />
        </g>
      ))}
      <path d="M175 179v14h140v-14" fill="var(--hardware-connector)" />
      {Array.from({ length: 18 }, (_, i) => (
        <path
          key={i}
          d={`M${181 + i * 7.5} 182v9`}
          stroke="var(--hardware-edge)"
          strokeWidth=".6"
        />
      ))}
      <path
        d="m154 23 9 18m166-18 9 18m-180 111 7 14m164-14 7 14"
        stroke="var(--hardware-light)"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="hardware-led"
      />
      <path d="M503 41h9v105h-9" fill="var(--hardware-metal)" />
    </g>
  );
}

function MiniServer({ metal }: { metal: string }) {
  return (
    <g stroke="var(--hardware-edge)" strokeWidth="1.7" strokeLinejoin="round">
      <path
        d="m0 37 43-30h190l36 30v104l-19 13H17L0 141z"
        fill={`url(#${metal})`}
      />
      <path d="M0 37h269M43 7v30m190-30v30" fill="none" />
      <path d="M14 53h241v76H14z" fill="var(--hardware-inset)" />
      <rect
        x="34"
        y="76"
        width="37"
        height="12"
        rx="2"
        fill="var(--hardware-port)"
      />
      <rect
        x="87"
        y="76"
        width="37"
        height="12"
        rx="2"
        fill="var(--hardware-port)"
      />
      <path
        d="M41 79h23m30 0h23"
        stroke="var(--hardware-usb)"
        strokeWidth="3"
      />
      <rect
        x="144"
        y="78"
        width="20"
        height="8"
        rx="4"
        fill="var(--hardware-metal)"
      />
      <circle cx="220" cy="83" r="12" fill="var(--hardware-metal)" />
      <path d="M220 76v6m-5-3a7 7 0 1 0 10 0" fill="none" strokeWidth="1.2" />
      <circle
        className="hardware-led"
        cx="220"
        cy="109"
        r="2.5"
        fill="var(--hardware-light)"
        stroke="none"
      />
      {Array.from({ length: 13 }, (_, i) => (
        <path key={i} d={`M${57 + i * 12} 18l-9 7`} opacity=".35" />
      ))}
      <path d="M21 154v8h29v-8m169 0v8h29v-8" fill="var(--hardware-port)" />
    </g>
  );
}

function RaspberryPi() {
  return (
    <g stroke="var(--hardware-edge)" strokeWidth="1.4" strokeLinejoin="round">
      <rect width="140" height="181" rx="12" fill="var(--hardware-board)" />
      {[12, 128].flatMap((x) =>
        [12, 169].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="var(--page)" />
        )),
      )}
      <rect
        x="46"
        y="60"
        width="49"
        height="48"
        rx="3"
        fill="var(--hardware-chip)"
      />
      <path d="M55 68h31v31H55z" fill="none" stroke="var(--hardware-metal)" />
      <rect
        x="16"
        y="21"
        width="106"
        height="13"
        rx="2"
        fill="var(--hardware-port)"
      />
      {Array.from({ length: 18 }, (_, i) => (
        <path
          key={i}
          d={`M${21 + i * 5.5} 24v7`}
          stroke="var(--hardware-connector)"
          strokeWidth="2"
        />
      ))}
      <rect
        x="2"
        y="73"
        width="24"
        height="37"
        rx="2"
        fill="var(--hardware-metal)"
      />
      <rect
        x="8"
        y="134"
        width="38"
        height="47"
        rx="2"
        fill="var(--hardware-metal)"
      />
      <rect
        x="55"
        y="140"
        width="32"
        height="41"
        rx="2"
        fill="var(--hardware-metal)"
      />
      <rect
        x="96"
        y="140"
        width="32"
        height="41"
        rx="2"
        fill="var(--hardware-metal)"
      />
      <path
        d="M15 145h24v29H15zm47 7h18v22H62zm41 0h18v22h-18"
        fill="var(--hardware-port)"
      />
      <path d="M96 58h22v53H96M35 117h59m-47 6h67" fill="none" opacity=".6" />
      <circle
        className="hardware-led"
        cx="120"
        cy="123"
        r="3"
        fill="var(--hardware-light)"
        stroke="none"
      />
    </g>
  );
}

function Home() {
  return (
    <g stroke="var(--hardware-edge)" strokeWidth="1.8" strokeLinejoin="round">
      <path d="m0 64 75-62 75 62v125H0z" fill="var(--surface)" />
      <path d="m-11 64 86-73 86 73" fill="none" strokeWidth="4" />
      <path d="M25 90h28v31H25zm72 0h28v31H97z" fill="var(--hardware-window)" />
      <path d="M60 189v-49h30v49" fill="var(--subtle)" />
      <path d="M39 90v31m72-31v31m-86-16h28m44 0h28" fill="none" />
      <circle cx="81" cy="166" r="2" fill="var(--accent-ink)" stroke="none" />
    </g>
  );
}

export function EquipmentIllustration({
  scene = "lab",
}: {
  scene?: "lab" | "workstation" | "server";
}) {
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    prefersReducedMotion,
    serverMotionPreference,
  );
  const [motionChoice, setMotionChoice] = useState<"auto" | "play" | "pause">(
    "auto",
  );
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("cjski-hardware-motion");
      if (saved === "play" || saved === "pause") setMotionChoice(saved);
    } catch {
      /* Storage may be unavailable; the local control still works. */
    }
  }, []);
  function toggleMotion() {
    const next = moving ? "pause" : "play";
    setMotionChoice(next);
    try {
      window.localStorage.setItem("cjski-hardware-motion", next);
    } catch {
      /* Keep the choice for this visit. */
    }
  }
  const moving =
    motionChoice === "play" ||
    (motionChoice === "auto" && scene !== "server" && !reducedMotion);
  const metal = `equipment-metal-${useId().replace(/:/g, "")}`;
  const descriptions = {
    lab: "Illustration of a silver triple-fan graphics card, compact UM-style server, Raspberry Pi and house.",
    workstation:
      "Illustration of a silver triple-fan graphics card for local AI work.",
    server: "Illustration of a compact UM-style server and Raspberry Pi.",
  };
  return (
    <figure
      className={`equipment-visual equipment-${scene}`}
      data-moving={moving}
      data-motion-choice={motionChoice}
    >
      <svg
        className="lab-equipment-art"
        viewBox={
          scene === "lab"
            ? "0 0 760 560"
            : scene === "workstation"
              ? "0 0 570 270"
              : "0 0 520 290"
        }
        role="img"
        aria-label={descriptions[scene]}
      >
        <defs>
          <linearGradient id={`${metal}-fan`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--hardware-gpu-blade-light)" />
            <stop offset=".5" stopColor="var(--hardware-gpu-blade)" />
            <stop offset="1" stopColor="var(--hardware-gpu-well)" />
          </linearGradient>
          <pattern
            id={`${metal}-grid`}
            width="26"
            height="26"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.1" fill="currentColor" opacity=".22" />
          </pattern>
          <linearGradient id={metal} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--hardware-metal-light)" />
            <stop offset=".48" stopColor="var(--hardware-metal)" />
            <stop offset="1" stopColor="var(--hardware-metal-light)" />
          </linearGradient>
        </defs>
        <rect
          x="8"
          y="8"
          width={scene === "lab" ? 744 : scene === "workstation" ? 554 : 504}
          height={scene === "lab" ? 544 : scene === "workstation" ? 254 : 274}
          rx="24"
          fill={`url(#${metal}-grid)`}
        />
        {scene === "lab" ? (
          <>
            <ellipse
              cx="365"
              cy="495"
              rx="310"
              ry="13"
              fill="currentColor"
              opacity=".05"
            />
            <g transform="translate(133 56) rotate(-8 245 90)">
              <GraphicsCard metal={metal} />
            </g>
            <g transform="translate(31 328) rotate(-4 130 80)">
              <MiniServer metal={metal} />
            </g>
            <g transform="translate(339 296) rotate(8 70 90)">
              <RaspberryPi />
            </g>
            <g transform="translate(554 299)">
              <Home />
            </g>
          </>
        ) : scene === "workstation" ? (
          <g transform="translate(30 37) rotate(-7 245 90)">
            <GraphicsCard metal={metal} />
          </g>
        ) : (
          <>
            <g transform="translate(20 91) rotate(-4 130 80)">
              <MiniServer metal={metal} />
            </g>
            <g transform="translate(346 47) rotate(8 70 90)">
              <RaspberryPi />
            </g>
          </>
        )}
      </svg>
      {scene !== "server" && (
        <button
          type="button"
          className="hardware-motion-control"
          aria-label={
            moving
              ? "Pause animation of hardware illustration"
              : "Play animation of hardware illustration"
          }
          aria-pressed={moving}
          title={
            reducedMotion && motionChoice === "auto"
              ? "Animation is off to match your reduced-motion preference. You can play it here."
              : undefined
          }
          onClick={toggleMotion}
        >
          {moving ? (
            <Pause size={13} aria-hidden="true" />
          ) : (
            <Play size={13} aria-hidden="true" />
          )}
          {moving ? "Pause animation" : "Play animation"}
        </button>
      )}
    </figure>
  );
}
