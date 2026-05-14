# Groups Policy

The Groups Policy system allows for granular access control to dashboard services based on user groups. This is particularly useful when exposing the dashboard through an authentication proxy (like Authelia, Authentik, or Traefik Forward Auth) that provides user group information via headers.

## Configuration

Policies are defined in `assets/config/policy-rules.yml`.

> [!IMPORTANT]
> The policy engine must be enabled in `module-extras.yml` for these rules to take effect.

### Rule Structure

The policy file is divided into two main sections: `groups` (for metadata) and `servicePolicies` (for actual access rules).

```yaml
# Defined user groups (Optional metadata)
groups:
  alpha-team:
    name: "Alpha Team"
    description: "Full access to infrastructure"
  beta-group:
    name: "Beta Group"

# Service access policies
servicePolicies:
  # Rule name (arbitrary)
  Infra-Nodes:
    allowedGroups: ["alpha-team", "gamma-admins"]
    services: ["Nodes", "Proxmox"]
    
  # You can map a whole group from config.yml by its title
  Groupware:
    allowedGroups: ["beta-group"]
    services: ["Nextcloud", "Mail"]
```

## How it works

1. **User Identification**: The dashboard reads the user's groups from the `remote-groups` header or meta tag.
2. **Matching**: When rendering the dashboard, the system checks each service against the `servicePolicies`.
3. **Lookup Order**:
    - It first looks for an explicit match for the **Service Name**.
    - If not found, it checks if the **Group Name** (from `config.yml`) matches a policy.
    - It supports a wildcard `*` policy if defined.
4. **Fallback**: If no rule matches, the `fallback` setting in `module-extras.yml` determines if the service is shown or hidden.

## Wildcards

You can define a catch-all policy using the `*` wildcard in the services list:

```yaml
servicePolicies:
  CatchAll:
    allowedGroups: ["gamma-admins"]
    services: ["*"]
```

## Tips for Implementation

- **Group Titles**: You can map entire sections of your dashboard by using the group name defined in `config.yml` as a key in `servicePolicies`.
- **Case Sensitivity**: Service names and group names are case-sensitive. Ensure they match exactly what is in your `config.yml`.
- **Debugging**: If services disappear, check your browser console for logs starting with `🎯 PolicyStore`.

---
*Hommerized by AntKinton*
