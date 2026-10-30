---
title: "Why I run a home lab and what I actually use it for"
description: "A look inside my home lab: useful self-hosted services, subscription trade-offs, how the setup connects, and where AI fits alongside everyday tools."
draft: true
fixture: false
tags: [self-hosting, home-lab]
authors: [cjski]
cover: assets/lab-overview-og.png
---

I started running a home server for a pretty simple reason: I like owning the tools I run and seeing how they actually fit together under the hood. Spinning up a container to see a login screen gets old fast, but running services you genuinely rely on forces you to learn how networking, storage, updates, and backups behave over time.

Subscription fatigue played a part too. A £5 or £10 monthly fee looks harmless on its own until you have a dozen small renewals quietly stacking up for file storage, password managers, notes, and media. Having the option to host some of those tools myself is satisfying, even if a home server isn't a magic money-saving machine.

Here is how my lab is actually put together: the apps in the setup, how I think about the subscription trade-off, how the Docker and reverse-proxy plumbing connects, and where local AI fits alongside everything else.

## Grouping the lab by job

When people talk about home labs, it's easy to get lost in hardware specs or a giant list of seventy container names. I find it much clearer to group the setup by the job each part does: files and storage, media, home automation, networking and deployment, small daily utilities, and AI workloads.

![Home-lab overview grouping files and storage, media, home automation, networking and hosting, everyday tools, and AI experiments.](assets/lab-overview.svg)

*The six main buckets in my home lab: files and storage, media, home automation, networking and deployment, everyday utilities, and AI workloads.*

## Does self-hosting actually save money on subscriptions?

Self-hosting can replace specific paid tools, but only if you count the real costs on your side: hardware, drives, electricity, backups, and the occasional evening spent fixing a broken upgrade.

Before replacing any subscription, I ask what job I'm actually paying for. Syncing files across my own machines or hosting a password vault is straightforward to run locally. Paying for a SaaS tool because other people depend on its uptime, or because you don't want to be on call for it, is a completely reasonable choice.

There is also the hardware and maintenance side:
- **Storage and backups:** Putting files on a single drive in a closet is not a backup plan. Once you care about the data, you end up paying for extra disks and off-box copies.
- **Power:** An always-on server draws power 24/7, and a GPU workstation draws plenty more when it's under load.
- **Time:** Updates occasionally break things. If debugging a container migration on a Sunday evening feels like a fun project, self-hosting is great. If it feels like unpaid IT support, keep the subscription.

For me, the win isn't a spreadsheet savings total—it's having control over my own data and a live environment where I can test new software without spinning up a cloud bill every time.

## Nextcloud, Samba and the other self-hosted services

The services cover file access, media, home automation and smaller utilities.

### Files and storage

I use [Nextcloud](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/nextcloud/docker-compose.yaml) when I want a web interface for accessing and sharing files across devices, and [Samba](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/samba/docker-compose.yaml) when I just want a network share mounted directly on my desktop.

Those two tools solve different access problems, and neither one replaces a backup strategy. Before relying on a stateful service, check where its volume lives and how you'd restore it after a drive failure.

### Media

[Plex](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/plex/docker-compose.yaml) is the front end I use for streaming my media library at home and away. Around it sits the usual automation stack: [Overseerr](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/overseerr/docker-compose.yaml) handles search and requests, [Sonarr](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/sonarr/docker-compose.yaml) tracks TV series, and [Radarr](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/radarr/docker-compose.yaml) tracks films.

When someone requests a title in Overseerr, the request passes to Sonarr or Radarr, which hand the job to the download client and import the finished file into the media library folder. Plex reads from that library and streams it to the client device.

![Media workflow from an Overseerr request through Sonarr or Radarr and a configured download client to the library, then Plex and viewing devices.](assets/media-flow.svg)

*How a media request flows through Overseerr, Sonarr or Radarr, and the storage library before Plex serves it to a device.*

What makes this stack satisfying is that each container has one small job. Once the folders and API keys are wired up between them, the whole pipeline stays out of the way.

### Home automation

Home Assistant is where I've been working on the interface to the house: YAML dashboards, room-specific views, and how existing device groups and scenes fit together.

A lot of that work is deciding what deserves to be on the screen. Lighting controls and a quick view of device status should be easy to find; settings and less-used controls can sit a level deeper. I still want a wall switch to do its job. The dashboard should help when I want a broader view of what's going on.

### Small utilities and automation

Some of the most useful containers in the lab are the smallest ones:
- **[Vaultwarden](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/vaultwarden/docker-compose.yaml)** for password management
- **[PrivateBin](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/privatebin/docker-compose.yaml)** for quick encrypted paste sharing
- **[DocuSeal](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/docuseal/docker-compose.yaml)** for filling and signing documents
- **[n8n](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/n8n/docker-compose.yaml)** and **[ntfy](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/ntfy/docker-compose.yaml)** for workflow automation and push notifications

A password vault needs more care with updates and backups than a temporary paste tool or a test workflow in n8n.

## How the llama.cpp router fits between the server and GPU workstation

My local setup includes a small `llama.cpp` router that automatically starts and shuts down models on demand. [Ollama and Open WebUI](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/open-webui/docker-compose.yaml) are part of the setup too, with cloud APIs as another option. Shutting down idle models frees up VRAM when I'm using the workstation for something else.

The lab has an always-on home server and a separate GPU workstation for local model inference. The GPU box can be asleep or busy, so a running web interface doesn't mean a local model is ready to answer.

## How Docker, Coolify, Portainer, Watchtower, and Traefik fit together

Docker runs the containers; Coolify, Portainer, Watchtower and Traefik handle deployment, inspection, image updates and web routing.

- **[Coolify](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/coolify/README.md)** handles source builds and deployments for some of my own applications.
- **[Portainer](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/portainer/docker-compose.yaml)** gives me a global view of the containers and a way to manage them, including deploying some open-source services.
- **[Watchtower](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/watchtower/docker-compose.yaml)** handles image updates for selected services.
- **[Traefik](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection/blob/main/traefik/docker-compose.yaml)** acts as the reverse proxy at the edge, reading Docker labels and routing incoming HTTPS requests to the right container port.

![Separate roles around Docker: Coolify builds and deploys projects, Portainer manages containers and stacks, Watchtower updates selected images, and Traefik routes web requests to applications.](assets/container-roles.svg)

*How the four management and routing tools sit around Docker: Coolify deploys apps, Portainer inspects stacks, Watchtower updates selected images, and Traefik routes live web traffic.*

When a browser requests a page, it never touches Portainer, Watchtower, or Coolify's management UI. DNS points the domain at the entry point, Traefik terminates HTTPS and matches the hostname rule, and the request goes straight to the target container.

Keeping those responsibilities separate makes troubleshooting much faster: if a build fails, I check Coolify; if a container is crash-looping, I check Docker or Portainer logs; if a URL returns a 404 or bad gateway, I check Traefik labels and DNS.

## Where the configs live

I keep sanitised Docker Compose files for the services mentioned here in my [self-hosted Docker Compose collection on GitHub](https://github.com/cjski-selfhosted/self-hosted_docker_compose_collection). It covers the file and media stacks, smaller utilities, and services I deploy through Coolify. Each stack has an environment example so you can set your own paths and credentials.

My actual server paths, keys and configuration files stay in a separate private backup. Home Assistant YAML and the `llama.cpp` router setup aren't in the public collection yet. I'll add those as I write the deeper walkthroughs.
