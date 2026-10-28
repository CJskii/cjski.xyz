import Image from "next/image";

const marks = {
  "home-assistant": "/brands/home-assistant.svg",
  ollama: "/brands/ollama.svg",
  "llama-cpp": "/brands/llama-cpp.svg",
  comfyui: "/brands/comfyui.ico",
  opencode: "/brands/opencode.svg",
  duckdns: "/brands/duckdns.png",
  cloudflare: "/brands/cloudflare.svg",
  traefik: "/brands/traefik.png",
};

export function ToolMark({
  name,
  size = 24,
}: {
  name: keyof typeof marks;
  size?: number;
}) {
  return (
    <Image
      src={marks[name]}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      unoptimized
      className={`tool-mark tool-mark-${name}`}
    />
  );
}
