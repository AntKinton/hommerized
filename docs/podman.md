# Podman Deployment

Hommerized is fully compatible with Podman, offering a secure, daemonless, and rootless container experience.

## Quick Start with Podman

To run Hommerized using the standard Podman CLI:

```bash
podman run -d \
  --name hommerized \
  -p 8080:8080 \
  -v ~/.local/share/hommerized/config:/www/assets/config:Z \
  ghcr.io/antkinton/hommerized:latest
```

> [!NOTE]
> The `:Z` flag is essential on SELinux-enabled systems (like Fedora, CentOS, or RHEL) to ensure the container has permission to read the mounted volumes.

## Advanced Deployment: Quadlets

For production environments on Linux, we recommend using **Quadlets**. Quadlets allow you to manage Podman containers as native systemd services, providing:

- Automatic startup on boot.
- Clean lifecycle management via `systemctl`.
- Better integration with host logging (`journalctl`).

> [!TIP]
> Check out the **[Quadlets & Podman Guide](quadlets-podman.md)** for a deep dive into systemd integration and advanced configuration.

## Rootless Considerations

Hommerized is designed to run in rootless mode. This means:
- No `sudo` required for container operations.
- Enhanced security by isolating the container from the host root user.
- User-specific volume mounts and networking.

---
*Hommerized by AntKinton*
