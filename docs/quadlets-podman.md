# Quadlets & Podman Installation

This guide covers the recommended deployment method for Hommerized using rootless Podman with quadlet integration. Quadlet provides systemd integration for Podman containers, offering better lifecycle management and automatic startup.

## What are Quadlets?

Quadlet is a systemd generator that converts Podman container definitions into native systemd services. This approach provides:

- **Automatic startup** with systemd
- **Native service management** (start, stop, restart, status)
- **Dependency management** between services
- **Logging integration** with journalctl
- **Rootless operation** by default
- **Resource limits** and security policies

## Prerequisites

### Install Podman

**Fedora/CentOS/RHEL:**
```sh
sudo dnf install podman
```

**Ubuntu/Debian:**
```sh
sudo apt update
sudo apt install podman
```

**Arch Linux:**
```sh
sudo pacman -S podman
```

### Enable User Service

For rootless containers to work with systemd, enable lingering for your user:

```sh
sudo loginctl enable-linger $USER
```

This allows user services to run even when you're not logged in.

## Basic Quadlet Setup

### 1. Create Configuration Directory

```sh
mkdir -p ~/.config/containers/systemd
```

### 2. Create Hommerized Quadlet

Create `~/.config/containers/systemd/hommerized.container`:

```ini
[Unit]
Description=Hommerized Dashboard
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/antkinton/hommerized:latest
Name=hommerized
PodmanArgs=--user=1000:1000
Environment=INIT_ASSETS=1
PublishPort=8080:8080
Volume=%h/.local/share/hommerized/config:/www/assets/config:Z

[Service]
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
```

### 3. Create Configuration Directory

```sh
mkdir -p ~/.local/share/hommerized/config
```

### 4. Enable and Start Service

```sh
# Reload systemd to detect new quadlet
systemctl --user daemon-reload

# Enable automatic startup
systemctl --user enable hommerized

# Start the service
systemctl --user start hommerized

# Check status
systemctl --user status hommerized
```

## Advanced Quadlet Configuration

### Resource Limits

Add resource constraints to control memory and CPU usage:

```ini
[Container]
Image=ghcr.io/antkinton/hommerized:latest
Name=hommerized
# Memory limit (512MB)
Memory=512M
# CPU limit (0.5 cores)
CPUQuota=0.5
# Other existing configuration...
```

### Health Checks

Add health monitoring:

```ini
[Container]
Image=ghcr.io/antkinton/hommerized:latest
Name=hommerized
HealthCmd=curl -f http://localhost:8080/ || exit 1
HealthInterval=30s
HealthTimeout=10s
HealthRetries=3
# Other existing configuration...
```

### Network Configuration

#### Custom Network

Create a dedicated network:

```sh
podman network create hommerized-net
```

Reference it in the quadlet:

```ini
[Container]
Image=ghcr.io/antkinton/hommerized:latest
Name=hommerized
Network=hommerized-net
# Other existing configuration...
```

#### Host Network

For direct host access:

```ini
[Container]
Image=ghcr.io/antkinton/hommerized:latest
Name=hommerized
HostNetwork=true
# Other existing configuration...
```

### Environment Variables

Configure additional environment variables:

```ini
[Container]
Image=ghcr.io/antkinton/hommerized:latest
Name=hommerized
Environment=INIT_ASSETS=1
Environment=SUBFOLDER=/dashboard
Environment=PORT=8080
Environment=IPV6_DISABLE=1
# Other existing configuration...
```

## Volume Management

### Persistent Configuration

Use bind mounts for configuration persistence:

```ini
[Container]
Volume=%h/.local/share/hommerized/config:/www/assets/config:Z
```

### Named Volumes

For data that doesn't need host access:

```ini
[Container]
Volume=hommerized-data:/www/assets/config
```

### SELinux Considerations

Always use `:Z` or `:z` flags for proper SELinux labeling:

- `:Z` - Private label (recommended)
- `:z` - Shared label (use with caution)

## Service Management

### Basic Commands

```sh
# Start service
systemctl --user start hommerized

# Stop service
systemctl --user stop hommerized

# Restart service
systemctl --user restart hommerized

# Check status
systemctl --user status hommerized

# View logs
journalctl --user -u hommerized -f
```

### Enable/Disable

```sh
# Enable automatic startup
systemctl --user enable hommerized

# Disable automatic startup
systemctl --user disable hommerized
```

### Service Dependencies

Create dependencies between services:

```ini
[Unit]
Description=Hommerized Dashboard
After=network-online.target redis.service
Wants=network-online.target redis.service
```

## Troubleshooting

