# ADAegis Portal

## Description

This project is the frontend web portal for the ADAegis Threat Protection platform. It allows users to manage configurations, monitor system status, view security events, and interact with the backend ADAegis services.

## Features

*   User Authentication & Management
*   Domain Configuration & Management
*   Sensor Configuration & Monitoring
*   System Information & Monitoring
*   Threat Detection (Events, Activities, Rules, Whitelists, Blocking)
*   Risk Detection (Baseline, Leaks, Weak Passwords)
*   Scan Task Management & Configuration
*   Dashboard & Reporting
*   Internationalization (i18n) Support (English, Chinese)
*   Role-Based Access Control (implied)

## Tech Stack

*   **Framework:** [Vue 3](https://vuejs.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Library:** [Element Plus](https://element-plus.org/)
*   **State Management:** [Pinia](https://pinia.vuejs.org/)
*   **API Communication:** [gRPC-web](https://github.com/grpc/grpc-web)
*   **Routing:** [Vue Router](https://router.vuejs.org/)
*   **Internationalization:** [Vue I18n](https://vue-i18n.intlify.dev/)

## Project Setup

### Prerequisites

*   [Node.js](https://nodejs.org/) (version >= 16 recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repository-url>
    cd ada-web
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Environment Variables

Create a `.env` file in the project root based on the `.env.example` file.

```dotenv
# Example .env file
VITE_ADA_API_URL=<your_backend_grpc_web_proxy_url>
```

*   `VITE_ADA_API_URL`: Specifies the URL for the backend gRPC-web proxy.
    *   If left empty, the frontend will attempt to access the API at the same origin (e.g., `http://example.com/ada.ADA/*`). This requires appropriate reverse proxy configuration (like nginx) to route `/ada.ADA/*` requests to the backend gRPC-web service.
    *   If set (e.g., `http://backend-api.example.com`), the frontend will send API requests directly to that URL.

## Development

To start the development server with hot-reloading:

```bash
npm run dev
# or
yarn dev
```

The application will typically be available at `http://localhost:5173` (or the port specified by Vite).

## Build

To create a production-ready build:

```bash
npm run build
# or
yarn build
```

The compiled assets will be placed in the `dist/` directory. This directory can then be served by a web server.

## Protobuf Updates

If the backend `.proto` files are updated, regenerate the TypeScript client code:

```bash
npm run build-protos
```

This command uses `protoc` to generate the necessary files based on the definitions in the `proto/` directory.

## Internationalization (i18n)

*   Language files are located in `src/i18n/lang/`.
*   The default language and current language settings are managed in `src/stores/themeConfig.ts` via the `globalI18n` property. Modify this file to change the default application language.

## TODO
