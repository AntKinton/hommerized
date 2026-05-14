# Module Extras

Hommerized introduces several enhanced modules and configuration options not found in the original Homer project. These are configured in the `assets/config/module-extras.yml` file.

> [!NOTE]
> On Docker installations, a sample configuration (`module-extras.yml.sample`) is automatically installed as `module-extras.yml` if no configuration is found.

## Configuration Structure

The `module-extras.yml` file allows you to enable and configure specific fork-exclusive features.

```yaml
# Enhanced Modules Configuration
# This file contains configuration for enhanced features added in Hommerized fork

# Enable groups policy for access control
groupsPolicy:
  enabled: false
  policyFile: "/assets/config/policy-rules.yml"
  fallback: "allow" # Options: "allow", "deny"

# More header configuration
header-additions:
  showUserName: true
  showUserGroups: true

# More navbar configuration
navbar-additions:
  showLogoutButton: true
  logoutEndpoint: "https://auth.your-domain.com/logout"
```

## Available Modules

### Groups Policy

Enables group-based access control for your services. This allows you to hide or show specific services based on the user's groups (usually provided by an authentication proxy like Authelia or Authentik).

- **enabled**: Set to `true` to activate the policy engine.
- **policyFile**: Path to the YAML file containing your policy rules.
- **fallback**: Strategy to use when no specific policy is found for a service.
    - `allow`: Show the service by default (Recommended for ease of use).
    - `deny`: Hide the service by default (Strict mode).

See **[Groups Policy Documentation](module-policy.md)** for details on how to write rules.

### Header Additions

Extends the header with user-specific information.

- **showUserName**: Displays the authenticated user's name in the header.
- **showUserGroups**: Displays the user's groups below their name.

### Navbar Additions

Adds utility buttons to the navigation bar.

- **showLogoutButton**: Displays a logout button in the navbar.
- **logoutEndpoint**: The URL the user is redirected to when clicking the logout button.

## Advanced Usage

Additional enhanced modules and specific feature flags will be added here as the fork evolves. Hommerized aims to maintain compatibility with original Homer config while providing these "opt-in" extras.

---
*Hommerized by AntKinton*
