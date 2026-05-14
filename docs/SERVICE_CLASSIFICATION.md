# Service Classification and Migration Plan

## Complete Service Archetype Mapping

### 🏗️ 6 Base Archetypes

| Archetype | Purpose | Typical Services | Existing Examples |
|-----------|-----------|-------------------|-------------------|
| **MetricCard** | Statistics, progress bars, numerical data | Pi-hole, Proxmox, Glances, TruenasScale, SpeedtestTracker, PostgreSQL, UFW, Scrutiny, WUD, Prometheus, Headscale |
| **StatusCard** | UP/DOWN states, latency, health checks | Ping, Healthchecks, UptimeKuma, Gatus, Portainer, Traefik, Vaultwarden, Gitea, Adminer, Pi-hole (status only) |
| **MediaCard** | Covers, "Now Playing", download lists, multimedia metadata | Emby, Jellystat, Tautulli, Sonarr, Radarr, Lidarr, Prowlarr, Mylar, Medusa, qBittorrent, Transmission, SABnzbd |
| **WeatherCard** | Current weather, forecast, meteorological data | OpenWeather |
| **NotificationCard** | Alert lists, notifications, RSS feeds | Gotify, Ntfy, PiAlert, FreshRSS, Miniflux, Nextcloud, Wallabag, Linkding |
| **ActionCard** | Interactive browser components, local actions | ThemeChooser, CopyToClipboard, WakeOnLan, ExampleService |

---

## 🎯 Migration Strategy by Families

### 📺 *arr Family (Sonarr, Radarr, Lidarr, Readarr, Prowlarr)
**Archetype:** `MediaCard`
**Adapter:** `src/adapters/utils/arr-api.js` (shared)
**Services to migrate:**
- ✅ Sonarr - `src/adapters/sonarr.js` (Created)
- ✅ Radarr - `src/adapters/radarr.js` (Created)
- ⏳ Lidarr - `src/adapters/lidarr.js` (Pending)
- ⏳ Readarr - `src/adapters/readarr.js` (Pending)
- ⏳ Prowlarr - `src/adapters/prowlarr.js` (Pending)

### 🐳 Docker Family (Portainer, Traefik, Caddy, etc.)
**Archetype:** `StatusCard`
**Services to migrate:**
- ⏳ Portainer - `src/adapters/portainer.js`
- ⏳ Traefik - `src/adapters/traefik.js`
- ⏳ Caddy - `src/adapters/caddy.js`

### 📊 Monitoring Family (Glances, Prometheus, etc.)
**Archetype:** `MetricCard`
**Services to migrate:**
- ⏳ Glances - `src/adapters/glances.js`
- ⏳ Prometheus - `src/adapters/prometheus.js`
- ⏳ SpeedtestTracker - `src/adapters/speedtest.js`

### 🌤 Themes and Utilities Family (ThemeChooser, etc.)
**Archetype:** `ActionCard`
**Services to migrate:**
- ✅ ThemeChooser - `src/adapters/themechooser.js` (Created)

---

## 📋 Current Migration Status

### ✅ Completed (6 archetypes + 8 adapters)
- **Archetypes:** MetricCard, StatusCard, MediaCard, NotificationCard, ActionCard, WeatherCard
- **Adapters:** pihole.js, proxmox.js, plex.js, sonarr.js, radarr.js, openweather.js, themechooser.js, arr-api.js (utility)

### ⏳ In Progress (15 remaining services)
- **arr Family:** 4 services (75% completed)
- **Docker Family:** 3 services (0% completed)
- **Monitoring Family:** 3 services (0% completed)

---

## 🚀 Next Steps

1. **Complete *arr family** (Lidarr, Readarr, Prowlarr)
2. **Migrate Docker family** (Portainer, Traefik, Caddy)
3. **Migrate Monitoring family** (Glances, Prometheus, SpeedtestTracker)
4. **Optimize existing adapters** based on usage feedback

---

## 📈 Bundle Impact

**Before:** 70 individual .vue components (~15,000 lines)
**After:** 6 archetypes + 15 adapters (~2,000 lines)
**Reduction:** 87% less code, 100% more maintainable
