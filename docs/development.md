# Development

If you want to contribute to Homer, please read the [contributing guidelines](https://github.com/AntKinton/hommerized/blob/main/CONTRIBUTING.md) first. 

```sh
pnpm install
pnpm dev
```

## Custom services (Adapters)

We are transitioning to a modular **Archetype/Adapter** architecture. Instead of creating new Vue components, you should now create a **Javascript Adapter** that defines the logic and selects a pre-defined **Archetype** (UI layout).

Available Archetypes in `src/components/archetypes/`:
- `MetricCard`: Statistics, progress bars, numerical data.
- `StatusCard`: UP/DOWN states, health checks.
- `MediaCard`: Multimedia metadata, "Now Playing".
- `NotificationCard`: Alert lists, RSS feeds.
- `ActionCard`: Interactive buttons and actions.
- `WeatherCard`: Meteorological data.

### Adapter Skeleton

Create your adapter in `src/adapters/[ServiceName].js`:

```javascript
import { fetchWrapper } from '../utils/fetchWrapper.js';

export default {
  archetype: 'StatusCard', // Choose from list above
  
  async fetchData(item) {
    const data = await fetchWrapper(item.url);
    
    return {
      status: data.online ? 'up' : 'down',
      metrics: [
        { label: 'Version', value: data.version }
      ]
    };
  }
};
```

> [!TIP]
> The `type: Generic` is still maintained for backward compatibility. If you are creating a complex UI that doesn't fit any archetype, you can still create a Vue component in `src/components/service-components/`.

## Themes

Themes are meant to be simple customization (written in [scss](https://sass-lang.com/documentation/syntax)).
To add a new theme, just add a file in the theme directory, and put all style in the `body #app.theme-<name>` scope. Then import it in the main style file.

```scss
// `src/assets/themes/my-awesome-theme.scss`
body #app.theme-my-awesome-theme. { ... }
```

```scss
// `src/assets/app.scss`
// Themes import
@import "./themes/sui.scss";
...
@import "./themes/my-awesome-theme.scss";
```
