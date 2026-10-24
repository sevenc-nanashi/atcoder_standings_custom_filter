import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import packageJson from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: [
    monkey({
      entry: "src/index.ts",
      userscript: {
        name: "AtCoder Standings Custom Filter",
        version: packageJson.version,
        match: ["https://atcoder.jp/contests/*/standings*"],
        updateURL:
          "https://raw.githubusercontent.com/sevenc-nanashi/atcoder_standings_custom_filter/built/atcoder_standings_custom_filter.user.js",
        "inject-into": "page",
        sandbox: "raw",
      },
    }),
  ],
});
