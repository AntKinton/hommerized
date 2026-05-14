# Advanced Configuration

Hommerized is designed to scale beyond a simple dashboard, supporting professional-grade infrastructure with reverse proxies and centralized authentication.

## Reverse Proxy & Production Setup

Deploying Hommerized in production typically involves a reverse proxy to handle SSL/TLS termination and header injection.

### Caddy Integration
Caddy is a modern, memory-safe reverse proxy that automates HTTPS. Our recommended production setup includes:
- **Automatic HTTPS** via Let's Encrypt or ZeroSSL.
- **Header Injection** for seamless integration with the PWA engine.
- **Template Processing** for dynamic dashboard responses.

> [!TIP]
> See **[Caddy Production Guide](CADDY_PROD_CONFIG.md)** for complete `Caddyfile` examples and port management best practices.

## Authentication & Access Control

Hommerized supports multi-user environments through header-based authentication. This allows you to protect your dashboard and show different services to different users.

### Authelia Integration
Authelia provides a robust authentication layer with features like:
- **Single Sign-On (SSO)** for all your subdomains.
- **Two-Factor Authentication (2FA)** via TOTP or Duo.
- **Group Management** to categorize your users (e.g., `admins`, `developers`).

> [!IMPORTANT]
> When using Authelia, Hommerized reads the `Remote-User` and `Remote-Groups` headers to personalize the experience and apply **[Group Policies](module-policy.md)**.

> [!TIP]
> See **[Authelia Setup Guide](authelia.md)** for a full walk-through on installing and configuring Authelia with Docker or Podman Quadlet.

## Deployment Workflows

### Docker & Podman
For containerized deployments, we recommend using the official Hommerized image which includes:
- **Rootless Support**: Designed to run safely under unprivileged users.
- **Entrypoint Logic**: Automatic initialization of default configs.
- **Healthchecks**: Built-in monitoring for high availability.

### Custom Builds
If you need to customize the core logic, you can build your own image:
```bash
podman build -t hommerized:custom .
```

---
*Hommerized by AntKinton*
