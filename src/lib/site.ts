export const site = {
  name: "CJSKI",
  role: "Software & AI engineer",
  origin: "https://cjski.dev",
  publication: "Cold Boot",
  description:
    "CJSKI, software and AI engineer. Web applications, AI systems and integrations.",
  x: "https://x.com/cjski_",
  handle: "@cjski_",
  github: "https://github.com/CJskii",
  email: "devcj@pm.me",
  booking: "https://cal.com/cjski",
  authorPath: "/authors/cjskii",
};
export const navigation = [
  { href: "/projects", label: "Projects" },
  { href: "/lab", label: "Lab" },
  { href: "/blog", label: "Blog" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Keep unconfirmed destinations null; use only owner-provided public links.
export const publicationLinks: {
  blog: string | null;
  newsletter: string | null;
} = { blog: null, newsletter: "https://cjski.beehiiv.com/subscribe" };

// Public form ID, not an API credential. Shared by Next and the Astro renderer.
export const newsletterSignup = {
  scriptUrl: "https://subscribe-forms.beehiiv.com/v3/loader.js",
  formId: "ec2b6303-069c-409f-9f2a-2c2d2ec20620",
};
