# Authelia Installation and Configuration

This guide covers how to set up Authelia for authentication with Hommerized.

## Overview

Authelia is an open-source authentication and authorization server providing 2-factor authentication as a service. It acts as a companion for reverse proxies like Nginx, Traefik, or Caddy to enable authentication for your services.

## Prerequisites

- Docker or Podman installed
- A reverse proxy (Nginx, Traefik, or Caddy)
- Domain name configured to point to your server
- SSL certificates (recommended for production)

## Installation

### Using Docker Compose

Create a `docker-compose.yml` file for Authelia:

```yaml
version: '3.8'

services:
  authelia:
    image: authelia/authelia:latest
    container_name: authelia
    volumes:
      - ./config:/config
    ports:
      - "9091:9091"
    environment:
      - TZ=Europe/Madrid
    restart: unless-stopped
    healthcheck:
      disable: true

  redis:
    image: redis:alpine
    container_name: authelia-redis
    volumes:
      - ./redis:/data
    restart: unless-stopped
    healthcheck:
      disable: true
```

### Using Podman Quadlet

Create a quadlet file (`~/.config/containers/systemd/authelia.container`):

```ini
[Unit]
Description=Authelia Authentication Service
After=network-online.target

[Container]
Image=docker.io/authelia/authelia:latest
Name=authelia
Volume=%h/.config/authelia/config:/config:Z
PublishPort=9091:9091
Environment=TZ=Europe/Madrid

[Service]
Restart=always

[Install]
WantedBy=default.target
```

Create Redis quadlet (`~/.config/containers/systemd/authelia-redis.container`):

```ini
[Unit]
Description=Authelia Redis Cache
After=network-online.target

[Container]
Image=docker.io/redis:alpine
Name=authelia-redis
Volume=%h/.config/authelia/redis:/data:Z

[Service]
Restart=always

[Install]
WantedBy=default.target
```

## Configuration

### Basic Configuration

Create `config/configuration.yml`:

```yaml
theme: dark

server:
  address: 'tcp://0.0.0.0:9091'

log:
  level: info

totp:
  issuer: yourdomain.com

authentication_backend:
  file:
    path: /config/users_database.yml

access_control:
  default_policy: deny
  rules:
    # Main dashboard - accessible for admins and users
    - domain: hommerized.yourdomain.com
      subject:
        - "group:admins"
        - "group:users"
      policy: one_factor

    # Administration tools - only for admins
    - domain: portainer.yourdomain.com
      subject:
        - "group:admins"
        - "group:devops"
      policy: one_factor

    # Database - development team and admins
    - domain: adminer.yourdomain.com
      subject:
        - "group:admins"
        - "group:developers"
        - "group:database-team"
      policy: one_factor

    # Email - only for mail team
    - domain: mail.yourdomain.com
      subject:
        - "group:admins"
        - "group:mail-team"
        - "group:support"
      policy: one_factor

    # Monitoring - operations team
    - domain: grafana.yourdomain.com
      subject:
        - "group:admins"
        - "group:devops"
        - "group:monitoring-team"
      policy: one_factor

    # CI/CD - development team
    - domain: gitlab.yourdomain.com
      subject:
        - "group:admins"
        - "group:developers"
        - "group:devops"
      policy: one_factor

    # VPN - remote access for specific groups
    - domain: vpn.yourdomain.com
      subject:
        - "group:admins"
        - "group:remote-workers"
        - "group:contractors"
      policy: two_factor

    # Wildcard rule for admins - access to any subdomain
    - domain: "*.yourdomain.com"
      subject:
        - "group:admins"
      policy: one_factor

session:
  name: authelia_session
  secret: your-super-secret-key-here-change-this
  expiration: 1h
  inactivity: 5m
  remember_me: 1M
  cookies:
    - domain: yourdomain.com
      authelia_url: https://auth.yourdomain.com

regulation:
  max_retries: 3
  find_time: 2m
  ban_time: 10m

storage:
  local:
    path: /config/db.sqlite3

notifier:
  filesystem:
    filename: /config/notification.txt

identity_validation:
  reset_password:
    jwt_secret: your-jwt-secret-here-change-this
```

