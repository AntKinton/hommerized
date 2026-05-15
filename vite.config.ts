import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from "vite-plugin-pwa"
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import process from 'process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


import { version, basedOn } from "./package.json"

/**
 * Custom plugin to write version to dist/VERSION after build
 */
function writeVersionPlugin() {
  return {
    name: "write-version",
    closeBundle() {
      if (fs.existsSync("dist")) {
        fs.writeFileSync("dist/VERSION", version);
      }
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
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('vue') || id.includes('pinia')) {
                return 'vendor';
              }
              if (id.includes('bulma')) {
                return 'bulma';
              }
            }
          }
        }
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(version),
      __BASED_ON__: JSON.stringify(basedOn),
    },
    // CSS configuration to silence Dart Sass deprecation warnings
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['import', 'if-function', 'legacy-js-api']
        }
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@types": path.resolve(__dirname, "./src/types"),
        "@stores": path.resolve(__dirname, "./src/stores"),
        "@stores-ts": path.resolve(__dirname, "./src/stores/ts"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@services-ts": path.resolve(__dirname, "./src/services/ts"),
        "@composables": path.resolve(__dirname, "./src/composables"),
        "@composables-ts": path.resolve(__dirname, "./src/composables/ts"),
        "@utils-ts": path.resolve(__dirname, "./src/utils/ts")
      }
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      allowedHosts: env.VITE_ALLOWED_HOSTS
        ? env.VITE_ALLOWED_HOSTS.split(',')
        : ["localhost"],
      hmr: {
        overlay: true,
        port: 5173,
        // Dynamic HMR configuration based on environment
        ...(env.VITE_HMR_HOST && {
          clientPort: 443,
          host: env.VITE_HMR_HOST,
          protocol: 'wss'
        }),
        ...(!env.VITE_HMR_HOST && {
          clientPort: 5173,
          host: 'localhost'
        })
      },
      watch: {
        usePolling: false,
        interval: 100,
        ignored: ['**/node_modules/**', '**/dist/**']
      }
    },
    plugins: [
      writeVersionPlugin(),
      vue(),
      VitePWA({
        registerType: "autoUpdate",
        useCredentials: true,
        manifestFilename: "assets/manifest.json",
        devOptions: {
          enabled: true, // Enable PWA in dev to allow testing standalone mode
          type: 'module'
        },
        manifest: {
          name: "Hommerized dashboard",
          short_name: "Hommerized",
          description: "Home Server Dashboard",
          theme_color: "#1a1a1a",
          background_color: "#1a1a1a",
          start_url: "/",
          scope: "/",
          display: "standalone",
          icons: [
            {
              src: "/assets/icons/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable"
            },
            {
              src: "/assets/icons/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            },
          ],
        },
        workbox: {
          navigateFallback: null,
        },
      }),
    ],
  };
});
