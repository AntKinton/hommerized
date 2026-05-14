# Group Policies System for Hommerized

This Hommerized extension allows filtering services based on authenticated user groups through Authelia and Caddy.

## 🎯 **Features**

- **Authelia Authentication**: Captures HTTP headers with user and group information
- **Dynamic Filtering**: Shows only services that each group can access
- **Flexible Configuration**: Policies defined in YAML
- **Backward Compatibility**: Doesn't affect normal Homer functionality

## 🏗️ **Architecture**

### **Main Components**

1. **AuthService** (`src/utils/authService.js`)
   - Manages authentication and policies
   - Filters services by group

2. **Policy Configuration** (`assets/config/policy-rules.yml`)
   - Defines groups and permissions
   - Maps services to groups

3. **App.vue Integration**
   - Initializes authentication service
   - Applies service filtering

## 🔧 **Configuration**

### **1. Enable Group Policies**

In your `config.yml`:

```yaml
groupPolicies:
  enabled: true
  policyFile: "/assets/config/policy-rules.yml"
  fallback: "allow"  # allow, deny
  showUserInfo: true
  showLogoutItem: true
  logoutEndpoint: "https://auth.your-auth-domain.com/logout"
```

### **2. Configure Caddy**

```caddy
your-homer-domain.com {
    route {
        # Authentication with Authelia
        forward_auth auth.your-auth-domain.com {
            # Headers that Authelia will inject
            header_up Remote-User {http.authelia_user}
            header_up Remote-Groups {http.authelia_groups}
        }
        
        # Serve Homer
        reverse_proxy localhost:8080
    }
}
```

### **3. Define Policies**

In `assets/config/policy-rules.yml`:

```yaml
# User groups
userGroups:
  infrastructure-team:
    name: "Infrastructure Team"
    description: "Access to infrastructure services"
  business-team:
    name: "Business Team"
    description: "Access to collaboration services"

# Access policies
servicePolicies:
  Infrastructure:
    allowedGroups: ["infrastructure-team", "admins"]
    services: ["Nodes", "Headplane"]
    
  Collaboration:
    allowedGroups: ["business-team", "admins"]
    services: ["Roundcube", "Nextcloud"]

# Advanced mapping (optional)
groupTitleMapping:
  "Infrastructure|infrastructure-team": "Infrastructure-Headplane"
  "Infrastructure|business-team": "Infrastructure-Nodes"
```

### **4. Configure Services**

In `config.yml`:

```yaml
services:
  - name: Infrastructure
    icon: fas fa-network-wired
    items:
      - name: Nodes
        logo: assets/icons/nodes.png
        url: https://nodes.your-domain.com
      - name: Headplane
        logo: assets/icons/headplane.png
        url: https://headplane.your-domain.com
```

## 🚀 **Usage**

### **For Development**

#### **Method 1: Meta Tags (for testing)**

Simulate headers using meta tags in `index.html`:

```html
<head>
  <meta name="remote-user" content="testuser">
  <meta name="remote-groups" content="infrastructure-team,business-team">
</head>
```

#### **Method 2: Caddy Template Injection (production)**

In production, Caddy automatically injects headers using template syntax:

```html
<!-- Authentication headers injected by Caddy -->
<script>
  window.__AUTH_HEADERS__ = {
          user: '{{.Req.Header.Get "Remote-User"}}',
          groups: '{{.Req.Header.Get "Remote-Groups"}}',
          name: '{{.Req.Header.Get "Remote-Name"}}',
          email: '{{.Req.Header.Get "Remote-Email"}}'
      };
</script>
```

#### **Development with localStorage**

For testing without reverse proxy, use localStorage:

```javascript
localStorage.setItem('remote-user', 'testuser');
localStorage.setItem('remote-groups', 'infrastructure-team,business-team');
```

### **For Production**

1. **Configure Authelia** with your users and groups
2. **Configure Caddy** to inject headers
3. **Deploy Homer** with `groupPolicies.enabled: true`

#### **Vue Store Integration**

Homer uses a Vue reactive store (`src/stores/auth.js`) for authentication:

