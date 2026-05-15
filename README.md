<h1 align="center">
 <img
  width="180"
  alt="A zombified Homer's donut"
  src="https://raw.githubusercontent.com/AntKinton/homerized/dev/public/logo.png">
    <br/>
    Hommerized
</h1>

<h4 align="center">
 A dead simple un-static <strong>HOMM</strong>epage for your serv<strong>ERIZED</strong> to keep your services on hand, from a simple <code>yaml</code> configuration file.
 <br/><br/>
 <strong>🔧 Hommerized Fork</strong> - Optimized for rootless Podman quadlet deployment
</h4>
<p align="center">
  <a href="https://www.buymeacoffee.com/bastien" target="_blank"><img src="https://raw.githubusercontent.com/AntKinton/homerized/dev/images/bmc-button_4him.png" alt="Buy A Coffee for Bastien, Homer's father" height="41" width="174"></a>
<p>
<p align="center">
 <a href="https://opensource.org/licenses/Apache-2.0"><img
  alt="License: Apache 2"
  src="https://img.shields.io/badge/License-Apache%202.0-blue.svg"></a>
 <a href="https://vuejs.org/"><img
  alt="Vue.js"
  src="https://img.shields.io/badge/Vue.js-4FC08D?logo=vue.js&logoColor=white"></a>
 <a href="https://bulma.io/"><img
  alt="Bulma"
  src="https://img.shields.io/badge/Bulma-00D1B2?logo=bulma&logoColor=white"></a>
 <a href="https://nodejs.org/"><img
  alt="Node.js"
  src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white"></a>
 <a href="https://yaml.org/"><img
  alt="YAML"
  src="https://img.shields.io/badge/YAML-CB171E?logo=yaml&logoColor=white"></a>
 <a href="https://pinia.vuejs.org/"><img
  alt="Pinia"
  src="https://img.shields.io/badge/Pinia-yellow?logo=vue.js&logoColor=white"></a>
 <a href="https://vuejs.org/guide/extras/composition-api-faq.html"><img
  alt="Composition API"
  src="https://img.shields.io/badge/Composition_API-42D392?logo=vue.js&logoColor=white"></a>
 <img
  alt="Version"
  src="https://img.shields.io/badge/Version-26.05.5-blue">
</p>

<p align="center">
 <strong>
  <a href="https://homer-demo.netlify.app">Here you can try a Homer Demo as a reference</a>
  •
  <a href="https://github.com/AntKinton/hommerized">My Hommerized Fork repository</a>
  •
  <a href="#get-started">Get started</a>
 </strong>
</p>

## Highlights

- ⚡️ Lightweight & Fast
- 🥱 Low / No maintenance
- 📄 Simple [yaml](http://yaml.org/) file configuration
- ➕ Installable (pwa)
- 🧠 Smart cards
- 🔍️ Fuzzy search
- 📂 Multi pages & item grouping
- 🎨 Theme customization
- ⌨️ keyboard shortcuts:
  - <kbd>/</kbd> Start searching.
  - <kbd>Escape</kbd> Stop searching.
  - <kbd>Enter</kbd> Open the first matching result (respects the bookmark's `_target` property).
  - <kbd>Alt</kbd> (or <kbd>Option</kbd>) + <kbd>Enter</kbd> Open the first matching result in a new tab.

## About this fork

I initially created this fork to add authentication and group filtering features that I needed in my private homelab setup. I'm not sure if I'll continue maintaining it, but I'm happy if it can help the community too.

## New Features

- 🔐 Authentication support (Authelia or similar required)
- 👥 Group-based service filtering
- 🦭 Rootless Podman quadlet optimization
- 🍍 Pinia migration for state management
- 🧩 Mixin migration to composables
- ⚡ Composition API (services) migration
- 🗑️ Remove loash.merge and http-server
- 📦 Migrated dependencies to latest versions
- 🛠️ Added defu and sirv-cli for local development

## Table of Contents

- [Getting started](#get-started)
- [Quadlets & Podman Installation](docs/quadlets-podman.md)
- [Kubernetes Installation](docs/kubernetes.md)
- [Authelia Installation and Configuration](docs/authelia.md)
- [Configuration](docs/configuration.md)
- [Theming](docs/theming.md)
- [Smart cards](docs/customservices.md)
- [Tips & tricks](docs/tips-and-tricks.md)
- [Development](docs/development.md)
- [Troubleshooting](docs/troubleshooting.md)

## Get started

Hommerized is a full non-static html/js dashboard (based on Homer), based on a simple yaml configuration file. See [documentation](docs/configuration.md) for information about the configuration (`assets/config.yml`) options.

It's meant to be served by an HTTP server, **it will not work if you open the index.html directly over file:// protocol**.

### Using Podman Quadlet (Recommended)

This fork is optimized for rootless Podman quadlet deployment. Quadlet provides systemd integration for Podman containers.

**Create a quadlet file** (`~/.config/containers/systemd/hommerized.container`):

```ini
[Unit]
Description=Hommerized Dashboard
After=network-online.target

[Container]
Image=ghcr.io/antkinton/hommerized:latest
Name=hommerized
PodmanArgs=--user=1000:1000
Environment=INIT_ASSETS=1
PublishPort=8080:8080
Volume=%h/.local/share/hommerized/assets:/www/assets:Z

[Service]
Restart=always

[Install]
WantedBy=default.target
```

**Enable and start the service:**

```sh
# Reload systemd daemon
systemctl --user daemon-reload

# Enable and start hommerized service
systemctl --user enable --now hommerized

# Check status
systemctl --user status hommerized
```

**Using podman-compose**

```yaml
services:
  hommerized:
    image: ghcr.io/antkinton/hommerized:latest
    container_name: hommerized
    volumes:
      - ~/.local/share/hommerized/assets:/www/assets:Z # Make sure your local config directory exists
    ports:
      - 8080:8080
    user: 1000:1000 # default
    environment:
      - INIT_ASSETS=1 # default, requires the config directory to be writable for the container user
    restart: unless-stopped
```

**Environment variables:**

- **`INIT_ASSETS`** (default: `1`)
Install example configuration file & assets (favicons, ...) to help you get started.

- **`SUBFOLDER`** (default: `null`)
If you would like to host Homer in a subfolder, (ex: *<http://my-domain/homer>*), set this to the subfolder path (ex `/homer`).

- **`PORT`** (default: `8080`)
If you would like to change internal port of Homer from default `8080` to your port choice.

- **`IPV6_DISABLE`** (default: 0)
Set to `1` to disable listening on IPv6.

> [!NOTE]  
> When using Podman quadlet, the container will run using a user uid and gid 1000 by default. Make sure this matches the permissions of your assets directory. Use `:Z` volume flag for proper SELinux labeling.

### Using the release tarball (prebuilt, ready to use)

Download and extract the latest release (`hommerized.zip`) from the [release page](https://github.com/AntKinton/homerized/releases), rename the `assets/config.yml.dist` file to `assets/config.yml`, and put it behind a web server.

```sh
wget https://github.com/AntKinton/homerized/releases/latest/download/hommerized.zip
unzip hommerized.zip -d hommerized
cd hommerized
cp assets/config.yml.dist assets/config.yml
pnpx http-server # or python -m http.server 8010 or any web server.
```

### Build manually

```sh
pnpm install
pnpm build
```

Then your dashboard is ready to use in the `/dist` directory.


## Credits

- Original project: [Bastien's Homer](https://github.com/bastienwirtz/homer)
- My fork: [AntKinton's Hommerized](https://github.com/AntKinton/hommerized)