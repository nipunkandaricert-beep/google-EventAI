import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Injects a strict Content-Security-Policy into production builds only (dev needs inline HMR scripts). */
function csp(proxyUrl?: string): Plugin {
  let connect = "'self' https://generativelanguage.googleapis.com";
  if (proxyUrl) {
    try {
      connect += ` ${new URL(proxyUrl).origin}`;
    } catch {
      /* ignore malformed proxy URL */
    }
  }
  const policy = `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src ${connect}; object-src 'none'; base-uri 'none'; form-action 'none'`;
  return {
    name: "inject-csp",
    apply: "build",
    transformIndexHtml: (html) =>
      html.replace("<head>", `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`),
  };
}

/** Split React runtime into a stable vendor chunk for long-term caching. */
const vendorModules = new Set(["react", "react-dom"]);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    plugins: [react(), tailwindcss(), csp(env.VITE_GEMINI_PROXY_URL)],
    base: "./",
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              for (const mod of vendorModules) {
                if (id.includes(`/${mod}/`) || id.includes(`\\${mod}\\`)) {
                  return "vendor";
                }
              }
            }
          },
        },
      },
    },
  };
});