**For production with PostgreSQL database:**

```yaml
storage:
  encryption_key: your-encryption-key-here
  postgres:
    address: tcp://127.0.0.1:5432
    database: authelia
    username: authelia_user
    password: your-secure-password
```

### User Database

Create `config/users_database.yml`:

```yaml
users:
  # Administrator with access to all services
  admin:
    displayname: Administrator
    password: $argon2id$v=19$m=65536,t=3,p=4$your-hash-here
    email: admin@yourdomain.com
    groups:
      - admins
    disabled: false
  
  # DevOps engineer - access to admin tools and monitoring
  devops:
    displayname: DevOps Engineer
    password: $argon2id$v=19$m=65536,t=3,p=4$another-hash-here
    email: devops@yourdomain.com
    groups:
      - devops
      - monitoring-team
    disabled: false
  
  # Developer - access to development tools and database
  developer:
    displayname: Developer
    password: $argon2id$v=19$m=65536,t=3,p=4$dev-hash-here
    email: developer@yourdomain.com
    groups:
      - developers
      - database-team
    disabled: false
  
  # Database admin - specialized database access
  dbadmin:
    displayname: Database Administrator
    password: $argon2id$v=19$m=65536,t=3,p=4$db-hash-here
    email: dbadmin@yourdomain.com
    groups:
      - database-team
    disabled: false
  
  # Mail team member - email services access
  mailuser:
    displayname: Mail Team Member
    password: $argon2id$v=19$m=65536,t=3,p=4$mail-hash-here
    email: mailuser@yourdomain.com
    groups:
      - mail-team
      - support
    disabled: false
  
  # Regular user - basic dashboard access
  user1:
    displayname: Regular User
    password: $argon2id$v=19$m=65536,t=3,p=4$user-hash-here
    email: user1@yourdomain.com
    groups:
      - users
    disabled: false
  
  # Remote worker with VPN access
  remote:
    displayname: Remote Worker
    password: $argon2id$v=19$m=65536,t=3,p=4$remote-hash-here
    email: remote@yourdomain.com
    groups:
      - users
      - remote-workers
    disabled: false
  
  # Contractor with limited access
  contractor:
    displayname: Contractor
    password: $argon2id$v=19$m=65536,t=3,p=4$contractor-hash-here
    email: contractor@yourdomain.com
    groups:
      - contractors
    disabled: false
```

### Generate Password Hashes

Use Authelia CLI to generate password hashes:

**Using Docker:**
```bash
docker run --rm authelia/authelia:latest authelia crypto hash generate argon2 --password 'your-secure-password'
```

**Using Podman:**
```bash
podman run --rm docker.io/authelia/authelia:latest authelia crypto hash generate argon2 --password 'your-secure-password'
```

**Using Podman Quadlet (if already installed):**
```bash
podman exec authelia authelia crypto hash generate argon2 --password 'your-secure-password'
```

## Reverse Proxy Configuration

Choose your reverse proxy below:

