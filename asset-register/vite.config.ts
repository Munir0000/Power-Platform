import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { powerApps } from "@microsoft/power-apps-vite/plugin"

const SAMPLE_DATA = fileURLToPath(new URL("./src/dev/sampleData.ts", import.meta.url));

/**
 * Dev-only: `npm run dev:sample` swaps the Dataverse data layer for sample data so
 * the screens can be reviewed without the Power Apps host. The plugin is only
 * registered for `vite serve --mode sample`, so builds never see the sample module.
 */
function sampleData(): Plugin {
  return {
    name: "asset-register-sample-data",
    enforce: "pre",
    resolveId(source, importer) {
      if (importer && importer !== SAMPLE_DATA && /\/data\/assetRegister(\.ts)?$/.test(source)) {
        return SAMPLE_DATA;
      }
      return null;
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react(), powerApps(), command === "serve" && mode === "sample" && sampleData()],
}));