### Common Issues

#### Service Won't Start

```sh
# Check service status
systemctl --user status hommerized

# View detailed logs
journalctl --user -u hommerized --since "1 hour ago"

# Check container logs
podman logs hommerized
```

#### Permission Issues

Ensure proper permissions on configuration directories:

```sh
# Fix ownership
chown -R 1000:1000 ~/.local/share/hommerized

# Fix SELinux context
restorecon -R ~/.local/share/hommerized
```

#### Network Issues

Verify network connectivity:

```sh
# Check if port is listening
ss -tlnp | grep 8080

# Test container connectivity
podman exec -it hommerized curl http://localhost:8080
```

### Debug Mode

Enable debug logging:

```ini
[Service]
Environment=PODMAN_LOG_LEVEL=debug
```

## Migration from Docker

### Docker Compose to Quadlet

Convert this docker-compose.yml:

```yaml
services:
  hommer:
    image: antkinton/hommerized:latest
    container_name: hommerized
    volumes:
      - ./config:/www/assets/config
    ports:
      - "8080:8080"
    environment:
      - INIT_ASSETS=1
    restart: unless-stopped
```

To this quadlet configuration:

```ini
[Unit]
Description=Hommerized Dashboard
After=network-online.target

[Container]
Image=ghcr.io/antkinton/hommerized:latest
Name=hommerized
Volume=%h/.local/share/hommerized/config:/www/assets/config:Z
PublishPort=8080:8080
Environment=INIT_ASSETS=1

[Service]
Restart=always

[Install]
WantedBy=default.target
```

### Configuration Migration

```sh
# Stop Docker container
docker stop hommerized

# Export data
docker export hommerized > hommerized-backup.tar

# Import to Podman
podman import hommerized-backup.tar hommerized-imported

# Update quadlet to use imported image
# Image=hommerized-imported:latest
```

## Best Practices

### Security

1. **Use rootless containers** by default
2. **Apply SELinux labels** with `:Z` flag
3. **Limit resources** to prevent abuse
4. **Use specific image tags** instead of `latest`
5. **Regular updates** of base images

### Performance

1. **Set memory limits** to prevent resource exhaustion
2. **Use health checks** for automatic recovery
3. **Monitor logs** for issues
4. **Optimize volume mounts** for I/O performance

### Backup Strategy

```sh
# Backup configuration
tar -czf hommerized-backup-$(date +%Y%m%d).tar.gz ~/.local/share/hommerized

# Backup quadlet configuration
cp ~/.config/containers/systemd/hommerized.container hommerized.container.backup
```

## Integration with Other Services

### Reverse Proxy with Caddy

Create a Caddy quadlet:

```ini
[Unit]
Description=Caddy Reverse Proxy
After=network-online.target hommerized.service

[Container]
Image=caddy:latest
Name=caddy
PublishPort=80:80
PublishPort=443:443
Volume=%h/.local/share/caddy/Caddyfile:/etc/caddy/Caddyfile:Z
Volume=%h/.local/share/caddy/data:/data:Z

[Service]
Restart=always

[Install]
WantedBy=default.target
```

### Database Integration

Example with PostgreSQL:

```ini
[Unit]
Description=Hommerized Dashboard
After=network-online.target postgres.service

[Container]
Image=ghcr.io/antkinton/hommerized:latest
Name=hommerized
Environment=DATABASE_URL=postgresql://user:pass@postgres:5432/hommerized
Network=postgres-net
```

## Automation Scripts

### Service Update Script

Create `~/bin/update-hommerized.sh`:

```bash
#!/bin/bash

# Pull latest image
podman pull ghcr.io/antkinton/hommerized:latest

# Restart service
systemctl --user restart hommerized

# Check status
systemctl --user status hommerized
```

### Backup Script

Create `~/bin/backup-hommerized.sh`:

```bash
#!/bin/bash

BACKUP_DIR="$HOME/backups/hommerized"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup configuration
tar -czf "$BACKUP_DIR/config-$DATE.tar.gz" "$HOME/.local/share/hommerized/config"

# Backup configuration
cp "$HOME/.config/containers/systemd/hommerized.container" "$BACKUP_DIR/hommerized-$DATE.container"

echo "Backup completed: $BACKUP_DIR"
```

## Further Reading

- [Podman Documentation](https://podman.io/docs/)
- [Quadlet Documentation](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html)
- [Systemd User Services](https://systemd.io/DEVELOPING_FOR_SYSTEMD/#user-services)
- [SELinux Container Labeling](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/using_selinux/working-with-containers-and-selinux_using-selinux)