- [Nginx Configuration](#nginx-configuration)
- [Traefik Configuration](#traefik-configuration)
- [Caddy Configuration](#caddy-configuration) - See [CADDY_PROD_CONFIG.md](CADDY_PROD_CONFIG.md) for detailed production setup

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name hommerized.yourdomain.com;

    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

    # Forward to Authelia for authentication
    location / {
        set $upstream_authelia http://authelia:9091;
        
        # Authelia endpoints
        location /api/verify {
            proxy_pass http://authelia:9091/api/verify;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Authelia portal
        location ~ ^/(authelia|api|firstfactor|secondfactor|logout|verification) {
            proxy_pass http://authelia:9091;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Protected application
        location / {
            auth_request /api/verify;
            auth_request_set $target_url $upstream_http_x_target_url;
            error_page 401 =302 $target_url;

            proxy_pass http://hommerized:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Uri $request_uri;
        }
    }
}
```

### Traefik Configuration

Add labels to your Hommerized container:

```yaml
labels:
  - traefik.enable=true
  - traefik.http.routers.hommerized.rule=Host(`hommerized.yourdomain.com`)
  - traefik.http.routers.hommerized.entrypoints=websecure
  - traefik.http.routers.hommerized.tls=true
  
  # Authelia middleware
  - traefik.http.routers.hommerized.middlewares=authelia
  - traefik.http.middlewares.authelia.forwardauth.address=http://authelia:9091/api/verify
  - traefik.http.middlewares.authelia.forwardauth.trustForwardHeader=true
  - traefik.http.middlewares.authelia.forwardauth.authResponseHeaders=Remote-User,Remote-Groups,Remote-Name,Remote-Email
```

### Caddy Configuration

For detailed Caddy setup in production, see [CADDY_PROD_CONFIG.md](CADDY_PROD_CONFIG.md).

Basic Caddyfile configuration:

```caddy
hommerized.yourdomain.com {
    tls /path/to/cert.pem /path/to/key.pem
    
    # Authelia forward authentication
    forward_auth authelia:9091 {
        uri /api/verify
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    
    # Proxy to Hommerized
    reverse_proxy hommerized:8080 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}

auth.yourdomain.com {
    tls /path/to/cert.pem /path/to/key.pem
    reverse_proxy authelia:9091
}
```

## Hommerized Configuration

Update your `assets/config.yml` to enable authentication:

```yaml
# Authentication settings
auth:
  enabled: true
  provider: authelia
  authelia_url: https://auth.yourdomain.com
  
# Group-based service filtering
services:
  - name: "Admin Tools"
    icon: "fas fa-tools"
    groups: ["admins"]
    items:
      - name: "Portainer"
        icon: "fab fa-docker"
        url: "https://portainer.yourdomain.com"
        
  - name: "User Services"
    icon: "fas fa-th"
    groups: ["users", "admins"]
    items:
      - name: "Nextcloud"
        icon: "fab fa-nextcloud"
        url: "https://nextcloud.yourdomain.com"
```

## Security Considerations

1. **Change Default Secrets**: Always change the default session secret and password hashes
2. **Use HTTPS**: Always use SSL/TLS in production
3. **Strong Passwords**: Enforce strong password policies
4. **Regular Updates**: Keep Authelia updated to the latest version
5. **Backup Configuration**: Regularly backup your configuration files

## Troubleshooting

### Common Issues

1. **Authentication Loop**: Check that your reverse proxy is properly configured
2. **Session Issues**: Verify the session secret and domain configuration
3. **Database Errors**: Ensure proper permissions for the SQLite database file
4. **Network Issues**: Check that containers can communicate with each other

### Logs

Check Authelia logs for debugging:

**Using Docker:**
```bash
docker logs authelia
```

**Using Podman:**
```bash
podman logs authelia
```

**Using Podman Quadlet:**
```bash
journalctl --user -u authelia.service
```

### Testing

Test your configuration with Authelia's built-in validator:

**Using Docker:**
```bash
docker run --rm -v $(pwd)/config:/config authelia/authelia:latest authelia validate-config /config/configuration.yml
```

**Using Podman:**
```bash
podman run --rm -v $(pwd)/config:/config docker.io/authelia/authelia:latest authelia validate-config /config/configuration.yml
```

**Using Podman Quadlet (if container is running):**
```bash
podman exec authelia authelia validate-config /config/configuration.yml
```

## Additional Resources

- [Official Authelia Documentation](https://www.authelia.com/)
- [Authelia Configuration Reference](https://www.authelia.com/configuration/)
- [Community Examples](https://github.com/authelia/authelia/tree/master/examples)

## Migration from Basic Auth

If you're migrating from basic HTTP authentication:

1. Install and configure Authelia
2. Update your reverse proxy configuration
3. Import existing users into Authelia's user database
4. Test thoroughly before switching
5. Remove basic auth configuration once confirmed working

## Performance Optimization

For better performance:

1. Use Redis for session storage (recommended for production)
2. Enable caching in your reverse proxy
3. Use appropriate resource limits
4. Monitor resource usage
5. Consider load balancing for high-traffic deployments
