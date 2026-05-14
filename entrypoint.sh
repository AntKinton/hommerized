#!/bin/sh

# Check if INIT_ASSETS is enabled
if [[ "${INIT_ASSETS}" == "1" ]]; then
    echo "Initializing assets..."
    
    if [[ -w "/www/assets/" ]]; then
        # 1. Copy all static assets (icons, etc) if missing
        # Use -n (no clobber) to avoid overwriting existing files
        cp -Rn /www/default-assets/* /www/assets/
        
        # 2. Ensure config directory exists
        mkdir -p /www/assets/config
        
        # 3. Initialize missing configuration files from templates
        # Primary config
        if [[ ! -f "/www/assets/config/config.yml" ]]; then
            echo "Installing default config.yml"
            cp -n /www/default-assets/config/config.yml.dist /www/assets/config/config.yml
        fi
        
        # Module extras
        if [[ ! -f "/www/assets/config/module-extras.yml" ]]; then
            echo "Installing default module-extras.yml"
            cp -n /www/default-assets/config/module-extras.yml.sample /www/assets/config/module-extras.yml
        fi
        
        # Policy rules
        if [[ ! -f "/www/assets/config/policy-rules.yml" ]]; then
            echo "Installing default policy-rules.yml"
            cp -n /www/default-assets/config/policy-rules.yml.sample /www/assets/config/policy-rules.yml
        fi
    else
        echo "Assets directory not writable, skipping default config install."
        echo "Check assets directory permissions & docker user or skip default assets install by setting the INIT_ASSETS env var to 0."
    fi
fi

echo "Starting webserver"
exec 3>&1
exec lighttpd -D -f /lighttpd.conf