import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "url";
import fs from "fs";
import path from "path";
import process from "process";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

import { version, basedOn } from "./package.json";

function writeVersionPlugin() {
  return {
    name: "write-version",
    closeBundle() {
      fs.writeFileSync("dist/VERSION", version);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: "",
    build: {
      assetsDir: "resources",
    },
    define: {
      __APP_VERSION__: JSON.stringify(version),
      __BASED_ON__: JSON.stringify(basedOn),
    },
    server: {
        host: "0.0.0.0",
        port: 5173,
        allowedHosts: env.VITE_ALLOWED_HOSTS 
          ? env.VITE_ALLOWED_HOSTS.split(',') 
          : ["localhost"],
    },
  plugins: [
    writeVersionPlugin(),
    // Custom plugin to serve dummy-data JSON files without sourcemap injection
    {
      name: "dummy-data-json-handler",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith("/dummy-data/")) {
            // Remove query parameters from URL to get the actual file path
            const urlWithoutQuery = req.url.split("?")[0];
            const filePath = path.join(process.cwd(), urlWithoutQuery);

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              res.end(fs.readFileSync(filePath, "utf8"));
              return;
            }
          }
          next();
        });
      },
    },
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      useCredentials: true,
      manifestFilename: "assets/manifest.json",
      manifest: {
        name: "Hommerized dashboard",
        short_name: "Hommerized",
        description: "Home Server Dashboard",
        theme_color: "#3367D6",
        start_url: "../",
        scope: "../",
        icons: [
          {
            src: "./icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        navigateFallback: null,
      },
    }),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./node_modules", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  };
});
