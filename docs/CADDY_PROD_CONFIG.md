# Caddy Configuration for Production with Authelia Headers

## Complete Configuration

```caddy
{
    email your-email@example.com
    
    # Global settings
    auto_https from {
        ports http 80
    }
    
    # Hommerized dashboard with Authelia integration
    your-hommerized-domain.com {
        tls internal
        
        # Authelia Forward Auth
        forward_auth auth.your-auth-domain.com:9091 {
            uri /api/authz/forward-auth
            copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
        }

        # Apply templates to proxy response
        templates {
            match {
                path / /index.html
            }
        }

        # Proxy to Hommerized instance
        # Note: 5173 is development port. 
        # Standard production ports: 80 (HTTP) or 443 (HTTPS) behind reverse proxy
        # 8080 is a common non-privileged port for internal services, you can try 3000 as an alternative
        # Change to your actual production port
        reverse_proxy localhost:8080 {
            header_up Host {host}
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-For {remote_host}
            header_up X-Forwarded-Proto {scheme}
        }
    }
}
```

## Alternative: Using Static Files

For production, you can also build static files and serve them:

```caddy
homer.asgard.vpn {
    tls internal
    
    forward_auth localhost:9091 {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    
    # Serve static files with template
    handle_path /templates/* {
        root /var/www/homer/templates
    }
    
    # Main handler with template
    handle {
        template {
            file homer_template.html
        }
        
        # Pass headers to template
        header Remote-User {http.auth.user}
        header Remote-Groups {http.auth.groups}
        header Remote-Name {http.auth.name}
        header Remote-Email {http.auth.email}
    }
}
```

## Template File Location

Place `homer_template.html` in:
- `/var/www/homer/templates/` (if using static files)
- Or in the same directory as your Caddyfile

## Testing

```bash
# Test the configuration
caddy validate --config /path/to/Caddyfile

# Reload Caddy
sudo systemctl reload caddy

# Check logs
journalctl -u caddy -f
```

## Logout Functionality

The Homer dashboard includes a configurable logout button that:

1. **Clears authentication data** from localStorage
2. **Redirects to Authelia logout** with return URL parameter
3. **Returns user to Homer** after re-authentication

### Logout Flow

```javascript
// Logout button redirects to:
https://auth.your-auth-domain.com/logout?rd=https://your-homer-domain.com

// After Authelia login, user returns to:
https://your-homer-domain.com
```

### Configuration

In `config.yml`:

```yaml
groupPolicies:
  showLogoutItem: true
  logoutEndpoint: "https://auth.your-auth-domain.com/logout"
```

## Port Management & Deployment

### **Port Hierarchy**

1. **External Access (Caddy)**: Port 80 (HTTP) or 443 (HTTPS)
2. **Reverse Proxy (Internal)**: Port 8080 (standard non-privileged)
3. **Application (Homer)**: Port 5173 (development), varies in production

### **Port Checking**

Before deploying services, check if port is available:

```bash
# Check if port 8080 is free
sudo ss -tlnp | grep 8080

# Alternative: Check all listening ports
sudo netstat -tlnp
```

### **Deployment Process**

1. **Reserve port 8080** for reverse proxy
2. **Configure application** on its assigned port
3. **Update Caddy config** to point to correct internal port
4. **Test reverse proxy** connectivity

### **Common Issues**

- **Port conflicts**: Use `ss -tlnp` to identify occupied ports
- **Permission denied**: Use `sudo` for privileged ports (< 1024)
- **Firewall blocks**: Ensure port 8080 is allowed in firewall

## Benefits

✅ No Vite plugin needed  
✅ Direct header injection  
✅ Production ready  
✅ Simple configuration  
✅ Easy to debug
✅ Integrated logout functionality
✅ Automatic return to dashboard
✅ Clear port management guidance
