# ADAegis Portal

[中文版本](README_CN.md)

ADAegis Portal is the web interface for ADAegis, an open security platform focused on Active Directory and enterprise identity environments. The portal gives security teams a unified place to review domain risk, monitor sensors, investigate alerts, manage detection rules, and operate day-to-day AD security workflows.

ADAegis Portal is designed for teams that need clear visibility into domain controllers, users, authentication behavior, Windows security telemetry, scan findings, and identity-driven attack paths.

<p>
  <big>
    <a href="https://youtu.be/Oexs-58C-Fg" style="text-decoration: none;"><strong>Adaegis Introduction:</strong> https://youtu.be/Oexs-58C-Fg</a><br />
    <a href="https://demo.adaegis.net/" style="text-decoration: none;"><strong>Adaegis Demo:</strong> https://demo.adaegis.net/</a>
  </big>
</p>

## What Problems ADAegis Portal Solves

- Active Directory security data is often scattered across logs, tools, and manual checks.
- Security teams need AD security auditing to discover risks and guide hardening work.
- Alerts, scan findings, sensor status, and domain context need to be reviewed in one operational view.
- Identity attacks often require correlating users, hosts, events, network traces, rules, and investigation notes.
- Security operations need a practical workflow for triage, validation, reporting, and follow-up.

ADAegis Portal turns backend detection and assessment capabilities into a usable security operations experience.

## Core Highlights

- **AD security operations portal**: organizes domain assets, sensors, alerts, rules, scan findings, reports, and system status in one UI.
- **Risk discovery and hardening workflow**: helps teams review AD exposure, weak passwords, baseline issues, leaks, and remediation status.
- **Threat investigation**: supports alert review, activity context, rule-driven detection, and follow-up actions from the portal.
- **Integrated telemetry view**: presents Windows event logs, packet-derived context, sensor status, and dashboard metrics through a consistent interface.
- **MCP protocol and AI Agent (coming soon)**: designed to work with the ADAegis MCP-enabled backend; AI Agent capabilities are planned for threat detection, alert investigation, and security operations.
- **Frontend for a deployable stack**: builds into static assets served by the ADAegis backend Docker deployment.
- **Modern web stack**: built with Vue 3, Vite, TypeScript, Pinia, and Element Plus.

## Repositories

- Frontend portal: [github.com/Lingerhk/ada-web](https://github.com/Lingerhk/ada-web)
- Backend and core services: [github.com/Lingerhk/ada](https://github.com/Lingerhk/ada)

The frontend repository should be checked out next to the backend repository when building the full ADAegis image from source.

## Quick Deployment

For most deployments, ADAegis Portal is built and served by the backend stack in `github.com/Lingerhk/ada`.

Keep the repositories as siblings:

```text
adaegis/
  ada/
  ada-web/
```

Then build and start the full stack from the backend repository:

```bash
cd ada/script/docker
./build.sh build backend
docker compose up -d
docker compose ps
```

The build script compiles this portal and copies the generated `dist` directory into the backend image context. The portal is served by `ada_backend` on port `80` by default.

To build only the frontend static assets:

```bash
npm install
npm run build
```

## Local Development

### Prerequisites

- Node.js `16` or newer
- npm `7` or newer
- A reachable ADAegis backend, or the full backend stack running locally

### Start the Dev Server

```bash
npm install
npm run dev
```

Create a local `.env` file when you need to point the portal to a specific backend:

```dotenv
VITE_ADA_API_URL=http://127.0.0.1:80
```

When `VITE_ADA_API_URL` is empty, the portal uses same-origin `/ada.ADA/*` endpoints. When it is set, requests are sent to the configured gRPC-web proxy endpoint.

### Useful Commands

```bash
npm run build
npm run preview
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
```

After backend protobuf changes, update generated frontend API code:

```bash
npm run build-proto
```

## Reporting Issues

Please report bugs, feature requests, and documentation problems through GitHub issues:

- [github.com/Lingerhk/ada-web/issues](https://github.com/Lingerhk/ada-web/issues)

When reporting a problem, include:

- ADAegis Portal version or commit
- Browser and operating system
- Backend version or commit, if relevant
- Deployment or development mode
- Steps to reproduce
- Expected behavior
- Screenshots or console logs, with secrets removed

Community contact:

- Telegram group: [ADAegis Official Support](https://t.me/+6zDk06KqdpBiNjc1)

## License

ADAegis Portal is released under the [MIT License](https://opensource.org/license/mit).

## Status

ADAegis Portal is under active development. UI workflows, backend integration, and documentation may change as the project evolves.
