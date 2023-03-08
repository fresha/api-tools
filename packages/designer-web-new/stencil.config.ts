import { Config } from '@stencil/core';
import type { Plugin } from "rollup";

// https://stenciljs.com/docs/config

// typescript package silently imports perf_hooks package
// which exists only in Node. To make ts-morph work inside
// the browser, we replace import with an empty object
const removePerfHooksImportFromTSToMakeItWorkInBrowser = () =>
  ({
    name: "noparse",
    enforce: "pre", // for vite plugin order
    buildStart: () => console.time("noparse"),
    buildEnd: () => console.timeEnd("noparse"),
    transform(code: string, id: string) {
      if (id.includes("@ts-morph/common/dist/typescript.js")) {
        const newCode = code.replace('require("perf_hooks")', '{}');
        return { code: newCode };
      }
    },
  } as Plugin);

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      // comment the following line to disable service workers in production
      serviceWorker: null,
      baseUrl: 'https://myapp.local/',
    },
  ],
  rollupPlugins: {
    before: [removePerfHooksImportFromTSToMakeItWorkInBrowser()],
  },
};
