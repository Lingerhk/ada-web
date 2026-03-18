# ADAegis Portal

`ada-web` is the frontend portal for ADAegis. It is built with Vue 3, Vite, TypeScript, Pinia, and Element Plus.

## Common Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
```

## Environment Variables

Create a `.env` file and configure at least:

```dotenv
VITE_ADA_API_URL=http://127.0.0.1:80
```

Notes:

- When left empty, the frontend sends requests to the same-origin `/ada.ADA/*` endpoints.
- When set, the frontend sends requests directly to the configured gRPC-web proxy endpoint.

## Updating Proto Files

Run this after backend `ada.proto` changes:

```bash
npm run build-proto
```

## Related Docs

- Repository overview: [`../README.md`](../README.md)
- Architecture: [`../docs/architecture.md`](../docs/architecture.md)
- Local development: [`../docs/local-development.md`](../docs/local-development.md)

Additional Notes:

- `lint` and `typecheck` currently focus on the frontend build config, chunk splitting logic, and the newly added test baseline.
- `test:unit` and `test:e2e` provide lightweight function-level validation and a minimal login smoke test.
