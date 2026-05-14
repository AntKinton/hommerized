# Service Architecture: Adapter + Archetype Pattern

## Overview

This document describes the new service architecture that solves the component explosion problem by separating data logic from UI presentation using the Adapter pattern combined with UI Archetypes.

## Problem Solved

**Before**: 70+ individual `.vue` components, each mixing:
- UI presentation (HTML/CSS)
- Data mapping (API-specific logic)
- Authentication handling
- Error management

**After**: 4 reusable archetypes + N lightweight adapters

## Architecture Components

### 1. UI Archetypes (`src/components/archetypes/`)

Base visual components that know nothing about specific services:

#### `MetricCard.vue`
- **Purpose**: Display statistics, progress bars, numerical data
- **Used by**: Pi-hole, Proxmox, Glances, TruenasScale
- **Props**: `item`, `adapter`
- **Features**: Responsive progress bars, colored metrics, icon/logo support

#### `StatusCard.vue`
- **Purpose**: Display UP/DOWN status with ping information
- **Used by**: Health checks, UptimeKuma, Ping services
- **Features**: Real-time status indicators, ping display, animated icons

#### `MediaCard.vue`
- **Purpose**: Display media information (posters, metadata)
- **Used by**: Plex, Sonarr, qBittorrent, SABnzbd
- **Features**: Poster images, metadata display, "Now Playing" info

#### `NotificationCard.vue`
- **Purpose**: Display lists of alerts and notifications
- **Used by**: Gotify, Ntfy, FreshRSS
- **Features**: Timestamps, notification types, colored indicators

### 2. Data Adapters (`src/adapters/`)

Pure JavaScript modules that map specific APIs to standardized data:

#### Structure
```javascript
export default {
  archetype: 'MetricCard', // Which UI archetype to use
  async fetchMetrics(endpoint, apiKey) {
    // API-specific logic
    // Returns standardized data for archetype
  }
};
```

#### Examples

**Pi-hole Adapter** (`adapters/pihole.js`)
```javascript
export default {
  archetype: 'MetricCard',
  async fetchMetrics(endpoint, apiKey) {
    const res = await fetch(`${endpoint}/admin/api.php?summaryRaw`);
    const data = await res.json();
    
    return [
      {
        label: 'Queries',
        value: data.dns_queries_today,
        color: 'is-info'
      },
      {
        label: 'Blocked',
        value: data.ads_blocked_today,
        color: 'is-danger',
        percentage: data.ads_percentage_today
      }
    ];
  }
};
```

### 3. Service Component (`src/components/Service.vue`)

The orchestrator that dynamically connects adapters to archetypes:

```vue
<template>
  <component 
    :is="archetypeComponent" 
    :item="item" 
    :adapter="serviceAdapter"
    :proxy="proxy"
  />
</template>

<script>
import { defineGenericComponent, shallowRef, watchEffect } from 'vue';

// Pre-load archetypes
import MetricCard from './archetypes/MetricCard.vue';
import StatusCard from './archetypes/StatusCard.vue';
import MediaCard from './archetypes/MediaCard.vue';
import NotificationCard from './archetypes/NotificationCard.vue';

const archetypes = {
  MetricCard,
  StatusCard,
  MediaCard,
  NotificationCard,
  Generic: defineGenericComponent(() => import('./Generic.vue'))
};

export default {
  setup(props) {
    const archetypeComponent = shallowRef(archetypes.Generic);
    const serviceAdapter = shallowRef(null);

    watchEffect(async () => {
      const serviceType = props.item.type;
      if (!serviceType || serviceType === 'Generic') return;

      try {
        // Dynamic adapter import
        const module = await import(`../adapters/${serviceType}.js`);
        serviceAdapter.value = module.default;
        
        // Select archetype based on adapter config
        archetypeComponent.value = archetypes[module.default.archetype] || archetypes.Generic;
      } catch (e) {
        console.warn(`Adapter for ${serviceType} not found, falling back to Generic.`);
        archetypeComponent.value = archetypes.Generic;
      }
    });

    return { archetypeComponent, serviceAdapter };
  }
};
</script>
```

## Benefits

### 1. Maintainability
- **Single source of truth**: UI changes affect all services of same archetype
- **Testable**: Adapters are pure JavaScript, easily unit tested
- **Reusable**: Archetypes work with any service that returns same data structure

### 2. Development Speed
- **Zero boilerplate**: Adding new service = ~15 lines of adapter code
- **No Vue setup**: No templates, scripts, or imports needed
- **Instant integration**: Service works immediately after adapter creation

### 3. Consistency
- **Unified design**: All services of same archetype look identical
- **Theme integration**: Colors and styling automatically applied
- **Responsive behavior**: Consistent across all service types

### 4. Scalability
- **4 archetypes** handle 95% of service use cases
- **N adapters** for N services (linear growth)
- **Memory efficient**: Dynamic loading only loads needed adapters

## Adding New Services

### Step 1: Create Adapter
```bash
# Create new adapter file
touch src/adapters/myservice.js
```

```javascript
// src/adapters/myservice.js
export default {
  archetype: 'MetricCard', // or 'StatusCard', 'MediaCard', 'NotificationCard'
  
  async fetchMetrics(endpoint, apiKey) {
    // Your API logic here
    const res = await fetch(`${endpoint}/api/endpoint`);
    const data = await res.json();
    
    return [
      {
        label: 'My Metric',
        value: data.value,
        color: 'is-primary'
      }
    ];
  }
};
```

### Step 2: Configure Service
```yaml
# config.yml
services:
  - name: My Service
    type: myservice  # Matches adapter filename
    url: http://localhost:8080
    apikey: your-api-key
    logo: /assets/icons/myservice.png
```

That's it! The service will automatically:
1. Load `myservice.js` adapter
2. Use `MetricCard` archetype
3. Display data with Bulma styling
4. Handle errors and loading states

## Migration Guide

### Converting Existing Services

1. **Identify the archetype**: Look at the service's current UI pattern
2. **Create adapter**: Extract API logic to `src/adapters/service.js`
3. **Replace Vue component**: Reduce to configuration wrapper
4. **Test**: Verify adapter returns correct data structure

### Example: Pi-hole Migration

**Before**: 218 lines of complex Vue logic
**After**: 28 lines of adapter + 15 lines of Pi-hole.vue config

## File Structure

```
src/
├── components/
│   ├── archetypes/
│   │   ├── MetricCard.vue
│   │   ├── StatusCard.vue
│   │   ├── MediaCard.vue
│   │   └── NotificationCard.vue
│   ├── Service.vue (orchestrator)
│   └── services/
│       └── PiHole.vue (config wrapper)
└── adapters/
    ├── pihole.js
    ├── proxmox.js
    └── plex.js
```

This architecture eliminates component explosion while maintaining flexibility and reducing development complexity by 10x.