```javascript
// Store automatically initializes and captures headers
import { authStore } from './stores/auth.js';

// Reactive data available in components
export default {
  inject: {
    authStore: authStore  // Injected into all components
  }
}
```

#### **Store Features**

- **Automatic Initialization**: Captures headers on app load
- **Reactive Updates**: Components react to auth changes
- **Global Access**: Available throughout the application
- **Service Filtering**: Policies applied automatically
- **Logout Support**: Clear store data on logout

## 📋 **Behavior**

### **With Policies Enabled**

- ✅ Shows only permitted services for user's group
- ✅ Hides empty groups (no visible services)
- ✅ Shows user information in header
- ✅ Shows logout button in navbar
- ✅ Supports multiple groups per user
- ✅ Automatic logout and re-authentication

### **Without Policies or Authentication**

- ✅ Normal Homer behavior (all services visible)
- ✅ Compatible with existing configurations

## 🔍 **Debugging**

### **Console Logs**

The system shows detailed information in console:

```javascript
AuthService initialized - User: testuser, Groups: infrastructure-team,admins
Policy found for service "Nodes": allowedGroups=["infrastructure-team", "admins"]
Access granted: user groups ["infrastructure-team"] intersects with ["infrastructure-team", "admins"]
```

### **Verification**

1. Open developer tools
2. Look for "AuthService" logs
3. Verify groups are detected correctly
4. Confirm policies are applied

## 🎨 **Customization**

### **CSS Styles**

User info styles are in `src/assets/user-info.scss`:

```scss
.user-info {
  margin-top: 0.5rem;
  text-align: center;
  
  .groups {
    &:before {
      content: "•";
      margin: 0 0.5rem;
    }
  }
}
```

### **Template Variables**

You can use variables in the subtitle:

```yaml
subtitle: "{{REMOTE_USER}}"  # Will be replaced with current user
```

## 🔄 **Workflow**

1. **User accesses** Homer via Caddy
2. **Authelia authenticates** and redirects with headers
3. **Caddy injects headers** `Remote-User` and `Remote-Groups`
4. **AuthService captures** user information
5. **Loads policies** from `groups-policy.yml`
6. **Filters services** according to group permissions
7. **Renders dashboard** with permitted services

## � **Logout Functionality**

### **Features**

- **Configurable Logout Button**: Show/hide via `showLogoutItem`
- **Custom Endpoint**: Configure logout URL via `logoutEndpoint`
- **Automatic Cleanup**: Clears authentication data from localStorage
- **Smart Redirect**: Returns user to dashboard after re-authentication
- **Security**: Prevents session hijacking by clearing local data

### **Logout Flow**

1. **User clicks logout** → Clears localStorage data
2. **Redirects to Authelia** → `https://auth.your-auth-domain.com/logout?rd=https://your-homer-domain.com`
3. **Authelia processes logout** → Shows login screen
4. **User authenticates** → Authelia redirects back to Homer
5. **Homer loads** → Fresh authentication headers applied

### **Configuration**

```yaml
groupPolicies:
  showLogoutItem: true
  logoutEndpoint: "https://auth.your-auth-domain.com/logout"
```

### **Implementation**

The logout functionality is implemented in:

- **Component**: `src/components/LogoutItem.vue`
- **Integration**: Integrated in navbar between SettingToggle and SearchInput
- **Storage Cleanup**: Removes `remote-user`, `remote-name`, `remote-groups`
- **Redirect Logic**: Uses `rd` parameter for return URL

## ��️ **Security**

- ✅ Policies are defined server-side
- ✅ No direct access to configuration from client
- ✅ Configurable fallback for unauthenticated users
- ✅ Group validation on each request
- ✅ Secure logout with session cleanup
- ✅ Automatic re-authentication flow

## 📝 **Complete Example**

See example files:
- `public/assets/config/config.yml` - Configuration with policies enabled
- `public/assets/config/policy-rules.yml` - Example group policies

## 🤝 **Contributions**

This extension maintains full compatibility with original Homer. To add new features:

1. Extend `AuthService` for new providers
2. Modify `groups-policy.yml` for new policies
3. Add styles in `user-info.scss`

---

**Note**: This is a non-destructive extension of Homer. Original behavior is maintained when `groupPolicies.enabled: false`.
