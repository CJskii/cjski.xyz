import { writeFile } from "node:fs/promises";
// Original vector illustrations: project identities, not screenshots of working UI.
const frame = (title, subtitle, color, art) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#080c16"/><g fill="none" stroke="${color}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${art}</g><text x="70" y="510" fill="#fff" font-family="Arial,sans-serif" font-size="66" font-weight="700" letter-spacing="-2">${title}</text><text x="74" y="565" fill="${color}" font-family="Arial,sans-serif" font-size="27">${subtitle}</text></svg>`;
const projects = [
  [
    "self-hosted-compose",
    "Self-hosted Compose",
    "Your services. Your infrastructure.",
    "#84ceeb",
    `<path d="M710 140v175h240V140M710 225h240M740 180h4m28 0h4m-36 85h4m28 0h4"/><rect x="685" y="115" width="290" height="230" rx="24" fill="#142432"/><path d="M710 190h240m-240 80h240m-215-118h8m22 0h8m-38 78h8m22 0h8m-38 78h8m22 0h8M830 345v47H570v-60m260 60h250v-60"/><rect x="530" y="250" width="80" height="82" rx="14" fill="#142432"/><rect x="1040" y="250" width="80" height="82" rx="14" fill="#142432"/><path d="M550 280h40m-40 20h26m490-20h28m-28 20h28"/>`,
  ],
  [
    "api-starter-auth",
    "API Starter",
    "TypeScript. Auth. A place to start.",
    "#b2a4ee",
    `<path d="M680 248h110m-30 0v-115h155m-155 115v115h155"/><rect x="515" y="196" width="165" height="105" rx="20" fill="#252037"/><path d="m560 226-25 23 25 23m70-46 25 23-25 23m-24-54-16 58"/><rect x="915" y="95" width="150" height="76" rx="16" fill="#252037"/><rect x="915" y="210" width="150" height="76" rx="16" fill="#252037"/><rect x="915" y="325" width="150" height="76" rx="16" fill="#252037"/><path d="M950 133h75m-75 115h75m-75 115h75"/><circle cx="760" cy="248" r="9" fill="#b2a4ee"/>`,
  ],
  [
    "finance-tracker",
    "Finance Tracker",
    "From statements to transactions.",
    "#91d5bc",
    `<path d="M640 110h150l55 55v180H640z" fill="#162e29"/><path d="M790 110v55h55m-165 45h100m-100 40h72m-72 40h90m100-50h60m-20-20 20 20-20 20"/><rect x="970" y="160" width="150" height="210" rx="17" fill="#162e29"/><path d="M995 205h100m-100 40h100m-100 40h100m-100 40h100m-40-140v160"/><path d="m565 175-18 17-18-17m18 17v75h58"/>`,
  ],
  [
    "next-web3-template",
    "Next Web3 Template",
    "Wallets meet the web.",
    "#ebacd5",
    `<rect x="570" y="105" width="300" height="225" rx="24" fill="#2c1a2b"/><path d="M570 155h300m-265-24h5m20 0h5m20 0h5m-30 75h110m-110 35h65m-65 35h100"/><rect x="780" y="240" width="280" height="145" rx="23" fill="#080c16"/><path d="M1060 280h-75v55h75m-45-28h7"/><path d="M980 190v-38h75m-18-18 18 18-18 18"/>`,
  ],
  [
    "tweet-fetcher",
    "Tweet Fetcher",
    "Collect. Track. Export.",
    "#e7c88d",
    `<path d="M555 125h150v90H600l-45 35z" fill="#30291b"/><path d="M585 158h88m-88 26h60"/><path d="M665 270h150v90H710l-45 35z" fill="#30291b"/><path d="M695 303h88m-88 26h60m-75-160h95v145h80"/><rect x="950" y="130" width="160" height="230" rx="18" fill="#30291b"/><path d="M975 180h110m-110 45h110m-110 45h110m-110 45h110m-73-160v180m37-180v180"/>`,
  ],
];
const containerArt = projects.find(
  ([slug]) => slug === "self-hosted-compose",
)[4];
const routeArt = projects.find(([slug]) => slug === "api-starter-auth")[4];
projects.push(
  [
    "token-playground",
    "Token playground",
    "Prompts. Streaming. Structured output.",
    "#b2a4ee",
    routeArt,
  ],
  [
    "lab-home",
    "Home lab",
    "Self-hosted infrastructure.",
    "#91c8b8",
    containerArt,
  ],
  [
    "lab-inference",
    "Local inference",
    "Models, hosted locally.",
    "#84ceeb",
    `<rect x="730" y="140" width="200" height="190" rx="22" fill="#142432"/><path d="M770 175h120v120H770zm-25-60v25m45-25v25m45-25v25m45-25v25m-135 190v25m45-25v25m45-25v25m45-25v25m-175-180h25m-25 45h25m-25 45h25m200-90h25m-25 45h25m-25 45h25M565 200h115m-115 35h80m-80 35h115"/><circle cx="1050" cy="175" r="16" fill="#142432"/><circle cx="1085" cy="235" r="16" fill="#142432"/><circle cx="1050" cy="295" r="16" fill="#142432"/><path d="m1060 190 16 30m0 30-16 30"/>`,
  ],
);
for (const [slug, title, subtitle, color, art] of projects)
  await writeFile(
    `public/projects/${slug}-card.svg`,
    frame(title, subtitle, color, art),
  );
